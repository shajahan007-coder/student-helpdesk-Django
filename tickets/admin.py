from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('student_name', 'status', 'priority', 'user', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('student_name', 'issue')