from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import RegisterView, CurrentUserView
from apps.users.login import LoginView
from apps.users.staff import StaffViewSet
from apps.service_requests.views import ServiceRequestViewSet
from apps.categories.views import DepartmentViewSet, CategoryViewSet
from apps.announcements.views import AnnouncementViewSet
from apps.audit_logs.views import AuditLogViewSet  # ADDED


def home(request):
    return JsonResponse({
        "service": "Murang'a e-Citizen API",
        "status": "ok",
    })


# Create the router before registering any routes
router = DefaultRouter()

router.register(
    r'requests',
    ServiceRequestViewSet,
    basename='servicerequest',
)
router.register(
    r'departments',
    DepartmentViewSet,
    basename='department',
)
router.register(
    r'categories',
    CategoryViewSet,
    basename='category',
)
router.register(
    r'staff',
    StaffViewSet,
    basename='staff',
)
router.register(
    r'announcements',
    AnnouncementViewSet,
    basename='announcement',
)
router.register(                                           # ADDED
    r'audit-logs',
    AuditLogViewSet,
    basename='auditlog',
)


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path(
        'api/auth/register/',
        RegisterView.as_view(),
        name='auth_register',
    ),
    path(
        'api/auth/login/',
        LoginView.as_view(),
        name='token_obtain_pair',
    ),
    path(
        'api/auth/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh',
    ),
    path(
        'api/auth/me/',
        CurrentUserView.as_view(),
        name='auth_me',
    ),
    path('api/', include(router.urls)),
]