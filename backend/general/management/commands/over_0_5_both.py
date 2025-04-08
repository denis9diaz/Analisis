from django.core.management.base import BaseCommand
from general.models import Partido, MetodoAnalisis, Liga
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Importa partidos para el método Over 0.5 HT - Both'

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username="denis.analisis")
        except User.DoesNotExist:
            self.stderr.write("\n❌ El usuario 'denis.analisis' no existe.\n")
            return

        metodo = MetodoAnalisis.objects.filter(nombre="Over 0.5 HT - Both", usuario=user).first()
        if not metodo:
            self.stderr.write("\n❌ El método 'Over 0.5 HT - Both' no existe para el usuario 'denis.analisis'.\n")
            return

        partidos_data = [
            ("01/04/2025", "Wolves - West Ham", 80.6, 98.7, 89.7, "0", "2", "2", "4", "NO", "Los dos equipos lejos de su racha histórica"),
            ("01/04/2025", "Crewe - Grimsby", 97.7, 99.9, 98.8, "2", "4", "4", "-", "LIVE", ""),
            ("04/04/2025", "Augsburgo - Bayern Munich", 98.2, 82.0, 90.1, "2", "4", "0", "2", "NO", "Los dos a 2 de su racha histórica"),
            ("04/04/2025", "Maastricht - Excelsior", 99.5, 68.8, 84.2, "3", "-", "0", "3", "NO", "Equipos muy unders este año y Excelsior recién ascendido"),
            ("05/04/2025", "Leipzig - Hoffenheim", 93.1, 99.6, 96.4, "1", "2", "2", "2", "LIVE", ""),
            ("06/04/2025", "Vancouver Whitecaps - Colorado Rapids", 94.8, 96.4, 95.6, "1", "2", "1", "1", "LIVE", ""),
            ("06/04/2025", "Tottenham - Southampton", 99.6, 83.3, 91.5, "2", "2", "0", "2", "LIVE", ""),
            ("06/04/2025", "Villarreal - Athletic Club", 80.3, 99.3, 89.8, "0", "2", "4", "-", "LIVE", "Lo único que puedo apuntar es que el Villarreal estaba a 2 de su racha histórica y el Athletic bastante under este año"),
            ("08/04/2025", "Shrewsbury - Reading", 94.9, 97.8, 96.4, "2", "3", "2", "3", "NO", "Los dos equipos a 1 de su racha histórica"),
            ("08/04/2025", "Huddersfield - Wycombe", 91.0, 96.8, 93.9, "1", "2", "5", "-", "LIVE", ""),
        ]

        liga_mapping = {
            "Premier League": ("Premier League", "GB-ENG"),
            "Championship": ("Championship", "GB-ENG"),
            "Bundesliga": ("Bundesliga", "DE"),
            "Keuken Kampioen": ("Keuken Kampioen", "NL"),
            "MLS": ("MLS", "US"),
            "LaLiga EA Sports": ("LaLiga EA Sports", "ES"),
            "League One": ("League One", "GB-ENG"),
            "League Two": ("League Two", "GB-ENG"),
        }

        def detectar_liga(nombre_partido):
            nombre = nombre_partido.lower()
            if any(equipo in nombre for equipo in ["tottenham", "west ham", "southampton"]):
                return liga_mapping["Premier League"]
            if any(equipo in nombre for equipo in ["wolves", "reading", "crewe", "grimsby", "huddersfield", "wycombe", "shrewsbury"]):
                return liga_mapping["Championship"]
            if any(equipo in nombre for equipo in ["augsburgo", "bayern", "leipzig", "hoffenheim"]):
                return liga_mapping["Bundesliga"]
            if any(equipo in nombre for equipo in ["maastricht", "excelsior"]):
                return liga_mapping["Keuken Kampioen"]
            if any(equipo in nombre for equipo in ["vancouver", "colorado"]):
                return liga_mapping["MLS"]
            if any(equipo in nombre for equipo in ["villarreal", "athletic"]):
                return liga_mapping["LaLiga EA Sports"]
            if any(equipo in nombre for equipo in ["crewe", "grimsby"]):
                return liga_mapping["League Two"]
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

        self.stdout.write(f"\n✅ Se han importado {creados} partidos para el método 'Over 0.5 HT - Both'.")
