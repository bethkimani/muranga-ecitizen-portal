from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets

from apps.audit_logs.mixins import AuditActorMixin
from .permissions import IsAdminRole

User = get_user_model()
STAFF_CHOICES = ('STAFF', 'DEPT_HEAD', 'ADMIN')


class StaffSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'username', 'email',
            'phone_number', 'role', 'department', 'department_name',
            'is_active', 'password',
        ]
        extra_kwargs = {'username': {'required': False}}

    def validate_role(self, value):
        if value not in STAFF_CHOICES:
            raise serializers.ValidationError('Role must be STAFF, DEPT_HEAD or ADMIN.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'A temporary password is required.'})
        validated_data.setdefault('username', validated_data['phone_number'])
        user = User(**validated_data)
        user.set_password(password)
        user.is_phone_verified = True
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class StaffViewSet(AuditActorMixin, viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.exclude(role='CITIZEN').select_related('department').order_by('first_name')

    def perform_destroy(self, instance):
        # Deactivate instead of deleting so the audit trail and request history stay intact
        if instance.pk == self.request.user.pk:
            raise serializers.ValidationError('You cannot deactivate your own account.')
        instance.is_active = False
        instance.save(update_fields=['is_active'])