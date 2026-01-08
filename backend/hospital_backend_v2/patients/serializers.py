from rest_framework import serializers
from .models import PatientProfile, MedicalRecord

class PatientProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = PatientProfile
        fields = ['id', 'username', 'email', 'age', 'gender', 'blood_group']

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.username')
    doctor_name = serializers.ReadOnlyField(source='doctor.username')

    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'disease', 'prescription', 'created_at']
        read_only_fields = ['patient', 'doctor', 'created_at']
