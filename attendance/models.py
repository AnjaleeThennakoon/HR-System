from django.db import models
from employees.models import Employee
from datetime import time, datetime

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('P', 'Present'),
        ('A', 'Absent'),
        ('L', 'Late'),
        ('LV', 'Leave'),
        ('HD', 'Half Day'),
        ('H', 'Holiday'),
        ('W', 'Weekend'),
    ]
    
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE)
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default='P')
    late_minutes = models.IntegerField(default=0)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    overtime_rate = models.DecimalField(max_digits=3, decimal_places=1, default=1.5)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.get_status_display()}"

    def calculate_late(self, start_time=time(9, 0)):
        """Calculate late minutes if check-in is after start time"""
        if self.time_in and self.time_in > start_time:
            late = (datetime.combine(datetime.today(), self.time_in) - 
                   datetime.combine(datetime.today(), start_time)).seconds // 60
            self.late_minutes = late
            if late > 15:  # More than 15 minutes late
                self.status = 'L'
        return self.late_minutes

    def calculate_overtime(self, end_time=time(17, 0)):
        """Calculate overtime if check-out is after end time"""
        if self.time_out and self.time_out > end_time:
            ot = (datetime.combine(datetime.today(), self.time_out) - 
                 datetime.combine(datetime.today(), end_time)).seconds // 3600
            self.overtime_hours = ot
        return self.overtime_hours

    def calculate_hours_worked(self):
        """Calculate total hours worked"""
        if self.time_in and self.time_out:
            time_in = datetime.combine(datetime.today(), self.time_in)
            time_out = datetime.combine(datetime.today(), self.time_out)
            diff = time_out - time_in
            hours = diff.total_seconds() / 3600
            # Subtract lunch break (1 hour) if worked more than 6 hours
            if hours > 6:
                hours -= 1
            self.hours_worked = round(hours, 2)
        return self.hours_worked


class Holiday(models.Model):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_recurring = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.date}"


class Overtime(models.Model):
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE)
    date = models.DateField()
    extra_hours = models.DecimalField(max_digits=4, decimal_places=2)
    multiplier = models.DecimalField(max_digits=3, decimal_places=1, default=1.5)
    approved = models.BooleanField(default=False)
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.extra_hours}h"

    def ot_pay(self):
        hourly_rate = self.employee.daily_rate() / 8
        return hourly_rate * self.extra_hours * self.multiplier


class LeaveRequest(models.Model):
    LEAVE_STATUS = [
        ('P', 'Pending'),
        ('A', 'Approved'),
        ('R', 'Rejected'),
    ]
    LEAVE_TYPES = [
        ('AL', 'Annual Leave'),
        ('SL', 'Sick Leave'),
        ('CL', 'Casual Leave'),
        ('ML', 'Maternity Leave'),
        ('PL', 'Paternity Leave'),
        ('OL', 'Other Leave'),
    ]
    
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=2, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=1, choices=LEAVE_STATUS, default='P')
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    approved_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.name} - {self.leave_type} - {self.start_date} to {self.end_date}"

    def get_days(self):
        delta = self.end_date - self.start_date
        return delta.days + 1


class AttendanceConfig(models.Model):
    company_name = models.CharField(max_length=200, default='HR System')
    start_time = models.TimeField(default=time(9, 0))
    end_time = models.TimeField(default=time(17, 0))
    lunch_start = models.TimeField(default=time(12, 0))
    lunch_end = models.TimeField(default=time(13, 0))
    working_days = models.CharField(max_length=20, default='Mon-Fri')
    late_grace_period = models.IntegerField(default=15)  # minutes
    overtime_rate = models.DecimalField(max_digits=3, decimal_places=1, default=1.5)
    allow_geolocation = models.BooleanField(default=False)
    allow_face_recognition = models.BooleanField(default=False)

    def __str__(self):
        return self.company_name