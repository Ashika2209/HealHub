from django.db import models
from django.conf import settings
import uuid

class Branch(models.Model):
    """
    Represents a hospital branch.
    Doctors are assigned to a branch.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField()
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Branches"


class Doctor(models.Model):
    """
    Represents a Doctor profile using a OneToOne relationship with the User model.
    Linked to a specific Branch.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, related_name='doctors')
    
    specialization = models.CharField(max_length=255)
    qualification = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField(default=0)
    availability_status = models.BooleanField(default=True, help_text="Is the doctor currently available for appointments?")
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"
