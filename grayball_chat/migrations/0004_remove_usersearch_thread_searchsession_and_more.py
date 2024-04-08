# Generated by Django 5.0.1 on 2024-01-21 06:22

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("grayball_chat", "0003_remove_usersearch_search_id_remove_usersearch_user_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name="usersearch",
            name="thread",
        ),
        migrations.CreateModel(
            name="SearchSession",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="search_sessions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="usersearch",
            name="session",
            field=models.ForeignKey(
                default=1111111,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="searches",
                to="grayball_chat.searchsession",
            ),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name="SearchThread",
        ),
    ]
