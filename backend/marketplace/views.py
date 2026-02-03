import os
import json
import subprocess
import random
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db.models import Avg, Count
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Shop, Product, Order, OrderItem, Review, Status
from .serializers import (
    CategorySerializer, ShopSerializer, ProductSerializer, 
    OrderSerializer, OrderItemSerializer, ReviewSerializer,
    UserSerializer
)

def index(request):
    return render(request, 'index.html')

# --- MCP Tool Discovery Helpers (kept from original) ---
def get_mcp_configs():
    paths = [
        os.path.expanduser('~/.gemini/antigravity/mcp_config.json'),
        os.path.expanduser('~/Library/Application Support/Claude/mcp_config.json'),
        os.path.expanduser('~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/mcp_settings.json'),
    ]
    all_servers = {}
    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    config = json.load(f)
                    servers = config.get('mcpServers', {})
                    all_servers.update(servers)
            except Exception:
                continue
    return all_servers

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def mcp_info(request):
    configs = get_mcp_configs()
    servers_list = []
    try:
        ps_output = subprocess.check_output(['ps', 'aux']).decode('utf-8').lower()
    except Exception:
        ps_output = ""
    for name, config in configs.items():
        is_running = name.lower() in ps_output or (config.get("command") and config.get("command").lower() in ps_output)
        servers_list.append({
            "name": name,
            "status": "running" if is_running else "configured",
            "command": config.get("command"),
            "args": config.get("args", []),
            "tools": [], 
            "resources": []
        })
    return JsonResponse({"servers": servers_list})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def mcp_add(request):
    name = request.data.get('name')
    command = request.data.get('command')
    args_str = request.data.get('args', '')
    if not name or not command:
        return JsonResponse({"error": "Name and command are required"}, status=400)
    import shlex
    args = shlex.split(args_str)
    config_path = os.path.expanduser('~/.gemini/antigravity/mcp_config.json')
    os.makedirs(os.path.dirname(config_path), exist_ok=True)
    config = {"mcpServers": {}}
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
        except Exception:
            pass
    config.setdefault('mcpServers', {})[name] = {"command": command, "args": args, "env": {}}
    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        return JsonResponse({"status": "success", "message": f"Server {name} added"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def mcp_run(request):
    name = request.data.get('name')
    if not name: return JsonResponse({"error": "Server name is required"}, status=400)
    configs = get_mcp_configs()
    config = configs.get(name)
    if not config: return JsonResponse({"error": "Server configuration not found"}, status=404)
    try:
        subprocess.Popen([config.get('command')] + config.get('args', []), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return JsonResponse({"status": "success", "message": f"Server {name} started"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# --- Marketplace ViewSets ---

class PublicReadOnlyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()

class CategoryViewSet(PublicReadOnlyViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ShopViewSet(PublicReadOnlyViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'owner']

class ProductViewSet(PublicReadOnlyViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'shop']

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def popular(self, request):
        # Join with reviews to get average rating, order by it
        queryset = self.get_queryset().annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).filter(review_count__gt=0).order_by('-avg_rating', '-review_count')[:10]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def recommended(self, request):
        # Random sample of products for now
        ids = list(self.get_queryset().values_list('id', flat=True))
        if len(ids) > 10:
            random_ids = random.sample(ids, 10)
        else:
            random_ids = ids
        queryset = self.get_queryset().filter(id__in=random_ids)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        # Return only the user's orders
        return self.queryset.filter(customer=self.request.user)

class OrderItemViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        # Extended validation for ratings
        customer = request.user
        order_id = request.data.get('order')
        product_id = request.data.get('product')
        shop_id = request.data.get('shop')

        try:
            order = Order.objects.get(id=order_id, customer=customer)
        except Order.DoesNotExist:
            return Response({"error": "Order not found or not yours."}, status=status.HTTP_400_BAD_REQUEST)

        # check if order is completed
        if order.status and order.status.name != 'COMPLETED':
             return Response({"error": "You can only rate completed orders."}, status=status.HTTP_403_FORBIDDEN)

        # check if product/shop is in the order
        if product_id:
            if not OrderItem.objects.filter(order=order, product_id=product_id).exists():
                 return Response({"error": "This product was not in the specified order."}, status=status.HTTP_400_BAD_REQUEST)
        
        if shop_id:
            if not OrderItem.objects.filter(order=order, shop_id=shop_id).exists():
                 return Response({"error": "This shop was not in the specified order."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=customer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# --- Auth ---

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)
    user = User.objects.create_user(username=username, password=password, email=email)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": {"id": user.id, "username": user.username, "email": user.email}})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=401)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": {"id": user.id, "username": user.username, "email": user.email}})

@api_view(['GET'])
def get_me(request):
    if not request.user.is_authenticated:
        return Response({"error": "Not authenticated"}, status=401)
    return Response({"id": request.user.id, "username": request.user.username, "email": request.user.email})
