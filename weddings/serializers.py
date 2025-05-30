from rest_framework import serializers
from .models import User, Wedding, Guest, Photo, GuestBookEntry

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class WeddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wedding
        fields = '__all__'
        read_only_fields = ['unique_url', 'created_at']

class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = '__all__'
        read_only_fields = ['created_at']

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'
        read_only_fields = ['uploaded_at']

class GuestBookEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestBookEntry
        fields = '__all__'
        read_only_fields = ['created_at']

class UserRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    confirm_password = serializers.CharField(min_length=6)
    
    # Wedding fields
    bride = serializers.CharField(max_length=100)
    groom = serializers.CharField(max_length=100)
    wedding_date = serializers.DateTimeField()
    venue = serializers.CharField(max_length=200)
    venue_address = serializers.CharField(max_length=500)
    story = serializers.CharField(required=False, allow_blank=True)
    template = serializers.CharField(default='gardenRomance')
    primary_color = serializers.CharField(default='#D4B08C')
    accent_color = serializers.CharField(default='#89916B')
    is_public = serializers.BooleanField(default=True)
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value