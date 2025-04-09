from django.core.management.base import BaseCommand
from general.models import Partido, MetodoAnalisis, Liga
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Importa partidos para el método Team to Score'

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username="denis.analisis")
        except User.DoesNotExist:
            self.stderr.write("\n❌ El usuario 'denis.analisis' no existe.\n")
            return

        metodo = MetodoAnalisis.objects.filter(nombre="Team to Score", usuario=user).first()
        if not metodo:
            self.stderr.write("\n❌ El método 'Team to Score' no existe para el usuario 'denis.analisis'.\n")
            return

        partidos_data = [
            ("03/04/2025", "Chelsea - Tottenham", 98.0, 95.5, 96.8, "2", "3", "1", "2", "NO", "Los dos a 1 de su racha histórica"),
            ("04/04/2025", "Augsburgo - Bayern Munich", 99.7, 93.3, 96.5, "3", "-", "0", "1", "LIVE", ""),
            ("04/04/2025", "Vittese - Jong AZ", 93.7, 98.8, 96.3, "1", "2", "2", "-", "LIVE", ""),
            ("04/04/2025", "TOP Oss - Venlo", 98.6, 98.0, 98.3, "3", "3", "1", "1", "LIVE", ""),
            ("05/04/2025", "Rotherham - Blackpool", 91.0, 97.2, 94.1, "1", "1", "2", "2", "LIVE", ""),
            ("06/04/2025", "Atalanta - Lazio", 99.9, 76.5, 88.2, "3", "-", "0", "1", "LIVE", "Nada que decir, racha horrible de la Atalanta"),
            ("06/04/2025", "St. Gallen - Servette", 99.2, 91.4, 95.3, "1", "1", "1", "3", "LIVE", ""),
            ("06/04/2025", "Silkeborg - Lyngby", 97.4, 98.8, 98.1, "2", "2", "1", "1", "LIVE", ""),
            ("07/04/2025", "Leicester - Newcastle", 99.8, 96.9, 98.4, "7", "-", "1", "2", "NO", "Leicester recién ascendido y Newcastle a 1 de su racha histórica"),
            ("07/04/2025", "Jong Utrecht - Den Haag", 92.2, 97.5, 94.9, "2", "2", "2", "2", "LIVE", ""),
        ]

        liga_mapping = {
            "Premier League": ("Premier League", "GB-ENG"),
            "Bundesliga": ("Bundesliga", "DE"),
            "Eredivisie": ("Eredivisie", "NL"),
            "Keuken Kampioen": ("Keuken Kampioen", "NL"),
            "Championship": ("Championship", "GB-ENG"),
            "Serie A": ("Serie A", "IT"),
            "Super League": ("Super League", "CH"),
            "Superliga": ("Superliga", "DK"),
        }

        def detectar_liga(nombre_partido):
            nombre = nombre_partido.lower()
            if any(e in nombre for e in ["chelsea", "tottenham", "leicester", "newcastle"]):
                return liga_mapping["Premier League"]
            if any(e in nombre for e in ["augsburgo", "bayern"]):
                return liga_mapping["Bundesliga"]
            if any(e in nombre for e in ["vittese", "jong az", "top oss", "venlo", "jong utrecht", "den haag"]):
                return liga_mapping["Keuken Kampioen"]
            if any(e in nombre for e in ["rotherham", "blackpool"]):
                return liga_mapping["Championship"]
            if any(e in nombre for e in ["atalanta", "lazio"]):
                return liga_mapping["Serie A"]
            if any(e in nombre for e in ["st. gallen", "servette"]):
                return liga_mapping["Super League"]
            if any(e in nombre for e in ["silkeborg", "lyngby"]):
                return liga_mapping["Superliga"]
            return None

        creados = 0

        for datos in partidos_data:
            try:
                fecha = datetime.strptime(datos[0], "%d/%m/%Y").date()
                liga_info = detectar_liga(datos[1])
                liga = None
                if liga_info:
                    liga = Liga.objects.filter(nombre=liga_info[0], codigo_pais=liga_info[1]).first()
                    if not liga:
                        self.stderr.write(f"\n⚠️ Liga no encontrada para partido {datos[1]}: {liga_info}")

                Partido.objects.create(
                    metodo=metodo,
                    fecha=fecha,
                    nombre_partido=datos[1],
                    liga=liga,
                    porcentaje_local=datos[2],
                    porcentaje_visitante=datos[3],
                    porcentaje_general=datos[4],
                    racha_local=datos[5],
                    racha_hist_local=datos[6],
                    racha_visitante=datos[7],
                    racha_hist_visitante=datos[8],
                    estado=datos[9],
                    notas=datos[10],
                )
                creados += 1
            except Exception as e:
                self.stderr.write(f"\n⚠️ Error al crear partido {datos[1]}: {e}")

        self.stdout.write(f"\n✅ Se han importado {creados} partidos para el método 'Team to Score'.")
