from django.core.management.base import BaseCommand
from general.models import Partido, MetodoAnalisis, Liga
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Importa partidos para el método Over 0.5 HT'

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username="denis.analisis")
        except User.DoesNotExist:
            self.stderr.write("\n❌ El usuario 'denis.analisis' no existe.\n")
            return

        metodo = MetodoAnalisis.objects.filter(nombre="Over 0.5 HT", usuario=user).first()
        if not metodo:
            self.stderr.write("\n❌ El método 'Over 0.5 HT' no existe para el usuario 'denis.analisis'.\n")
            return

        partidos_data = [
            ("01/04/2025", "Crewe - Grimsby", 95.6, 94.3, 95.0, "1", "2", "1", "1", "NO", "Crewe a 1 de su racha histórica y rachas demasiado cortas de los dos equipos"),
            ("02/04/2025", "Manchester City - Leicester", 90.9, 95.4, 93.2, "0", "1", "1", "1", "LIVE", ""),
            ("02/04/2025", "Notts County - MK Dons", 98.2, 88.4, 93.3, "2", "3", "0", "1", "NO", "Los dos equipos a 1 de su racha histórica"),
            ("03/04/2025", "Chelsea - Tottenham", 95.5, 98.5, 97.0, "1", "2", "1", "2", "NO", "Los dos equipos a 1 de su racha histórica"),
            ("04/04/2025", "Heerenveen - Willem", 90.0, 94.7, 92.4, "0", "1", "1", "1", "NO", "Willem recién ascendido y Heerenveen a 1 de su racha histórica"),
            ("04/04/2025", "Karlsruher - Hannover", 99.9, 73.3, 86.6, "2", "-", "0", "2", "LIVE", ""),
            ("04/04/2025", "Augsburgo - Bayern Munich", 98.2, 99.0, 98.6, "3", "3", "1", "1", "LIVE", ""),
            ("04/04/2025", "Maastricht - Excelsior", 99.1, 85.9, 92.5, "2", "2", "1", "1", "NO", "Excelsior recién ascendido y muy under. Racha solo de 1 pero muchas veces seguidas"),
            ("05/04/2025", "Leipzig - Hoffenheim", 83.3, 99.2, 91.3, "0", "2", "2", "2", "LIVE", ""),
            ("05/04/2025", "Grimsby - Morecambe", 99.4, 94.6, 97.0, "3", "-", "1", "3", "NO", "Morecambe a 2 de su racha histórica y este año muy under"),
            ("06/04/2025", "Ajax - Breda", 99.9, 69.2, 84.6, "2", "-", "0", "2", "LIVE", ""),
            ("06/04/2025", "Atalanta - Lazio", 99.7, 79.4, 89.6, "3", "-", "0", "1", "LIVE", "Actitud horrible de la Atalanta. Liga horrible"),
            ("06/04/2025", "Reims - Estrasburgo", 80.6, 99.8, 90.2, "0", "1", "4", "-", "NO", "Reims a 1 de su racha histórica y Estrasburgo horrible esta temporada en este mercado"),
            ("07/04/2025", "Goztepe - Gaziantep", 94.7, 95.2, 94.3, "1", "2", "1", "1", "NO", "Goztepe a 1 de su racha histórica y recién ascendio"),
            ("07/04/2025", "Farense - Casa Pia", 99.8, 70.0, 84.9, "4", "-", "0", "2", "NO", "Liga descartada"),
        ]

        liga_mapping = {
            "Premier League": ("Premier League", "GB-ENG"),
            "Championship": ("Championship", "GB-ENG"),
            "Bundesliga": ("Bundesliga", "DE"),
            "Bundesliga II": ("Bundesliga II", "DE"),
            "Keuken Kampioen": ("Keuken Kampioen", "NL"),
            "Eredivisie": ("Eredivisie", "NL"),
            "Serie A": ("Serie A", "IT"),
            "Ligue 1": ("Ligue 1", "FR"),
            "Super Lig": ("Super Lig", "TR"),
            "Liga Portugal": ("Liga Portugal", "PT"),
            "League Two": ("League Two", "GB-ENG"),
        }

        def detectar_liga(nombre_partido):
            nombre = nombre_partido.lower()
            if any(e in nombre for e in ["manchester city", "leicester", "chelsea", "tottenham"]):
                return liga_mapping["Premier League"]
            if any(e in nombre for e in ["crewe", "grimsby", "notts county", "mk dons", "morecambe"]):
                return liga_mapping["League Two"]
            if any(e in nombre for e in ["heerenveen", "willem", "maastricht", "excelsior"]):
                return liga_mapping["Keuken Kampioen"]
            if any(e in nombre for e in ["augsburgo", "bayern", "leipzig", "hoffenheim"]):
                return liga_mapping["Bundesliga"]
            if any(e in nombre for e in ["karlsruher", "hannover"]):
                return liga_mapping["Bundesliga II"]
            if any(e in nombre for e in ["ajax", "breda"]):
                return liga_mapping["Eredivisie"]
            if any(e in nombre for e in ["atalanta", "lazio"]):
                return liga_mapping["Serie A"]
            if any(e in nombre for e in ["reims", "estrasburgo"]):
                return liga_mapping["Ligue 1"]
            if any(e in nombre for e in ["goztepe", "gaziantep"]):
                return liga_mapping["Super Lig"]
            if any(e in nombre for e in ["farense", "casa pia"]):
                return liga_mapping["Liga Portugal"]
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

        self.stdout.write(f"\n✅ Se han importado {creados} partidos para el método 'Over 0.5 HT'.")
