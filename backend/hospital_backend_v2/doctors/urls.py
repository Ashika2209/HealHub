from django.urls import path
from .views import DoctorProfileView, DoctorAppointmentsListView, AppointmentUpdateStatusView, PatientRecordsView

urlpatterns = [
    path('profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('appointments/', DoctorAppointmentsListView.as_view(), name='doctor-appointments'),
    path('appointments/<int:id>/', AppointmentUpdateStatusView.as_view(), name='update-appointment-status'),
    path('patient/<int:patient_id>/records/', PatientRecordsView.as_view(), name='view-patient-records'),
]
