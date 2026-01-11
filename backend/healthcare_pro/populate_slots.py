import os
import django
import datetime
from django.utils import timezone

# Setup Django
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from doctors.models import Doctor
from appointments.models import AppointmentSlot

def populate_slots():
    print("Populating Appointment Slots...")
    
    doctors = Doctor.objects.all()
    if not doctors.exists():
        print("No doctors found! Please run create_test_users.py first.")
        return

    today = timezone.now().date()
    days_to_generate = 30
    start_hour = 9
    end_hour = 17
    slot_duration = 30 # minutes

    total_created = 0

    for doctor in doctors:
        print(f"Generating slots for Dr. {doctor.user.get_full_name()} ({doctor.specialization})...")
        
        for day_offset in range(days_to_generate):
            date = today + datetime.timedelta(days=day_offset)
            
            # Skip weekends if you want, but for now let's just create them for simplicity or verify against working_days if needed.
            # Assuming M-F for simplicity as working_days might be empty.
            if date.weekday() >= 5: # 5=Sat, 6=Sun
                continue

            current_time = datetime.datetime.combine(date, datetime.time(start_hour, 0))
            end_time_limit = datetime.datetime.combine(date, datetime.time(end_hour, 0))

            while current_time < end_time_limit:
                slot_start = current_time.time()
                current_time += datetime.timedelta(minutes=slot_duration)
                slot_end = current_time.time()

                # Get or Create
                slot, created = AppointmentSlot.objects.get_or_create(
                    doctor=doctor,
                    date=date,
                    start_time=slot_start,
                    defaults={
                        'end_time': slot_end,
                        'is_available': True,
                        'max_appointments': 1
                    }
                )
                
                if created:
                    total_created += 1
            
    print(f"Done! Created {total_created} new slots.")

if __name__ == "__main__":
    populate_slots()
