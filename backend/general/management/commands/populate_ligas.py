from django.core.management.base import BaseCommand
from general.models import Liga

LIGAS = [
    ("Keuken Kampioen Divisie", "NL"),
    ("Eredivisie", "NL"),
    ("Bundesliga", "DE"),
    ("Bundesliga II", "DE"),
    ("A-League", "AU"),
    ("Bundesliga (Austria)", "AT"),
    ("Jupiler Pro-League", "BE"),
    ("Superliga", "DK"),
    ("Championship", "GB"),
    ("League One", "GB"),
    ("League Two", "GB"),
    ("Premier League", "GB"),
    ("Ligue 1", "FR"),
    ("Serie A", "IT"),
    ("Premier League (Escocia)", "GB"),
    ("Super League", "CH"),
    ("Super Lig", "TR"),
    ("MLS", "US"),
    ("Serie A Betano", "BR"),
    ("LaLiga Hypermotion", "ES"),
    ("Meistriliiga", "EE"),
    ("Esiliiga", "EE"),
    ("Veikkausliiga", "FI"),
    ("Ykkosliiga", "FI"),
    ("Besta deild karla", "IS"),
    ("Division 1", "FI"),
    ("Eliteserien", "NO"),
    ("OBOS-ligaen", "NO"),
    ("Allsvenskan", "SE"),
    ("Superettan", "SE"),
    ("Liga Portugal", "PT"),
]

class Command(BaseCommand):
    help = 'Puebla la base de datos con las ligas y sus países'

    def handle(self, *args, **kwargs):
        for nombre, codigo_pais in LIGAS:
            liga, created = Liga.objects.get_or_create(nombre=nombre, defaults={"codigo_pais": codigo_pais})
            if created:
                self.stdout.write(self.style.SUCCESS(f"Liga creada: {nombre} ({codigo_pais})"))
            else:
                self.stdout.write(self.style.WARNING(f"Liga ya existente: {nombre}"))
