from django.core.management.base import BaseCommand
from general.models import Partido, MetodoAnalisis, Liga
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Importa partidos del 12/04/2025 para el método Over 0.5 HT - Both'

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username="denis.analisis")
        except User.DoesNotExist:
            self.stderr.write("\n❌ El usuario 'denis.analisis' no existe.\n")
            return

        metodo = MetodoAnalisis.objects.filter(nombre="Over 0.5 HT - Both", usuario=user).first()
        if not metodo:
            self.stderr.write("\n❌ El método 'Over 0.5 HT - Both' no existe para el usuario.\n")
            return

        partidos_data = [
            # fecha, nombre_partido, %local, %visitante, %general, racha_local, racha_hist_local, racha_visitante, racha_hist_visitante, estado, notas
            ("12/04/2025", "Hertha - Darmstadt", 96.9, 97.7, 97.3, "1", "2", "2", "2", "LIVE", ""),
            ("12/04/2025", "Doncaster - Wimbledon", 95.8, 98.2, 97.0, "1", "2", "4", "4", "NO", "Wimbledon demasiado under (53%) y Doncaster a 1 de su racha. Se juegan mucho"),
            ("12/04/2025", "Portsmouth - Derby County", 96.8, 97.7, 97.3, "2", "3", "2", "3", "NO", "Los dos vienen de otra categoría. Derby a 1 de su racha histórica. Se juegan mucho. Equipos unders y liga under"),
            ("12/04/2025", "Zaragoza - Eibar", 97.6, 99.9, 98.8, "3", "4", "4", "-", "NO", "Liga descartada"),
        ]

        liga_mapping = {
            "Hertha - Darmstadt": ("Bundesliga II", "DE"),
            "Doncaster - Wimbledon": ("League Two", "GB-ENG"),
            "Portsmouth - Derby County": ("Championship", "GB-ENG"),
            "Zaragoza - Eibar": ("LaLiga Hypermotion", "ES"),
        }

        creados = 0

        for datos in partidos_data:
            try:
                fecha = datetime.strptime(datos[0], "%d/%m/%Y").date()
                nombre_partido = datos[1]
                liga_nombre, codigo_pais = liga_mapping.get(nombre_partido, (None, None))
                liga = Liga.objects.filter(nombre=liga_nombre, codigo_pais=codigo_pais).first() if liga_nombre else None
                if not liga:
                    self.stderr.write(f"\n⚠️ Liga no encontrada para partido {nombre_partido}: {liga_nombre} ({codigo_pais})")

                Partido.objects.create(
                    metodo=metodo,
                    fecha=fecha,
                    nombre_partido=nombre_partido,
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
