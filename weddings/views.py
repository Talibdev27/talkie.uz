from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from django.db import transaction
from .models import User, Wedding, Guest, Photo, GuestBookEntry
from .serializers import (
    UserSerializer, WeddingSerializer, GuestSerializer, 
    PhotoSerializer, GuestBookEntrySerializer, UserRegistrationSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class WeddingViewSet(viewsets.ModelViewSet):
    queryset = Wedding.objects.all()
    serializer_class = WeddingSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Wedding.objects.all()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    permission_classes = [AllowAny]

class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [AllowAny]

class GuestBookEntryViewSet(viewsets.ModelViewSet):
    queryset = GuestBookEntry.objects.all()
    serializer_class = GuestBookEntrySerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
def register_user_and_create_wedding(request):
    """Combined registration and wedding creation endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        with transaction.atomic():
            # Create user
            user_data = {
                'username': serializer.validated_data['email'],
                'email': serializer.validated_data['email'],
                'first_name': serializer.validated_data['name'].split(' ')[0],
                'last_name': ' '.join(serializer.validated_data['name'].split(' ')[1:]),
                'password': serializer.validated_data['password']
            }
            user_serializer = UserSerializer(data=user_data)
            if user_serializer.is_valid():
                user = user_serializer.save()
                
                # Create wedding
                wedding_data = {
                    'user': user.id,
                    'bride': serializer.validated_data['bride'],
                    'groom': serializer.validated_data['groom'],
                    'wedding_date': serializer.validated_data['wedding_date'],
                    'venue': serializer.validated_data['venue'],
                    'venue_address': serializer.validated_data['venue_address'],
                    'story': serializer.validated_data.get('story', ''),
                    'template': serializer.validated_data.get('template', 'gardenRomance'),
                    'primary_color': serializer.validated_data.get('primary_color', '#D4B08C'),
                    'accent_color': serializer.validated_data.get('accent_color', '#89916B'),
                    'is_public': serializer.validated_data.get('is_public', True)
                }
                wedding_serializer = WeddingSerializer(data=wedding_data)
                if wedding_serializer.is_valid():
                    wedding = wedding_serializer.save()
                    
                    return Response({
                        'user': UserSerializer(user).data,
                        'wedding': WeddingSerializer(wedding).data,
                        'message': 'Registration and wedding creation successful!'
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response(wedding_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_wedding_by_url(request, unique_url):
    """Get wedding by unique URL"""
    try:
        wedding = Wedding.objects.get(unique_url=unique_url)
        return Response(WeddingSerializer(wedding).data)
    except Wedding.DoesNotExist:
        return Response({'error': 'Wedding not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_photos_by_wedding(request, wedding_id):
    """Get photos by wedding ID"""
    photos = Photo.objects.filter(wedding_id=wedding_id)
    return Response(PhotoSerializer(photos, many=True).data)

@api_view(['GET'])
def get_guest_book_by_wedding(request, wedding_id):
    """Get guest book entries by wedding ID"""
    entries = GuestBookEntry.objects.filter(wedding_id=wedding_id)
    return Response(GuestBookEntrySerializer(entries, many=True).data)

@api_view(['GET'])
def get_weddings_by_user(request, user_id):
    """Get weddings by user ID"""
    weddings = Wedding.objects.filter(user_id=user_id)
    return Response(WeddingSerializer(weddings, many=True).data)