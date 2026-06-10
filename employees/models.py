from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Employee(models.Model):
    emp_id      = models.CharField(max_length=20, unique=True)
    name        = models.CharField(max_length=150)
    department  = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    position    = models.CharField(max_length=100)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    join_date   = models.DateField()
    is_active   = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def daily_rate(self):
        return self.base_salary / 26