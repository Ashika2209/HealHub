from rest_framework import generics, permissions
from .models import DoctorProfile
from .serializers import DoctorProfileSerializer
from accounts.permissions import IsDoctor
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from patients.models import MedicalRecord
from patients.serializers import MedicalRecordSerializer

class DoctorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_object(self):
        profile, created = DoctorProfile.objects.get_or_create(user=self.request.user)
        return profile

class DoctorAppointmentsListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        return Appointment.objects.filter(doctor=self.request.user)

class AppointmentUpdateStatusView(generics.UpdateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    lookup_field = 'id'

    def get_queryset(self):
        return Appointment.objects.filter(doctor=self.request.user)

class PatientRecordsView(generics.ListAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return MedicalRecord.objects.filter(patient_id=patient_id)
