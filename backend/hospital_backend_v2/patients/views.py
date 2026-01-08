from rest_framework import generics, permissions
from .models import PatientProfile, MedicalRecord
from .serializers import PatientProfileSerializer, MedicalRecordSerializer
from accounts.permissions import IsPatient
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer

class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_object(self):
        profile, created = PatientProfile.objects.get_or_create(user=self.request.user)
        return profile

class PatientAppointmentsListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)

class PatientMedicalRecordsListView(generics.ListAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_queryset(self):
        return MedicalRecord.objects.filter(patient=self.request.user)
