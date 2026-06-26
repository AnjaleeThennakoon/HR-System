from rest_framework import serializers
from .models import Attendance, Holiday, Overtime, LeaveRequest, AttendanceConfig

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id = serializers.IntegerField(source='employee.id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_color = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'employee_id', 'date',
            'time_in', 'time_out', 'hours_worked', 'status', 'status_display',
            'status_color', 'late_minutes', 'overtime_hours', 'overtime_rate',
            'notes', 'created_at', 'updated_at'
        ]
    
    def get_status_color(self, obj):
        colors = {
            'P': '#4CAF50',
            'A': '#f44336',
            'L': '#FF9800',
            'LV': '#2196F3',
            'HD': '#9C27B0',
            'H': '#FF5722',
            'W': '#607D8B'
        }
        return colors.get(obj.status, '#666')


class AttendanceSummarySerializer(serializers.Serializer):
    total_days = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    leave = serializers.IntegerField()
    total_hours = serializers.FloatField()
    total_late_minutes = serializers.IntegerField()
    total_overtime = serializers.FloatField()
    attendance_percentage = serializers.FloatField()


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ['id', 'date', 'name', 'description', 'is_recurring']


class OvertimeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    ot_pay_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Overtime
        fields = ['id', 'employee', 'employee_name', 'date', 'extra_hours', 
                 'multiplier', 'approved', 'approved_by', 'notes', 'ot_pay_amount']
    
    def get_ot_pay_amount(self, obj):
        return obj.ot_pay()


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    days = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'leave_type_display',
            'start_date', 'end_date', 'days', 'reason', 'status', 'status_display',
            'approved_by', 'approved_date', 'notes', 'created_at', 'updated_at'
        ]
    
    def get_days(self, obj):
        return obj.get_days()


class AttendanceConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceConfig
        fields = '__all__'