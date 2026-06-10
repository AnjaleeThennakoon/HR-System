from django.db import models

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('P', 'Present'),
        ('A', 'Absent'),
        ('L', 'Leave'),
    ]
    employee     = models.ForeignKey('employees.Employee', on_delete=models.CASCADE)
    date         = models.DateField()
    time_in      = models.TimeField(null=True, blank=True)
    time_out     = models.TimeField(null=True, blank=True)
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2, default=8)
    status       = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')

    class Meta:
        unique_together = ('employee', 'date')

class Holiday(models.Model):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Overtime(models.Model):
    employee    = models.ForeignKey('employees.Employee', on_delete=models.CASCADE)
    date        = models.DateField()
    extra_hours = models.DecimalField(max_digits=4, decimal_places=2)
    multiplier  = models.DecimalField(max_digits=3, decimal_places=1, default=1.5)

    def ot_pay(self):
        hourly_rate = self.employee.daily_rate() / 8
        return hourly_rate * self.extra_hours * self.multiplier