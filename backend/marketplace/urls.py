from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'shops', views.ShopViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'order-items', views.OrderItemViewSet)
router.register(r'reviews', views.ReviewViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('api/', include(router.urls)),
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/me/', views.get_me, name='get_me'),
    path('api/mcp/info/', views.mcp_info, name='mcp_info'),
    path('api/mcp/add/', views.mcp_add, name='mcp_add'),
    path('api/mcp/run/', views.mcp_run, name='mcp_run'),
]
