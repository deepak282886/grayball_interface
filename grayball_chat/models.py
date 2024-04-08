from django.db import models
from django.contrib.auth.models import User
import uuid

class SearchSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_sessions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.id} by {self.user.username}"

class UserSearch(models.Model):
    session = models.ForeignKey(SearchSession, on_delete=models.CASCADE, related_name='searches')
    query = models.CharField(max_length=2000)
    response = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Search in Session {self.session.id}: {self.query[:50]}..."
