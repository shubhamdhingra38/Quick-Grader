# Generated by Django 3.0.5 on 2020-05-04 14:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='quiz',
            name='quiz_end',
        ),
        migrations.RemoveField(
            model_name='quiz',
            name='quiz_start',
        ),
    ]
