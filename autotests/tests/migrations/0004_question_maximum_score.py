# Generated by Django 3.0.3 on 2020-05-24 11:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0003_auto_20200524_0925'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='maximum_score',
            field=models.IntegerField(default=0),
        ),
    ]