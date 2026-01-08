from django.contrib import admin
from .models import DoctorProfile, Branch

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_number')
    search_fields = ('name', 'address')

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'check_branch', 'specialization', 'availability_status')
    search_fields = ('user__username', 'user__email', 'specialization')
    list_filter = ('availability_status', 'branch', 'specialization')

    def check_branch(self, obj):
        return obj.branch.name if obj.branch else "No Branch"
    check_branch.short_description = 'Branch'
