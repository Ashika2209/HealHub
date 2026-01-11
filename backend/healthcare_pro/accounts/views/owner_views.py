from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from ..models import User
from ..permissions import IsOwner
from doctors.models import Doctor
from patients.models import PatientProfile
from appointments.models import Appointment

@api_view(['GET'])
@permission_classes([IsOwner])
def owner_dashboard_stats(request):
    """
    Get high-level stats for the owner dashboard.
    """
    total_doctors = Doctor.objects.count()
    
    # Patients Treated: Completed appointments
    patients_treated = Appointment.objects.filter(status='completed').values('patient').distinct().count()
    
    # Total Appointments Today
    today = timezone.now().date()
    total_appointments_today = Appointment.objects.filter(appointment_date=today).count()
    
    # Total Revenue: Sum of consultation fees for completed appointments
    total_revenue = Appointment.objects.filter(status='completed').aggregate(total=Sum('consultation_fee'))['total'] or 0.00
    
    # Monthly Earnings: Sum of consultation fees in the current month
    first_day_of_month = today.replace(day=1)
    monthly_earnings = Appointment.objects.filter(
        status='completed',
        appointment_date__gte=first_day_of_month
    ).aggregate(total=Sum('consultation_fee'))['total'] or 0.00
    
    return Response({
        'total_doctors': total_doctors,
        'patients_treated': patients_treated,
        'total_appointments_today': total_appointments_today,
        'total_revenue': f"{total_revenue:,.2f}",
        'monthly_earnings': f"{monthly_earnings:,.2f}"
    })

@api_view(['GET'])
@permission_classes([IsOwner])
def owner_doctor_performance(request):
    """
    Get performance metrics for all doctors.
    """
    doctors = Doctor.objects.select_related('user').all()
    
    performance_data = []
    for doctor in doctors:
        # Count patients treated by this doctor
        patient_count = Appointment.objects.filter(doctor=doctor, status='completed').values('patient').distinct().count()
        
        performance_data.append({
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.get_full_name()}",
            'specialization': doctor.get_specialization_display(),
            'working_hours': f"{doctor.start_time.strftime('%I:%M %p')} - {doctor.end_time.strftime('%I:%M %p')}" if doctor.start_time and doctor.end_time else "N/A",
            'patient_count': patient_count,
            'avatar': None # In a real app, this would be a URL
        })
    
    return Response(performance_data)

@api_view(['GET'])
@permission_classes([IsOwner])
def owner_hospital_analytics(request):
    """
    Get detailed hospital analytics.
    """
    data = {}
    
    # 1. & 2. Static/Simple Metrics
    data['avg_consultation_time'] = "15.0 min"
    data['bed_occupancy'] = {'rate': '66%', 'occupied': 332, 'total': 502}
    data['patient_satisfaction'] = '4.6/5.0'
    
    
    # 5. Staff Utilization
    try:
        total_doctors = Doctor.objects.count()
        active_doctors = Doctor.objects.filter(is_available=True).count()
        data['staff_utilization'] = f"{round((active_doctors / total_doctors * 100), 1)}%" if total_doctors > 0 else "0.0%"
    except:
        data['staff_utilization'] = "0.0%"
    
    # 6. Patient Visits & Type Breakdown
    try:
        specialization_visits = Appointment.objects.values('doctor__specialization').annotate(count=Count('id')).order_by('-count')
        spec_map = dict(Doctor.SPECIALIZATION_CHOICES)
        
        visits_by_spec = []
        for item in specialization_visits:
            spec_code = item['doctor__specialization']
            if spec_code:
                visits_by_spec.append({'specialization': spec_map.get(spec_code, str(spec_code)), 'count': item['count']})
        data['visits_by_specialization'] = visits_by_spec
        
        patient_type_breakdown = []
        top_specs = list(specialization_visits[:6])
        if not top_specs:
            top_specs = [{'doctor__specialization': s, 'count': 0} for s in ['cardiology', 'pediatrics', 'orthopedics', 'neurology', 'general_medicine']]
            
        for item in top_specs:
            spec_code = item.get('doctor__specialization')
            total_count = item.get('count', 0)
            inpatient_ratio = {'cardiology': 0.65, 'neurology': 0.67, 'pediatrics': 0.22, 'orthopedics': 0.33, 'dermatology': 0.32, 'general_medicine': 0.40}.get(spec_code, 0.50)
            inpatients = int(total_count * inpatient_ratio)
            patient_type_breakdown.append({
                'specialization': spec_map.get(spec_code, str(spec_code).replace('_', ' ').capitalize() if spec_code else 'General'),
                'inpatients': inpatients, 'outpatients': total_count - inpatients, 'total': total_count
            })
        data['patient_type_breakdown'] = patient_type_breakdown
    except:
        data['visits_by_specialization'] = []
        data['patient_type_breakdown'] = []
        
    # 7. Monthly Appointment Trends
    try:
        today = timezone.now().date()
        appointment_trends = []
        for i in range(5, -1, -1):
            ms = (today.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            me = (ms + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            count = Appointment.objects.filter(appointment_date__gte=ms, appointment_date__lte=me).count()
            appointment_trends.append({'month': ms.strftime('%b'), 'count': count})
        data['appointment_trends'] = appointment_trends
    except:
        data['appointment_trends'] = []
        
        
    # 9. Department Distribution
    try:
        dept_counts = Doctor.objects.values('department_category').annotate(count=Count('id')).order_by('-count')
        dept_distribution = [{'department': item['department_category'] or 'Unassigned', 'count': item['count']} for item in dept_counts]
        if not dept_distribution:
            total = Doctor.objects.count()
            if total > 0: dept_distribution.append({'department': 'Unassigned', 'count': total})
        data['department_distribution'] = dept_distribution
    except:
        data['department_distribution'] = []
        
    # 10. Salary/Rating Heatmap
    try:
        salary_ranges = [('70-85k', 70000, 85000), ('85-100k', 85000, 100000), ('100-125k', 100000, 125000), ('125-150k', 125000, 150000), ('150-175k', 150000, 175000), ('175k+', 175000, 999999999)]
        heatmap_data = []
        for label, min_s, max_s in salary_ranges:
            row = {'salary_range': label, 'ratings': {str(r): Doctor.objects.filter(salary__gte=min_s, salary__lt=max_s, performance_rating=r).count() for r in range(1, 6)}}
            heatmap_data.append(row)
        data['salary_rating_heatmap'] = heatmap_data
    except:
        data['salary_rating_heatmap'] = []
        
    return Response(data)

@api_view(['GET'])
@permission_classes([IsOwner])
def owner_upcoming_appointments(request):
    """
    Get upcoming appointments for the owner view.
    """
    today = timezone.now().date()
    upcoming = Appointment.objects.filter(
        appointment_date__gte=today,
        status__in=['scheduled', 'confirmed']
    ).select_related('doctor__user', 'patient__user').order_by('appointment_date', 'appointment_time')[:10]
    
    data = []
    for appt in upcoming:
        data.append({
            'id': str(appt.id),
            'doctor_name': f"Dr. {appt.doctor.user.get_full_name()}",
            'specialization': appt.doctor.get_specialization_display(),
            'date': appt.appointment_date.strftime('%m/%d/%Y'),
            'status': appt.get_status_display()
        })
    
    return Response(data)
