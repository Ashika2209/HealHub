import uuid
from datetime import datetime
from django.conf import settings
from django.utils import timezone

def generate_patient_fhir(patient_profile):
    """
    Converts a PatientProfile model instance into a FHIR Patient resource.
    """
    user = patient_profile.user
    
    # Construct mappings
    gender_map = {'M': 'male', 'F': 'female', 'O': 'other'}
    fhir_gender = gender_map.get(patient_profile.gender, 'unknown')

    resource = {
        "resourceType": "Patient",
        "id": str(patient_profile.user.id),  # Using User ID as stable FHIR ID
        "meta": {
            "profile": ["http://hl7.org/fhir/StructureDefinition/Patient"],
            "lastUpdated": (patient_profile.updated_at if timezone.is_aware(patient_profile.updated_at) else timezone.make_aware(patient_profile.updated_at)).isoformat() if patient_profile.updated_at else None
        },
        "text": {
            "status": "generated",
            "div": f"<div xmlns=\"http://www.w3.org/1999/xhtml\">Patient: {user.get_full_name()}</div>"
        },
        "identifier": [
            {
                "use": "usual",
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                            "code": "MR",
                            "display": "Medical Record Number"
                        }
                    ]
                },
                "system": "http://hospital-dev.com/identifiers/mrn",
                "value": str(patient_profile.id)
            }
        ],
        "active": user.is_active,
        "name": [
            {
                "use": "official",
                "family": user.last_name,
                "given": [user.first_name]
            }
        ],
        "telecom": [
            {
                "system": "email",
                "value": user.email,
                "use": "home"
            }
        ],
        "gender": fhir_gender,
        "address": []
    }

    if patient_profile.date_of_birth:
        resource["birthDate"] = patient_profile.date_of_birth.isoformat()

    if patient_profile.phone_number:
        resource["telecom"].append({
            "system": "phone",
            "value": patient_profile.phone_number,
            "use": "mobile"
        })

    # Add address if available
    address_line = patient_profile.address
    if address_line or patient_profile.city or patient_profile.state or patient_profile.zip_code:
        addr = {
            "use": "home",
            "type": "physical",
            "line": [address_line] if address_line else [],
            "city": patient_profile.city,
            "state": patient_profile.state,
            "postalCode": patient_profile.zip_code
        }
        # Remove None values
        addr = {k: v for k, v in addr.items() if v}
        resource["address"].append(addr)

    return resource


def generate_encounter_fhir(appointment):
    """
    Converts an Appointment model instance into a FHIR Encounter resource.
    """
    
    status_map = {
        'scheduled': 'planned',
        'confirmed': 'planned',
        'in_progress': 'in-progress',
        'completed': 'finished',
        'cancelled': 'cancelled',
        'no_show': 'cancelled',
        'rescheduled': 'planned'
    }
    
    fhir_status = status_map.get(appointment.status, 'unknown')
    
    doctor_name = appointment.doctor.user.get_full_name()
    patient_name = appointment.patient.user.get_full_name()

    resource = {
        "resourceType": "Encounter",
        "id": str(appointment.id),
        "status": fhir_status,
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
        },
        "subject": {
            "reference": f"Patient/{appointment.patient.user.id}",
            "display": patient_name
        },
        "participant": [
            {
                "type": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                "code": "PPRF",
                                "display": "primary performer"
                            }
                        ]
                    }
                ],
                "individual": {
                    "reference": f"Practitioner/{appointment.doctor.id}",
                    "display": f"Dr. {doctor_name}"
                }
            }
        ],
        "period": {
            "start": (appointment.appointment_datetime if timezone.is_aware(appointment.appointment_datetime) else timezone.make_aware(appointment.appointment_datetime)).isoformat(),
            "end": timezone.make_aware(datetime.combine(appointment.appointment_date, appointment.end_time)).isoformat()
        },
        "text": {
            "status": "generated",
            "div": f"<div xmlns=\"http://www.w3.org/1999/xhtml\">Encounter with Dr. {doctor_name}</div>"
        }
    }
    
    # Add type/reason
    if appointment.appointment_type:
         resource["type"] = [
            {
                "text": appointment.get_appointment_type_display()
            }
        ]
        
    if appointment.chief_complaint:
        resource["reasonCode"] = [
            {
                "text": appointment.chief_complaint
            }
        ]

    return resource


def generate_medication_statement_fhir(medication):
    """
    Converts a Medication model instance into a FHIR MedicationStatement resource.
    """
    status = "active" if medication.is_active else "completed"
    
    resource = {
        "resourceType": "MedicationStatement",
        "id": str(medication.id),
        "status": status,
        "subject": {
            "reference": f"Patient/{medication.patient.user.id}",
            "display": medication.patient.user.get_full_name()
        },
        "dateAsserted": medication.prescribed_date.isoformat(),
        "medicationCodeableConcept": {
            "text": medication.medication_name
        },
        "dosage": [
            {
                "text": f"{medication.dosage} - {medication.frequency}"
            }
        ],
        "text": {
            "status": "generated",
            "div": f"<div xmlns=\"http://www.w3.org/1999/xhtml\">Medication: {medication.medication_name}</div>"
        }
    }
    
    if medication.condition:
        resource["reasonCode"] = [
            {
                "text": medication.condition
            }
        ]
        
    if medication.notes:
        resource["note"] = [
            {
                "text": medication.notes
            }
        ]
        
    return resource


def generate_patient_bundle(patient_profile, appointments=None):
    """
    Creates a FHIR Bundle containing the Patient resource, Encounters, and MedicationStatements.
    """
    patient_resource = generate_patient_fhir(patient_profile)
    
    entries = [
        {
            "fullUrl": f"urn:uuid:{patient_resource['id']}",
            "resource": patient_resource
        }
    ]
    
    if appointments:
        for appt in appointments:
            encounter_resource = generate_encounter_fhir(appt)
            entries.append({
                "fullUrl": f"urn:uuid:{encounter_resource['id']}",
                "resource": encounter_resource
            })
            
    # Add Medications
    medications = patient_profile.patient_medications.all()
    for med in medications:
        med_resource = generate_medication_statement_fhir(med)
        entries.append({
            "fullUrl": f"urn:uuid:{med_resource['id']}",
            "resource": med_resource
        })
            
    bundle = {
        "resourceType": "Bundle",
        "id": str(uuid.uuid4()),
        "meta": {
            "lastUpdated": timezone.now().isoformat()
        },
        "type": "collection",
        "entry": entries
    }
    
    return bundle
