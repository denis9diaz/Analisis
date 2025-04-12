from django.core.management.base import BaseCommand
from general.models import Partido, MetodoAnalisis, Liga
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Importa partidos del 12/04/2025 para el método Over 0.5 HT'

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
            ("12/04/2025", "Kiel - St. Pauli", 100.0, 78.6, 89.3, "0", "0", "0", "1", "NO", "Kiel en algún momento debería fallar. St. Pauli a 1 de su racha histórica. Los dos equipos recién ascendidos"),
            ("12/04/2025", "Ulm - Magdeburgo", 91.2, 93.3, 92.3, "4", "-", "1", "2", "NO", "Magdeburgo a 1 de su racha histórica y Ulm recién ascendidos y muy under"),
        ]

        liga_mapping = {
            "Bundesliga": ("Bundesliga", "DE"),
            "Bundesliga II": ("Bundesliga II", "DE"),
        }

        def detectar_liga(nombre_partido):
            nombre = nombre_partido.lower()
            if any(e in nombre for e in ["st. pauli"]):
                return liga_mapping["Bundesliga"]
            if any(e in nombre for e in ["ulm", "magdeburgo", "kiel"]):
                return liga_mapping["Bundesliga II"]
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
                    cumplido=None,
                    equipo_destacado=None,
                )
                creados += 1
            except Exception as e:
                self.stderr.write(f"\n⚠️ Error al crear partido {datos[1]}: {e}")

        self.stdout.write(f"\n✅ Se han importado {creados} partidos para el método 'Over 0.5 HT'.")
