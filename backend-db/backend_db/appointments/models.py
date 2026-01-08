from django.db import models
from django.conf import settings
import uuid

class Appointment(models.Model):
    """
    Represents an appointment between a Doctor and a Patient.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Using settings.AUTH_USER_MODEL to link directly to User
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments_as_patient')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments_as_doctor')
    
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} on {self.date} at {self.time}"

    class Meta:
        ordering = ['-date', '-time']
