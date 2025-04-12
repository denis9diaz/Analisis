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
            ("12/04/2025", "Brighton - Leicester", 94.5, 100.0, 97.3, "1 (2)", "0 (0)", "LIVE", ""),
            ("12/04/2025", "PSV - Almere", 99.9, 91.6, 95.8, "1 (-)", "1 (2)", "LIVE", ""),
            ("12/04/2025", "Sheffield Wed. - Oxford", 97.2, 85.0, 91.1, "2 (2)", "0 (1)", "LIVE", ""),
        ]

        liga_mapping = {
            "Premier League": ("Premier League", "GB-ENG"),
            "Eredivisie": ("Eredivisie", "NL"),
            "Championship": ("Championship", "GB-ENG"),
        }

        def detectar_liga(nombre_partido):
            nombre = nombre_partido.lower()
            if any(e in nombre for e in ["brighton", "leicester"]):
                return liga_mapping["Premier League"]
            if any(e in nombre for e in ["psv", "almere"]):
                return liga_mapping["Eredivisie"]
            if any(e in nombre for e in ["sheffield", "oxford"]):
                return liga_mapping["Championship"]
            return None

        def extraer_racha(valor):
            return valor.split(" ")[0] if valor and " " in valor else valor

        creados = 0

        for datos in partidos_data:
            try:
                fecha = datetime.strptime(datos[0], "%d/%m/%Y").date()
                nombre_partido = datos[1]
                liga_info = detectar_liga(nombre_partido)
                liga = Liga.objects.filter(nombre=liga_info[0], codigo_pais=liga_info[1]).first() if liga_info else None
                if not liga:
                    self.stderr.write(f"\n⚠️ Liga no encontrada para partido {nombre_partido}: {liga_info}")

                Partido.objects.create(
                    metodo=metodo,
                    fecha=fecha,
                    nombre_partido=nombre_partido,
                    liga=liga,
                    porcentaje_local=datos[2],
                    porcentaje_visitante=datos[3],
                    porcentaje_general=datos[4],
                    racha_local=extraer_racha(datos[5]),
                    racha_hist_local=None,
                    racha_visitante=extraer_racha(datos[6]),
                    racha_hist_visitante=None,
                    estado=datos[7],
                    notas=datos[8],
                    cumplido=None,
                    equipo_destacado="local",
                )
                creados += 1
            except Exception as e:
                self.stderr.write(f"\n⚠️ Error al crear partido {datos[1]}: {e}")

        self.stdout.write(f"\n✅ Se han importado {creados} partidos para el método 'Team to Score'.")
