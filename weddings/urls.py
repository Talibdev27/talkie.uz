from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'weddings', views.WeddingViewSet)
router.register(r'guests', views.GuestViewSet)
router.register(r'photos', views.PhotoViewSet)
router.register(r'guest-book', views.GuestBookEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('get-started/', views.register_user_and_create_wedding, name='register_and_create_wedding'),
    path('weddings/url/<str:unique_url>/', views.get_wedding_by_url, name='get_wedding_by_url'),
    path('photos/wedding/<int:wedding_id>/', views.get_photos_by_wedding, name='get_photos_by_wedding'),
    path('guest-book/wedding/<int:wedding_id>/', views.get_guest_book_by_wedding, name='get_guest_book_by_wedding'),
    path('weddings/user/<int:user_id>/', views.get_weddings_by_user, name='get_weddings_by_user'),
]