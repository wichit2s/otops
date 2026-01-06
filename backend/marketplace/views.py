import os
import json
import subprocess
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view

def index(request):
    return render(request, 'index.html')

def get_mcp_configs():
    """Discovers MCP configurations from common local paths."""
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
def mcp_info(request):
    configs = get_mcp_configs()
    servers_list = []
    
    # Simple process check
    try:
        ps_output = subprocess.check_output(['ps', 'aux']).decode('utf-8').lower()
    except Exception:
        ps_output = ""

    for name, config in configs.items():
        # Check if the server name or command is in running processes
        is_running = name.lower() in ps_output or (config.get("command") and config.get("command").lower() in ps_output)
        
        servers_list.append({
            "name": name,
            "status": "running" if is_running else "configured",
            "command": config.get("command"),
            "args": config.get("args", []),
            "tools": [], 
            "resources": []
        })
    
    # If no real servers found
    if not servers_list:
        servers_list.append({
            "name": "Local System Discovery",
            "status": "active",
            "tools": [{"name": "system_info", "description": "Local system data"}],
            "resources": []
        })

    return JsonResponse({"servers": servers_list})

@api_view(['POST'])
def mcp_add(request):
    name = request.data.get('name')
    command = request.data.get('command')
    args_str = request.data.get('args', '')
    
    if not name or not command:
        return JsonResponse({"error": "Name and command are required"}, status=400)
    
    # Parse args (assuming space-separated for now)
    import shlex
    args = shlex.split(args_str)
    
    config_path = os.path.expanduser('~/.gemini/antigravity/mcp_config.json')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(config_path), exist_ok=True)
    
    config = {"mcpServers": {}}
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
        except Exception:
            pass
            
    if 'mcpServers' not in config:
        config['mcpServers'] = {}
        
    config['mcpServers'][name] = {
        "command": command,
        "args": args,
        "env": {}
    }
    
    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        return JsonResponse({"status": "success", "message": f"Server {name} added"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

from rest_framework import viewsets
from .models import Category, Shop, Product, Order, OrderItem
from .serializers import (
    CategorySerializer, ShopSerializer, ProductSerializer, 
    OrderSerializer, OrderItemSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate

@api_view(['POST'])
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
    
    return Response({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=401)
        
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })

@api_view(['GET'])
def get_me(request):
    if not request.user.is_authenticated:
        return Response({"error": "Not authenticated"}, status=401)
        
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email
    })

@api_view(['POST'])
def mcp_run(request):
    name = request.data.get('name')
    if not name:
        return JsonResponse({"error": "Server name is required"}, status=400)
        
    configs = get_mcp_configs()
    config = configs.get(name)
    
    if not config:
        return JsonResponse({"error": "Server configuration not found"}, status=404)
        
    command = config.get('command')
    args = config.get('args', [])
    
    try:
        # Run in background
        subprocess.Popen([command] + args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return JsonResponse({
            "status": "success", 
            "message": f"Server {name} started in background. It may take a moment to appear as running."
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
