# Generated by Django 5.2 on 2025-04-24 20:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='court',
            name='characteristics',
            field=models.TextField(blank=True, help_text='Características específicas de la cancha (ej: tipo de superficie, tamaño, si es techada)'),
        ),
    ]
