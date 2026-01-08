from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.username')
    doctor_name = serializers.ReadOnlyField(source='doctor.username')

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'date', 'time', 'status']
        read_only_fields = ['patient', 'doctor']
