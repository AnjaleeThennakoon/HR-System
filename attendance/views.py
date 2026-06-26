from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import date, datetime, timedelta
from django.db.models import Sum, Count, Q
from .models import Attendance, Holiday, Overtime, LeaveRequest, AttendanceConfig
from .serializers import (
    AttendanceSerializer, AttendanceSummarySerializer,
    HolidaySerializer, OvertimeSerializer, 
    LeaveRequestSerializer, AttendanceConfigSerializer
)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if month:
            queryset = queryset.filter(date__month=month)
        if year:
            queryset = queryset.filter(date__year=year)
            
        return queryset.order_by('-date')

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        employee_id = request.data.get('employee_id')
        if not employee_id:
            return Response({'error': 'employee_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        today = date.today()
        attendance, created = Attendance.objects.get_or_create(
            employee_id=employee_id,
            date=today
        )
        
        if not created and attendance.time_in:
            return Response({'error': 'Already checked in today'}, status=status.HTTP_400_BAD_REQUEST)
        
        attendance.time_in = datetime.now().time()
        
        # Calculate late minutes (start time 9:00 AM)
        start_time = datetime.strptime('09:00:00', '%H:%M:%S').time()
        attendance.calculate_late(start_time)
        
        attendance.save()
        
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        employee_id = request.data.get('employee_id')
        if not employee_id:
            return Response({'error': 'employee_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        today = date.today()
        try:
            attendance = Attendance.objects.get(employee_id=employee_id, date=today)
        except Attendance.DoesNotExist:
            return Response({'error': 'No check-in found for today'}, status=status.HTTP_400_BAD_REQUEST)
        
        if attendance.time_out:
            return Response({'error': 'Already checked out today'}, status=status.HTTP_400_BAD_REQUEST)
        
        attendance.time_out = datetime.now().time()
        
        # Calculate hours worked and overtime
        attendance.calculate_hours_worked()
        end_time = datetime.strptime('17:00:00', '%H:%M:%S').time()
        attendance.calculate_overtime(end_time)
        
        # Auto set status based on hours
        if attendance.hours_worked < 4:
            attendance.status = 'HD'  # Half Day
        elif attendance.hours_worked < 8:
            attendance.status = 'P'  # Present
        else:
            attendance.status = 'P'  # Present with overtime
        
        attendance.save()
        
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        employee_id = request.query_params.get('employee_id')
        if not employee_id:
            return Response({'error': 'employee_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            attendance = Attendance.objects.get(employee_id=employee_id, date=date.today())
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data)
        except Attendance.DoesNotExist:
            return Response({'message': 'No attendance today'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        employee_id = request.query_params.get('employee_id')
        month = int(request.query_params.get('month', date.today().month))
        year = int(request.query_params.get('year', date.today().year))
        
        if not employee_id:
            return Response({'error': 'employee_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        attendances = Attendance.objects.filter(
            employee_id=employee_id,
            date__year=year,
            date__month=month
        )
        
        total_days = attendances.count()
        present = attendances.filter(status='P').count()
        absent = attendances.filter(status='A').count()
        late = attendances.filter(status='L').count()
        leave = attendances.filter(status='LV').count()
        total_hours = sum([a.hours_worked for a in attendances if a.hours_worked])
        total_late = sum([a.late_minutes for a in attendances if a.late_minutes])
        total_overtime = sum([a.overtime_hours for a in attendances if a.overtime_hours])
        
        # Calculate attendance percentage
        working_days = 22  # Standard working days in a month
        attendance_percentage = (present / working_days * 100) if working_days > 0 else 0
        
        summary_data = {
            'total_days': total_days,
            'present': present,
            'absent': absent,
            'late': late,
            'leave': leave,
            'total_hours': round(total_hours, 2),
            'total_late_minutes': total_late,
            'total_overtime': round(total_overtime, 2),
            'attendance_percentage': round(attendance_percentage, 1)
        }
        
        return Response(summary_data)

    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        month = int(request.query_params.get('month', date.today().month))
        year = int(request.query_params.get('year', date.today().year))
        
        attendances = Attendance.objects.filter(
            date__year=year,
            date__month=month
        )
        
        # Group by employee
        report_data = []
        for att in attendances:
            emp_id = att.employee.id
            emp_data = next((item for item in report_data if item['employee_id'] == emp_id), None)
            
            if not emp_data:
                emp_data = {
                    'employee_id': emp_id,
                    'employee_name': att.employee.name,
                    'employee_emp_id': att.employee.emp_id,
                    'present': 0,
                    'absent': 0,
                    'late': 0,
                    'leave': 0,
                    'half_day': 0,
                    'total_hours': 0,
                    'total_late_minutes': 0,
                    'total_overtime': 0
                }
                report_data.append(emp_data)
            
            if att.status == 'P':
                emp_data['present'] += 1
            elif att.status == 'A':
                emp_data['absent'] += 1
            elif att.status == 'L':
                emp_data['late'] += 1
            elif att.status == 'LV':
                emp_data['leave'] += 1
            elif att.status == 'HD':
                emp_data['half_day'] += 1
            
            emp_data['total_hours'] += att.hours_worked
            emp_data['total_late_minutes'] += att.late_minutes
            emp_data['total_overtime'] += att.overtime_hours
        
        return Response(report_data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        today = date.today()
        month = date.today().month
        year = date.today().year
        
        # Today's attendance
        today_attendance = Attendance.objects.filter(date=today)
        today_present = today_attendance.filter(status='P').count()
        today_absent = today_attendance.filter(status='A').count()
        today_late = today_attendance.filter(status='L').count()
        today_leave = today_attendance.filter(status='LV').count()
        
        # Monthly stats
        monthly_attendance = Attendance.objects.filter(
            date__year=year,
            date__month=month
        )
        total_attendance = monthly_attendance.count()
        total_present = monthly_attendance.filter(status='P').count()
        total_absent = monthly_attendance.filter(status='A').count()
        total_late = monthly_attendance.filter(status='L').count()
        total_leave = monthly_attendance.filter(status='LV').count()
        total_hours = monthly_attendance.aggregate(Sum('hours_worked'))['hours_worked__sum'] or 0
        total_overtime = monthly_attendance.aggregate(Sum('overtime_hours'))['overtime_hours__sum'] or 0
        
        # Recent attendance (last 5 days)
        recent = Attendance.objects.all().order_by('-date')[:10]
        recent_serializer = AttendanceSerializer(recent, many=True)
        
        return Response({
            'today': {
                'present': today_present,
                'absent': today_absent,
                'late': today_late,
                'leave': today_leave,
                'total': today_attendance.count()
            },
            'monthly': {
                'total': total_attendance,
                'present': total_present,
                'absent': total_absent,
                'late': total_late,
                'leave': total_leave,
                'total_hours': round(total_hours, 2),
                'total_overtime': round(total_overtime, 2),
                'attendance_percentage': round((total_present / 22 * 100) if 22 > 0 else 0, 1)
            },
            'recent': recent_serializer.data
        })


class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def current_month(self, request):
        month = int(request.query_params.get('month', date.today().month))
        year = int(request.query_params.get('year', date.today().year))
        
        holidays = Holiday.objects.filter(date__year=year, date__month=month)
        serializer = HolidaySerializer(holidays, many=True)
        return Response(serializer.data)


class OvertimeViewSet(viewsets.ModelViewSet):
    queryset = Overtime.objects.all()
    serializer_class = OvertimeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        return queryset


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        status = self.request.query_params.get('status')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'A'
        leave.approved_by = request.user.username
        leave.approved_date = date.today()
        leave.save()
        return Response({'message': 'Leave approved successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'R'
        leave.save()
        return Response({'message': 'Leave rejected'})


class AttendanceConfigViewSet(viewsets.ModelViewSet):
    queryset = AttendanceConfig.objects.all()
    serializer_class = AttendanceConfigSerializer
    permission_classes = [permissions.IsAuthenticated]