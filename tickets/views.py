from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Ticket
from .serializers import TicketSerializer, RegisterSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

def home(request):
    return HttpResponse("Hello from the Tickets app!")


class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority']
    search_fields = ['student_name', 'issue']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        return Ticket.objects.all() if user.is_staff else Ticket.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Ticket.objects.all() if user.is_staff else Ticket.objects.filter(user=user)

def auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'token': str(refresh.access_token),
        'user': {
            'id': user.id,
            'email': user.email,
            'role': 'admin' if user.is_staff else 'student',
        },
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(auth_response(user), status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = authenticate(
            username=request.data.get('email'),
            password=request.data.get('password'),
        )
        if not user:
            return Response({'msg': 'Invalid Credentials'}, status=400)
        return Response(auth_response(user))
    
class ResolveTicketView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        ticket.status = 'Resolved'
        ticket.admin_remark = request.data.get('remark') or 'Resolved by Admin'
        ticket.save()
        return Response(TicketSerializer(ticket).data)    