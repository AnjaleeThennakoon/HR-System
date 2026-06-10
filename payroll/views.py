from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from .utils import calculate_monthly_salary, get_attendance_summary

class PayrollViewSet(ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get salary for all employees"""
        from employees.models import Employee
        
        year = int(request.query_params.get('year', datetime.now().year))
        month = int(request.query_params.get('month', datetime.now().month))
        
        employees = Employee.objects.filter(is_active=True)
        results = []
        
        for emp in employees:
            salary = calculate_monthly_salary(emp.id, year, month)
            results.append(salary)
        
        return Response(results)
    
    def retrieve(self, request, pk=None):
        """Get salary for specific employee"""
        year = int(request.query_params.get('year', datetime.now().year))
        month = int(request.query_params.get('month', datetime.now().month))
        
        result = calculate_monthly_salary(pk, year, month)
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def attendance_summary(self, request):
        """Get attendance summary for an employee"""
        employee_id = request.query_params.get('employee_id')
        year = int(request.query_params.get('year', datetime.now().year))
        month = int(request.query_params.get('month', datetime.now().month))
        
        if not employee_id:
            return Response({'error': 'employee_id required'}, status=400)
        
        result = get_attendance_summary(employee_id, year, month)
        return Response(result)