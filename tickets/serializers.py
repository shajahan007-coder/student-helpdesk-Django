from rest_framework import serializers
from .models import Ticket
from django.contrib.auth.models import User

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id', 'user', 'student_name', 'issue', 'status',
            'priority', 'admin_remark', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'status', 'admin_remark', 'created_at', 'updated_at']

        

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("User already exists")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
        )