from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Wedding(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weddings')
    unique_url = models.CharField(max_length=50, unique=True)
    bride = models.CharField(max_length=100)
    groom = models.CharField(max_length=100)
    wedding_date = models.DateTimeField()
    venue = models.CharField(max_length=200)
    venue_address = models.CharField(max_length=500)
    venue_coordinates = models.JSONField(null=True, blank=True)
    story = models.TextField(blank=True)
    template = models.CharField(max_length=50, default='gardenRomance')
    primary_color = models.CharField(max_length=7, default='#D4B08C')
    accent_color = models.CharField(max_length=7, default='#89916B')
    background_music_url = models.URLField(null=True, blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.unique_url:
            self.unique_url = str(uuid.uuid4()).replace('-', '')[:12]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bride} & {self.groom}"

class Guest(models.Model):
    RSVP_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
        ('maybe', 'Maybe'),
    ]
    
    wedding = models.ForeignKey(Wedding, on_delete=models.CASCADE, related_name='guests')
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=300, null=True, blank=True)
    rsvp_status = models.CharField(max_length=10, choices=RSVP_CHOICES, default='pending')
    plus_one = models.BooleanField(default=False)
    plus_one_name = models.CharField(max_length=100, null=True, blank=True)
    dietary_restrictions = models.TextField(null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    table_number = models.IntegerField(null=True, blank=True)
    gift_received = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    invitation_sent = models.BooleanField(default=False)
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.wedding}"

class Photo(models.Model):
    wedding = models.ForeignKey(Wedding, on_delete=models.CASCADE, related_name='photos')
    url = models.CharField(max_length=500)
    caption = models.CharField(max_length=200, null=True, blank=True)
    is_hero = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.wedding}"

class GuestBookEntry(models.Model):
    wedding = models.ForeignKey(Wedding, on_delete=models.CASCADE, related_name='guest_book_entries')
    guest_name = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.guest_name}"
