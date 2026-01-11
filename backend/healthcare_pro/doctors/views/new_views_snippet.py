
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_medical_history(request, patient_id):
    """
    Add a new medical history record for a patient
    """
    if request.user.role != 'doctor':
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = PatientProfile.objects.get(id=patient_id)
        # Verify access
        if not Appointment.objects.filter(doctor=doctor, patient=patient).exists():
            return Response({"error": "No access to this patient"}, status=status.HTTP_403_FORBIDDEN)
            
        condition = request.data.get('condition')
        if not condition:
            return Response({"error": "Condition is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        history = MedicalHistory.objects.create(
            patient=patient,
            condition=condition,
            description=request.data.get('description', ''),
            date=request.data.get('date') or timezone.now().date()
        )
        
        return Response({
            'id': str(history.id),
            'condition': history.condition,
            'diagnosed_date': history.date.strftime('%b %d, %Y'),
            'notes': history.description
        }, status=status.HTTP_201_CREATED)
        
    except (Doctor.DoesNotExist, PatientProfile.DoesNotExist):
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_allergy(request, patient_id):
    """
    Add a new allergy record for a patient
    """
    if request.user.role != 'doctor':
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = PatientProfile.objects.get(id=patient_id)
        if not Appointment.objects.filter(doctor=doctor, patient=patient).exists():
            return Response({"error": "No access to this patient"}, status=status.HTTP_403_FORBIDDEN)
            
        allergen = request.data.get('allergen')
        if not allergen:
            return Response({"error": "Allergen is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        allergy = Allergy.objects.create(
            patient=patient,
            allergen=allergen,
            severity=request.data.get('severity', 'Mild'),
            reaction=request.data.get('reaction', '')
        )
        
        return Response({
            'id': str(allergy.id),
            'allergen': allergy.allergen,
            'severity': allergy.severity,
            'reaction': allergy.reaction
        }, status=status.HTTP_201_CREATED)
        
    except (Doctor.DoesNotExist, PatientProfile.DoesNotExist):
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_medication(request, patient_id):
    """
    Add a new medication record for a patient
    """
    if request.user.role != 'doctor':
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = PatientProfile.objects.get(id=patient_id)
        if not Appointment.objects.filter(doctor=doctor, patient=patient).exists():
            return Response({"error": "No access to this patient"}, status=status.HTTP_403_FORBIDDEN)
            
        name = request.data.get('medication_name')
        if not name:
            return Response({"error": "Medication name is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        med = Medication.objects.create(
            patient=patient,
            medication_name=name,
            dosage=request.data.get('dosage', ''),
            frequency=request.data.get('frequency', ''),
            prescribed_date=timezone.now().date(),
            is_active=True
        )
        
        return Response({
            'id': str(med.id),
            'medication_name': med.medication_name,
            'dosage': med.dosage,
            'frequency': med.frequency,
            'prescribed_date': med.prescribed_date.strftime('%b %d, %Y')
        }, status=status.HTTP_201_CREATED)
        
    except (Doctor.DoesNotExist, PatientProfile.DoesNotExist):
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
