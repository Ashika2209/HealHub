from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from doctors.models import Doctor, Hospital
from datetime import date
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with hospitals and doctors'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data for 6 branches...')

        # Cleanup legacy data
        Hospital.objects.filter(name__in=["City Hospital A", "City Hospital B"]).delete()

        # Define Branches
        locations = ["Bangalore", "Mysore", "Tiptur", "Virajpet", "Mandya", "Tumkur"]
        hospitals = []
        
        for loc in locations:
            h, _ = Hospital.objects.get_or_create(
                name=f"{loc} Branch",
                defaults={
                    "address": f"Main Road, {loc}",
                    "city": loc,
                    "state": "Karnataka",
                    "contact_number": f"080-{random.randint(1000000, 9999999)}"
                }
            )
            hospitals.append(h)
        
        self.stdout.write(f'Created/Retrieved {len(hospitals)} Hospitals.')

        all_specializations = [
            'cardiology', 'neurology', 'pediatrics', 'orthopedics', 'dermatology',
            'general_medicine', 'emergency_medicine', 'oncology', 'psychiatry', 'radiology', 'endocrinology'
        ]

        # Distribute doctors
        # Strategy: Each branch gets 10 doctors.
        # But we want to simulate gaps. e.g., Bangalore has NO Cardiology, Mysore has Cardiology.
        
        # Branch 0: Bangalore (No Cardiology, No Endocrinology)
        specs_bangalore = list(set(all_specializations) - {'cardiology', 'endocrinology'})
        self.create_doctors(hospitals[0], specs_bangalore, "BLR", 10)

        # Branch 1: Mysore (Has Cardiology, Exists Endocrinology)
        specs_mysore = list(set(all_specializations) - {'neurology'})
        self.create_specific_doctors(hospitals[1], "cardiology", "MYS", 3)
        self.create_specific_doctors(hospitals[1], "endocrinology", "MYS_ENDO", 2)
        self.create_doctors(hospitals[1], specs_mysore, "MYS", 5) 

        # Branch 2: Tiptur (Has Endocrinology)
        self.create_specific_doctors(hospitals[2], "endocrinology", "TIP_ENDO", 2)
        self.create_doctors(hospitals[2], all_specializations, "TIP", 8)

        # Branch 3: Virajpet (No Oncology, Has Endocrinology)
        specs_virajpet = list(set(all_specializations) - {'oncology'})
        self.create_specific_doctors(hospitals[3], "endocrinology", "VRJ_ENDO", 2)
        self.create_doctors(hospitals[3], specs_virajpet, "VRJ", 8)

        # Branch 4: Mandya (No Pediatrics, Has Endocrinology)
        specs_mandya = list(set(all_specializations) - {'pediatrics'})
        self.create_specific_doctors(hospitals[4], "endocrinology", "MND_ENDO", 2)
        self.create_doctors(hospitals[4], specs_mandya, "MND", 8)

        # Branch 5: Tumkur (Full range)
        self.create_doctors(hospitals[5], all_specializations, "TMK", 10)

        self.stdout.write(self.style.SUCCESS('Successfully seeded 6 branches with doctors!'))

    def create_specific_doctors(self, hospital, specialization, suffix, count):
        """Create doctors with a FORCED specialization"""
        for i in range(count):
            email = f"dr.{specialization}.{suffix}{i}@example.com"
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
            else:
                user = User.objects.create_user(
                    email=email,
                    password="password123",
                    first_name=f"Dr.{specialization.title()}",
                    last_name=f"{suffix}",
                    role='doctor'
                )
            
            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "specialization": specialization,
                    "department": f"{specialization.title()} Dept",
                    "license_number": f"LIC-{suffix}-{specialization[:3]}-{i}-{random.randint(1000,9999)}",
                    "years_of_experience": random.randint(5, 20),
                    "qualification": "MBBS, MD",
                    "consultation_fee": random.randint(300, 800),
                    "is_available": True
                }
            )
            doctor.hospitals.add(hospital)


    def create_doctors(self, hospital, specializations, suffix, count):
        for i in range(count):
            spec = random.choice(specializations)
            email = f"dr.aaaa{suffix}{i}@example.com"
            
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
            else:
                user = User.objects.create_user(
                    email=email,
                    password="password123",
                    first_name=f"Doctor{suffix}",
                    last_name=f"{i}",
                    role='doctor'
                )

            doctor, created = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "specialization": spec,
                    "department": f"{spec.title()} Dept",
                    "license_number": f"LIC-{suffix}-{i}-{random.randint(1000,9999)}",
                    "years_of_experience": random.randint(1, 20),
                    "qualification": "MBBS, MD",
                    "consultation_fee": random.randint(50, 200),
                    "is_available": True
                }
            )
            doctor.hospitals.add(hospital)
            doctor.save()

    def create_shared_doctors(self, hospitals, specializations, count):
        for i in range(count):
            spec = random.choice(specializations)
            email = f"dr.shared{i}@example.com"
            
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
            else:
                user = User.objects.create_user(
                    email=email,
                    password="password123",
                    first_name="Shared",
                    last_name=f"Doctor{i}",
                    role='doctor'
                )

            doctor, created = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "specialization": spec,
                    "department": f"{spec.title()} Dept",
                    "license_number": f"LIC-SHARED-{i}-{random.randint(1000,9999)}",
                    "years_of_experience": random.randint(5, 25),
                    "qualification": "MBBS, MD, FRCS",
                    "consultation_fee": random.randint(100, 300),
                    "is_available": True
                }
            )
            for h in hospitals:
                doctor.hospitals.add(h)
            doctor.save()
