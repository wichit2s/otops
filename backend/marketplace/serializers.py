from rest_framework import serializers
from .models import Category, Shop, Product, Order, OrderItem, Status
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['id', 'name', 'description']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ShopSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Shop
        fields = ['id', 'name', 'category', 'category_name', 'owner', 'owner_username', 'description']

class ProductSerializer(serializers.ModelSerializer):
    shop_name = serializers.ReadOnlyField(source='shop.name')
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = ['id', 'name', 'shop', 'shop_name', 'category', 'category_name', 'price', 'description', 'stock']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    shop_name = serializers.ReadOnlyField(source='shop.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'shop', 'shop_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.ReadOnlyField(source='customer.username')
    status_name = serializers.ReadOnlyField(source='status.name')

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_username', 'status', 'status_name', 'total_price', 'created_at', 'items']
