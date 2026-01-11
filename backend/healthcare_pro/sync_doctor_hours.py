"""
One-time script to sync working hours for all existing doctors.
Run this once to populate working hours from existing availability records.

Usage:
    python manage.py shell < sync_doctor_hours.py
"""

from doctors.models import Doctor, Availability
from datetime import time as dt_time

def sync_all_doctors():
    doctors = Doctor.objects.all()
    updated_count = 0
    
    for doctor in doctors:
        availabilities = Availability.objects.filter(doctor=doctor, is_available=True)
        
        if not availabilities.exists():
            # No availability set, use defaults
            doctor.start_time = dt_time(9, 0)
            doctor.end_time = dt_time(19, 0)
            doctor.save(update_fields=['start_time', 'end_time'])
            print(f"Set default hours for {doctor.user.get_full_name()}")
            updated_count += 1
            continue
        
        # Find earliest start and latest end
        earliest_start = None
        latest_end = None
        
        for availability in availabilities:
            if earliest_start is None or availability.start_time < earliest_start:
                earliest_start = availability.start_time
            if latest_end is None or availability.end_time > latest_end:
                latest_end = availability.end_time
        
        # Update doctor model
        if earliest_start and latest_end:
            doctor.start_time = earliest_start
            doctor.end_time = latest_end
            doctor.save(update_fields=['start_time', 'end_time'])
            print(f"Updated {doctor.user.get_full_name()}: {earliest_start.strftime('%I:%M %p')} - {latest_end.strftime('%I:%M %p')}")
            updated_count += 1
    
    print(f"\nTotal doctors updated: {updated_count}")

if __name__ == '__main__':
    sync_all_doctors()
