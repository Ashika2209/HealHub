import os
import django
import datetime
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from doctors.models import Doctor, Availability
from django.contrib.auth import get_user_model

try:
    User = get_user_model()
    u = User.objects.get(email='admin@example.com')
    doctor = Doctor.objects.get(user=u)
    
    # 1. Check Date
    target_date = datetime.date.today()
    day_of_week = target_date.strftime('%A').lower()
    print(f"Checking slots for: {target_date} ({day_of_week})")
    
    # 2. Check Availabilities in DB
    availabilities = doctor.availabilities.filter(day_of_week__iexact=day_of_week, is_available=True)
    print(f"Found {availabilities.count()} availability records.")
    for a in availabilities:
        print(f" - {a.day_of_week}: {a.start_time} to {a.end_time}")

    # 3. Simulate Slot Logic
    slot_duration = datetime.timedelta(minutes=60)
    now_local = timezone.localtime()
    print(f"Server Time: {now_local}")
    
    for availability in availabilities:
        current_start = datetime.datetime.combine(target_date, availability.start_time)
        availability_end = datetime.datetime.combine(target_date, availability.end_time)
        
        while current_start + slot_duration <= availability_end:
            slot_time = current_start.time()
            
            # Future check
            is_future = True
            if now_local.date() == target_date:
                if current_start.time() <= now_local.time():
                    is_future = False
            
            print(f"Slot: {slot_time} -> Future? {is_future}")
            current_start += slot_duration

except Exception as e:
    print(f"Error: {e}")
