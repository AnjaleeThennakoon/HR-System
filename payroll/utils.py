from decimal import Decimal
from django.db import models

def calculate_monthly_salary(employee_id, year, month):
    from calendar import monthrange
    from datetime import datetime
    from employees.models import Employee
    from attendance.models import Attendance, Holiday
    
    employee = Employee.objects.get(id=employee_id)
    
    total_working_days = 0
    present_days = 0
    
    num_days = monthrange(year, month)[1]
    holidays = Holiday.objects.filter(date__year=year, date__month=month).values_list('date', flat=True)
    
    for day in range(1, num_days + 1):
        current_date = datetime(year, month, day).date()
        weekday = current_date.weekday()
        
        # Monday to Friday are working days
        if weekday < 5:
            total_working_days += 1
        
        try:
            att = Attendance.objects.get(employee=employee, date=current_date)
            if att.status == 'P':
                present_days += 1
        except Attendance.DoesNotExist:
            pass
    
    # Calculate salary
    if total_working_days > 0:
        daily_rate = employee.base_salary / Decimal(str(total_working_days))
    else:
        daily_rate = Decimal('0')
    
    basic_pay = daily_rate * Decimal(str(present_days))
    
    # Calculate overtime
    ot_total = Attendance.objects.filter(
        employee=employee,
        date__year=year,
        date__month=month
    ).aggregate(total=models.Sum('overtime_hours'))['total'] or Decimal('0')
    
    hourly_rate = daily_rate / Decimal('8')
    ot_pay = hourly_rate * Decimal(str(ot_total)) * Decimal('1.5')
    
    # Deductions
    epf = (basic_pay + ot_pay) * Decimal('0.08')
    socso = (basic_pay + ot_pay) * Decimal('0.005')
    net_pay = basic_pay + ot_pay - epf - socso
    
    return {
        'employee_name': employee.name,
        'employee_id': employee.emp_id,
        'year': year,
        'month': month,
        'present_days': present_days,
        'total_working_days': total_working_days,
        'absent_days': total_working_days - present_days,
        'overtime_hours': float(ot_total),
        'basic_pay': float(basic_pay),
        'ot_pay': float(ot_pay),
        'epf': float(epf),
        'socso': float(socso),
        'net_pay': float(net_pay),
    }


def get_attendance_summary(employee_id, year, month):
    from calendar import monthrange
    from datetime import datetime
    from attendance.models import Attendance, Holiday
    
    attendance_records = []
    num_days = monthrange(year, month)[1]
    holidays = Holiday.objects.filter(date__year=year, date__month=month).values_list('date', flat=True)
    
    for day in range(1, num_days + 1):
        current_date = datetime(year, month, day).date()
        weekday = current_date.weekday()
        
        is_holiday = current_date in holidays
        is_weekend = weekday >= 5
        
        try:
            att = Attendance.objects.get(employee_id=employee_id, date=current_date)
            status = att.get_status_display()
            status_code = att.status
            ot_hours = att.overtime_hours
        except Attendance.DoesNotExist:
            status = 'Not Marked'
            status_code = 'N'
            ot_hours = 0
        
        day_type = 'Working Day'
        if is_weekend:
            day_type = 'Weekend'
        elif is_holiday:
            day_type = 'Holiday'
        
        attendance_records.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'day': current_date.strftime('%A'),
            'day_type': day_type,
            'status': status,
            'status_code': status_code,
            'overtime_hours': ot_hours,
        })
    
    return attendance_records