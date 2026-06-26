from django.contrib import admin
from .models import Employee, Department

admin.site.register(Department)
admin.site.register(Employee)