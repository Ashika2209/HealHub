from django.urls import path
from .views import PatientProfileView, PatientAppointmentsListView, PatientMedicalRecordsListView

urlpatterns = [
    path('profile/', PatientProfileView.as_view(), name='patient-profile'),
    path('appointments/', PatientAppointmentsListView.as_view(), name='patient-appointments'),
    path('records/', PatientMedicalRecordsListView.as_view(), name='patient-records'),
]
