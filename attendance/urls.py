from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendanceViewSet, HolidayViewSet, OvertimeViewSet,
    LeaveRequestViewSet, AttendanceConfigViewSet
)

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'holidays', HolidayViewSet, basename='holiday')
router.register(r'overtime', OvertimeViewSet, basename='overtime')
router.register(r'leaves', LeaveRequestViewSet, basename='leave')
router.register(r'attendance-config', AttendanceConfigViewSet, basename='attendance-config')

urlpatterns = [
    path('', include(router.urls)),
]