from rest_framework import serializers
from .models import Category, Shop, Product, Order, OrderItem, Status, Review
from django.contrib.auth.models import User
from django.db.models import Avg

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

class ReviewSerializer(serializers.ModelSerializer):
    customer_username = serializers.ReadOnlyField(source='customer.username')
    product_name = serializers.ReadOnlyField(source='product.name')
    shop_name = serializers.ReadOnlyField(source='shop.name')

    class Meta:
        model = Review
        fields = [
            'id', 'customer', 'customer_username', 'order', 
            'product', 'product_name', 'shop', 'shop_name', 
            'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['customer', 'created_at']

class ShopSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    owner_username = serializers.ReadOnlyField(source='owner.username')
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = ['id', 'name', 'category', 'category_name', 'owner', 'owner_username', 'description', 'avg_rating']

    def get_avg_rating(self, obj):
        res = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(res, 1) if res else 0

class ProductSerializer(serializers.ModelSerializer):
    shop_name = serializers.ReadOnlyField(source='shop.name')
    category_name = serializers.ReadOnlyField(source='category.name')
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'shop', 'shop_name', 'category', 'category_name', 'price', 'description', 'stock', 'avg_rating', 'review_count']

    def get_avg_rating(self, obj):
        res = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(res, 1) if res else 0

    def get_review_count(self, obj):
        return obj.reviews.count()

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
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_username', 'status', 'status_name', 'total_price', 'created_at', 'items', 'reviews']
