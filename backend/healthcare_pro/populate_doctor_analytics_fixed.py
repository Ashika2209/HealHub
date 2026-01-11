"""
Script to populate salary, performance rating, and department category for existing doctors.
Run this with: python manage.py shell
Then: exec(open('populate_doctor_analytics_fixed.py').read())
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from doctors.models import Doctor
from django.db import models
import random

# Salary ranges based on specialization and experience
SALARY_RANGES = {
    'cardiology': (120000, 250000),
    'neurology': (130000, 260000),
    'pediatrics': (90000, 180000),
    'orthopedics': (110000, 220000),
    'dermatology': (95000, 190000),
    'general_medicine': (85000, 170000),
    'emergency_medicine': (100000, 200000),
    'oncology': (140000, 280000),
    'psychiatry': (95000, 195000),
    'radiology': (115000, 230000),
}

# Department categories for grouping
DEPT_CATEGORIES = {
    'cardiology': 'Medical Services',
    'neurology': 'Medical Services',
    'pediatrics': 'Medical Services',
    'orthopedics': 'Surgical Services',
    'dermatology': 'Outpatient Services',
    'general_medicine': 'Medical Services',
    'emergency_medicine': 'Emergency Services',
    'oncology': 'Specialized Care',
    'psychiatry': 'Mental Health',
    'radiology': 'Diagnostic Services',
}

print("Starting doctor data population...")
doctors = Doctor.objects.all()
print(f"Found {doctors.count()} doctors")

updated_count = 0

for doctor in doctors:
    # Skip if already has data
    if doctor.salary and doctor.performance_rating and doctor.department_category:
        continue
    
    # Get salary range for specialization
    spec = doctor.specialization
    base_min, base_max = SALARY_RANGES.get(spec, (90000, 180000))
    
    # Adjust based on experience
    experience = doctor.years_of_experience or 5
    experience_multiplier = 1 + (min(experience, 20) * 0.02)  # 2% per year, max 40%
    
    min_salary = int(base_min * experience_multiplier)
    max_salary = int(base_max * experience_multiplier)
    
    # Generate salary (rounded to nearest 1000)
    salary = round(random.randint(min_salary, max_salary) / 1000) * 1000
    
    # Generate performance rating (bell curve, mostly 3-4)
    rand = random.random()
    if rand < 0.10:
        rating = 5
    elif rand < 0.35:
        rating = 4
    elif rand < 0.70:
        rating = 3
    elif rand < 0.90:
        rating = 2
    else:
        rating = 1
    
    # Set department category
    dept_category = DEPT_CATEGORIES.get(spec, 'General Services')
    
    # Update doctor
    doctor.salary = salary
    doctor.performance_rating = rating
    doctor.department_category = dept_category
    doctor.save(update_fields=['salary', 'performance_rating', 'department_category'])
    
    print(f"Updated {doctor.user.get_full_name()}: ${salary:,} | Rating: {rating} | Dept: {dept_category}")
    updated_count += 1

print(f"\n✓ Total doctors updated: {updated_count}")

# Print summary statistics
avg_salary = Doctor.objects.filter(salary__isnull=False).aggregate(avg=models.Avg('salary'))['avg']
avg_rating = Doctor.objects.filter(performance_rating__isnull=False).aggregate(avg=models.Avg('performance_rating'))['avg']

print("\n=== Summary Statistics ===")
print(f"Average Salary: ${avg_salary:,.2f}")
print(f"Average Rating: {avg_rating:.2f}")

# Department distribution
from django.db.models import Count
dept_dist = Doctor.objects.values('department_category').annotate(count=Count('id')).order_by('-count')
print("\nDepartment Distribution:")
for dept in dept_dist:
    print(f"  {dept['department_category']}: {dept['count']} doctors")

print("\n✓ Data population complete!")
