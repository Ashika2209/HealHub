from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from ..models import Doctor, Hospital

@api_view(['GET'])
@permission_classes([AllowAny])
def chatbot_search(request):
    """
    Search for doctors across hospitals and provide suggestions.
    Query params:
    - q: search term (doctor name or specialization)
    - hospital_id: (optional) ID of the current hospital context
    """
    query = request.GET.get('q', '').lower().strip()
    current_hospital_id = request.GET.get('hospital_id', None)
    
    if not query:
        return Response({"message": "Please provide a search term.", "results": []})

    # Symptom Mapping
    SYMPTOM_MAP = {
        # Cardiology
        'heart': 'cardiology', 'chest': 'cardiology', 'cardiac': 'cardiology', 
        'palpitation': 'cardiology', 'breath': 'cardiology', 'bp': 'cardiology',
        
        # Neurology
        'head': 'neurology', 'brain': 'neurology', 'nerve': 'neurology',
        'dizzy': 'neurology', 'seizure': 'neurology', 'stroke': 'neurology',
        'migraine': 'neurology',
        
        # Orthopedics
        'bone': 'orthopedics', 'fracture': 'orthopedics', 'joint': 'orthopedics',
        'knee': 'orthopedics', 'back': 'orthopedics', 'spine': 'orthopedics',
        'muscle': 'orthopedics', 'walking': 'orthopedics', 'swelling': 'orthopedics',
        'leg': 'orthopedics', 'arm': 'orthopedics',
        
        # Dermatology
        'skin': 'dermatology', 'rash': 'dermatology', 'itch': 'dermatology',
        'hair': 'dermatology', 'acne': 'dermatology', 'spot': 'dermatology',
        
        # Pediatrics
        'child': 'pediatrics', 'baby': 'pediatrics', 'infant': 'pediatrics',
        'growth': 'pediatrics',
        
        # Psychiatry
        'mind': 'psychiatry', 'mental': 'psychiatry', 'depression': 'psychiatry',
        'anxiety': 'psychiatry', 'sad': 'psychiatry', 'stress': 'psychiatry',
        'sleep': 'psychiatry',
        
        # Oncology
        'cancer': 'oncology', 'tumor': 'oncology', 'lump': 'oncology',
        
        # Endocrinology (Diabetes, Thyroid)
        'thirsty': 'endocrinology', 'thirst': 'endocrinology', 'drinking': 'endocrinology',
        'urine': 'endocrinology', 'urination': 'endocrinology', 'toilet': 'endocrinology',
        'fatigue': 'endocrinology', 'tired': 'endocrinology', 'weight': 'endocrinology',
        'sugar': 'endocrinology', 'diabetes': 'endocrinology', 'insulin': 'endocrinology',
        
        # General/Others (Mapping unknown symptoms to General Medicine)
        'fever': 'general_medicine', 'cold': 'general_medicine', 'flu': 'general_medicine',
        'cough': 'general_medicine', 'stomach': 'general_medicine', 'pain': 'general_medicine',
        'vomit': 'general_medicine', 'diarrhea': 'general_medicine',
        'eye': 'general_medicine', 'vision': 'general_medicine', 'blur': 'general_medicine', # Mapping eye to GenMed as matching Opthalmology isn't seeded
        'ear': 'general_medicine', 'throat': 'general_medicine',
        'weak': 'general_medicine', 'tired': 'general_medicine',
    }
    
    # Check if query matches a symptom
    mapped_specialization = None
    suggestion_text = ""
    
    for symptom, specialization in SYMPTOM_MAP.items():
        if symptom in query:
            mapped_specialization = specialization
            suggestion_text = f"Based on your symptom '{query}', we recommend a specialist in {specialization.replace('_', ' ').title()}."
            break
            
    # Search doctors matching the query OR mapped specialization
    search_query = Q(user__first_name__icontains=query) | \
                   Q(user__last_name__icontains=query) | \
                   Q(specialization__icontains=query) | \
                   Q(department__icontains=query)
                   
    if mapped_specialization:
        search_query |= Q(specialization__icontains=mapped_specialization)

    doctors = Doctor.objects.filter(search_query, is_available=True).distinct()

    if not doctors.exists():
        return Response({
            "match_type": "not_found",
            "message": f"Sorry, no doctors found for '{query}'.",
            "results": []
        })

    # If current_hospital_id is provided, detailed logic
    current_hospital_matches = []
    other_hospital_matches = []
    multi_hospital_matches = []

    for doctor in doctors:
        doc_hospitals = doctor.hospitals.all()
        doc_data = {
            "name": f"Dr. {doctor.user.get_full_name()}",
            "specialization": doctor.specialization,
            "hospitals": [h.name for h in doc_hospitals],
            "id": doctor.doctor_id
        }

        if current_hospital_id:
            in_current = any(str(h.id) == current_hospital_id for h in doc_hospitals)
            if in_current:
                # Check if also in others
                if len(doc_hospitals) > 1:
                    multi_hospital_matches.append(doc_data)
                else:
                    current_hospital_matches.append(doc_data)
            else:
                other_hospital_matches.append(doc_data)
        else:
            # No context, just list specific lists ?? 
            # Actually if no context, just return all
            current_hospital_matches.append(doc_data)

    results = {
        "match_type": "mixed", 
        "current_hospital": current_hospital_matches,
        "other_hospitals": other_hospital_matches,
        "multi_hospital": multi_hospital_matches
    }

    # Construct Message
    message = ""
    if current_hospital_id:
        if current_hospital_matches:
            message = f"Found {len(current_hospital_matches)} doctor(s) in this hospital."
        
        if multi_hospital_matches:
             message += f" Found {len(multi_hospital_matches)} doctor(s) available in BOTH this and other hospitals. You can choose!"

        if other_hospital_matches:
            if not current_hospital_matches and not multi_hospital_matches:
                message = f"Dr. not found in this hospital. However, we found {len(other_hospital_matches)} match(es) in other hospitals."
            else:
                message += f" Also found {len(other_hospital_matches)} match(es) in other hospitals."
    else:
        message = f"Found {len(doctors)} doctors matching '{query}'."

    if suggestion_text:
        message = suggestion_text + " " + message

    return Response({
        "match_type": "success",
        "message": message,
        "data": results
    })
