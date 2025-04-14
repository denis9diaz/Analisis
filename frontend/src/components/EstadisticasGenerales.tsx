import EstadisticasUsuario from "./EstadisticasUsuario";
import NotasGraficos from "./NotasGraficos";

export default function EstadisticasGenerales() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-10">
        Estadísticas generales
      </h1>
      <EstadisticasUsuario />
      <h1 className="text-2xl font-bold text-gray-800 mb-6 mt-20">
        Estadísticas de notas
      </h1>
      <NotasGraficos />
    </section>
  );
}
