
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    CITIZEN = 'CITIZEN', 'Citizen'
    STAFF = 'STAFF', 'Field / Desk Officer'
    DEPT_HEAD = 'DEPT_HEAD', 'Department Head'
    ADMIN = 'ADMIN', 'County Admin'


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CITIZEN,
    )

    phone_number = models.CharField(
        max_length=15,
        unique=True,
    )

    home_ward = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    sub_county = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    is_phone_verified = models.BooleanField(default=False)

    department = models.ForeignKey(
        'categories.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff',
    )

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['username', 'email']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
