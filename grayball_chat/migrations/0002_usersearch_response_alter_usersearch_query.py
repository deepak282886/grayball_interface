# Generated by Django 5.0.1 on 2024-01-21 05:08

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("grayball_chat", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="usersearch",
            name="response",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="usersearch",
            name="query",
            field=models.CharField(max_length=2000),
        ),
    ]
