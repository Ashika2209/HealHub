from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    Includes roles for Doctor, Patient, and Admin.
    """
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # email is already in AbstractUser, but we might want to enforce uniqueness more strictly or use it as USERNAME_FIELD
    email = models.EmailField(unique=True, verbose_name='email address')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name'] # username is required by AbstractUser

    def __str__(self):
        return f"{self.email} ({self.role})"
