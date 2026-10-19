from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('tickets/', views.TicketListCreateView.as_view(), name='ticket-list'),
    path('tickets/<int:pk>/', views.TicketDetailView.as_view(), name='ticket-detail'),
    path('tickets/<int:pk>/resolve/', views.ResolveTicketView.as_view(), name='ticket-resolve'),
    

]