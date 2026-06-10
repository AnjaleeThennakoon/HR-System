from django.contrib import admin
from .models import Attendance, Holiday, Overtime

admin.site.register(Attendance)
admin.site.register(Holiday)
admin.site.register(Overtime)