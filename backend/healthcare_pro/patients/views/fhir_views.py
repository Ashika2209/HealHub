from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponseForbidden, Http404
from django.shortcuts import get_object_or_404
from ..models import PatientProfile
from appointments.models import Appointment
from ..fhir_utils import generate_patient_bundle

def is_doctor_or_admin(user):
    return user.is_authenticated and (user.role == 'doctor' or user.role == 'admin')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_patient_fhir(request, patient_id):
    """
    Export patient data as a FHIR Bundle JSON.
    Only accessible by Doctors and Admins.
    """
    if not is_doctor_or_admin(request.user):
        return Response({"error": "You do not have permission to export patient data."}, status=403)

    try:
        # Get patient profile by UUID (using patient_id passed from URL)
        # Note: The URL parameter is expected to be the PatientProfile UUID
        patient_profile = get_object_or_404(PatientProfile, id=patient_id)
        
        # Fetch appointments for this patient
        # We fetch all appointments for a comprehensive history
        appointments = Appointment.objects.filter(patient=patient_profile).select_related('doctor', 'doctor__user', 'patient', 'patient__user')
        
        # Generate Bundle
        fhir_bundle = generate_patient_bundle(patient_profile, appointments)
        
        # Return JSON with specific FHIR content type
        # Ideally using Response object for DRF, but we want to set specific headers for file download easily
        from django.http import JsonResponse
        response = JsonResponse(fhir_bundle, json_dumps_params={'indent': 2})
        response['Content-Type'] = 'application/fhir+json'
        response['Content-Disposition'] = f'attachment; filename="patient_{patient_profile.user.first_name}_{patient_profile.user.last_name}_fhir.json"'
        return response

    except Exception as e:
        return Response({"error": str(e)}, status=500)
