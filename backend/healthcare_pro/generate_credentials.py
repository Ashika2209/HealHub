import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from doctors.models import Doctor

docs = Doctor.objects.all().select_related('user').order_by('user__first_name')
output_path = r"C:\Users\hp\.gemini\antigravity\brain\4a220f95-2451-4673-a750-1f4cc59075f9\doctor_credentials.md"

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("# Doctor Credentials\n\n")
    f.write("**Note:** All passwords have been reset to `password123` for testing convenience.\n\n")
    f.write("| Name | Email | Specialization | Department | Password |\n")
    f.write("|---|---|---|---|---|\n")
    
    for d in docs:
        u = d.user
        # Ensure password is set (idempotent if already set, but good for completeness)
        u.set_password('password123')
        u.save()
        
        name = f"{u.first_name} {u.last_name}"
        f.write(f"| {name} | {u.email} | {d.specialization} | {d.department} | `password123` |\n")

print(f"Generated credentials for {docs.count()} doctors at {output_path}")
