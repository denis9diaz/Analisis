from django.core.management.base import BaseCommand
from general.models import Liga

LIGAS = [
    ("Bundesliga", "DE"),
    ("Bundesliga II", "DE"),
    ("A-League", "AU"),
    ("Bundesliga", "AT"),
    ("Jupiler Pro-League", "BE"),
    ("Serie A Betano", "BR"),
    ("Superliga", "DK"),
    ("Premier League ESC", "GB-SCT"),
    ("LaLiga EA Sports", "ES"),
    ("LaLiga Hypermotion", "ES"),
    ("MLS", "US"),
    ("Meistriliiga", "EE"),
    ("Esiliiga", "EE"),
    ("Veikkausliiga", "FI"),
    ("Ykkosliiga", "FI"),
    ("Ligue 1", "FR"),
    ("Premier League", "GB-ENG"),
    ("Championship", "GB-ENG"),
    ("League One", "GB-ENG"),
    ("League Two", "GB-ENG"),
    ("Besta deild karla", "IS"),
    ("Division 1", "IS"),
    ("Serie A", "IT"),
    ("Eliteserien", "NO"),
    ("OBOS-ligaen", "NO"),
    ("Eredivisie", "NL"),
    ("Keuken Kampioen", "NL"),
    ("Liga Portugal", "PT"),
    ("Allsvenskan", "SE"),
    ("Superettan", "SE"),
    ("Super League", "CH"),
    ("Super Lig", "TR"),
    ("Champions League", "EU"),
    ("Europa League", "EU"),
    ("Conference League", "EU"),
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
