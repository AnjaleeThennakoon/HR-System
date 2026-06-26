from django.contrib import admin
from .models import Attendance, Holiday, Overtime, LeaveRequest, AttendanceConfig

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'time_in', 'time_out', 'hours_worked', 'status', 'late_minutes', 'overtime_hours']
    list_filter = ['status', 'date']
    search_fields = ['employee__name', 'employee__emp_id']
    date_hierarchy = 'date'

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ['date', 'name', 'is_recurring']
    search_fields = ['name']

@admin.register(Overtime)
class OvertimeAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'extra_hours', 'multiplier', 'approved']
    list_filter = ['approved']

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'leave_type']
    search_fields = ['employee__name']

@admin.register(AttendanceConfig)
class AttendanceConfigAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'start_time', 'end_time', 'working_days']