from django.contrib import admin
from .models import PatientProfile

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_of_birth', 'blood_group', 'created_at')
    search_fields = ('user__username', 'user__email', 'blood_group')
    list_filter = ('blood_group',)
