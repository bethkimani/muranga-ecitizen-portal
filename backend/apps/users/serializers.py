from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'role', 'home_ward', 'sub_county', 'is_phone_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'phone_number', 'email', 'password', 'home_ward', 'sub_county']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            phone_number=validated_data['phone_number'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            home_ward=validated_data.get('home_ward', ''),
            sub_county=validated_data.get('sub_county', ''),
        )
        return user