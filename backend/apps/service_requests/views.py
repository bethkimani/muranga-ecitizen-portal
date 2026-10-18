from rest_framework import viewsets, permissions
from apps.service_requests.models import ServiceRequest
from apps.service_requests.serializers import ServiceRequestSerializer
import random
import string

class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'STAFF', 'DEPT_HEAD']:
            return ServiceRequest.objects.all()
        return ServiceRequest.objects.filter(citizen=user)

    def perform_create(self, serializer):
        ref_code = 'MCG-2026-' + ''.join(random.choices(string.digits, k=6))
        serializer.save(citizen=self.request.user, ref_number=ref_code)