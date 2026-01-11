import os
import django
from datetime import date, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from patients.models import PatientProfile, MedicalHistory, Allergy, Medication

def populate_data():
    # Find patient MURULI P
    patient = PatientProfile.objects.filter(user__first_name__icontains='MURULI').first()
    if not patient:
        print("Patient 'MURULI P' not found. Please ensure the patient exists.")
        return

    print(f"Adding medical data for: {patient.user.get_full_name()}")

    # 1. Add Medical History
    history_items = [
        ("Hypertension", "Diagnosed 2 years ago. Managed with diet and medication."),
        ("Mild Asthma", "Occasional inhaler use during winter.")
    ]
    for condition, desc in history_items:
        MedicalHistory.objects.get_or_create(
            patient=patient,
            condition=condition,
            defaults={
                'description': desc,
                'date': date.today() - timedelta(days=700)
            }
        )
    print(f"Added {len(history_items)} medical history records.")

    # 2. Add Allergies
    allergy_items = [
        ("Peanuts", "Severe", "Anaphylaxis"),
        ("Penicillin", "Moderate", "Skin Rash")
    ]
    for allergen, severity, reaction in allergy_items:
        Allergy.objects.get_or_create(
            patient=patient,
            allergen=allergen,
            defaults={
                'severity': severity,
                'reaction': reaction
            }
        )
    print(f"Added {len(allergy_items)} allergy records.")

    # 3. Add Medications
    med_items = [
        ("Lisinopril", "10mg", "Daily"),
        ("Albuterol Inhaler", "2 puffs", "As needed")
    ]
    for name, dosage, freq in med_items:
        Medication.objects.get_or_create(
            patient=patient,
            medication_name=name,
            defaults={
                'dosage': dosage,
                'frequency': freq,
                'prescribed_date': date.today() - timedelta(days=30),
                'is_active': True
            }
        )
    print(f"Added {len(med_items)} medication records.")
    print("Done! Refresh the page to see the changes.")

if __name__ == '__main__':
    populate_data()
