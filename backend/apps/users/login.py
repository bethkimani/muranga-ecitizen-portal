from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


def normalize_phone(value: str) -> str:
    """'+254712345678' or '0712 345 678' -> '0712345678' (the format stored in the database)."""
    v = value.replace(' ', '').replace('-', '')
    return '0' + v[4:] if v.startswith('+254') else v


class LoginSerializer(TokenObtainPairSerializer):
    """Accepts `identifier` (phone number or email) and `password`.

    The older `phone_number` field is still accepted, so existing clients keep working.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['identifier'] = serializers.CharField(required=False, write_only=True)
        self.fields[self.username_field].required = False

    def validate(self, attrs):
        identifier = (attrs.get('identifier') or attrs.get(self.username_field) or '').strip()
        if not identifier:
            raise serializers.ValidationError(
                {'identifier': 'Enter your phone number or email address.'}
            )

        if '@' in identifier:
            login_value = identifier
            matches = list(User.objects.filter(email__iexact=identifier)[:2])
            # Use the email only if it belongs to exactly one account.
            # Otherwise leave it as typed, and the password check fails with the normal 401.
            if len(matches) == 1:
                login_value = getattr(matches[0], self.username_field)
        else:
            login_value = normalize_phone(identifier)

        attrs = {**attrs, self.username_field: login_value}
        return super().validate(attrs)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer