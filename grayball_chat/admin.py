from django.contrib import admin
from .models import SearchSession, UserSearch

@admin.register(SearchSession)
class SearchSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('created_at',)
    readonly_fields = ('id',)

@admin.register(UserSearch)
class UserSearchAdmin(admin.ModelAdmin):
    list_display = ('session', 'query', 'created_at')
    search_fields = ('query',)
    list_filter = ('created_at', 'session',)
    readonly_fields = ('created_at',)
