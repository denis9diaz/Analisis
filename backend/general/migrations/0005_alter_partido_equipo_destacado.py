# Generated by Django 5.1.7 on 2025-04-08 18:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('general', '0004_partido_equipo_destacado'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partido',
            name='equipo_destacado',
            field=models.CharField(blank=True, choices=[('local', 'Local'), ('visitante', 'Visitante')], max_length=10, null=True),
        ),
    ]
