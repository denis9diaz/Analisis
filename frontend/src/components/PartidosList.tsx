import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import PartidoFormModal from "./PartidoFormModal";

type Partido = {
  id: number;
  nombre_partido: string;
  liga: {
    id: number;
    nombre: string;
    codigo_pais: string;
  };
  fecha: string;
  porcentaje_local: number;
  porcentaje_visitante: number;
  porcentaje_general: number;
  racha_local: string;
  racha_visitante: string;
  racha_hist_local: string;
  racha_hist_visitante: string;
  estado: string;
  cumplido: string | null;
  notas: string;
  metodo: number;
};

export default function PartidosList() {
  const { metodoSeleccionado } = useMetodo();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [filtroLiga, setFiltroLiga] = useState<string>("TODAS");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

  const formatFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (!metodoSeleccionado) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/general/partidos/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data: Partido[]) => {
        const filtrados = data
          .filter((p) => p.metodo === metodoSeleccionado.id)
          .sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
        setPartidos(filtrados);
      })
      .catch((err) => console.error("Error cargando partidos:", err));
  }, [metodoSeleccionado]);

  const ligasUnicas = Array.from(
    new Set(partidos.map((p) => p.liga?.nombre).filter(Boolean))
  );

  const partidosFiltrados = partidos.filter((p) => {
    const coincideLiga =
      filtroLiga === "TODAS" || p.liga?.nombre === filtroLiga;
    const coincideEstado =
      filtroEstado === "TODOS" || p.estado === filtroEstado;
    return coincideLiga && coincideEstado;
  });

  if (!metodoSeleccionado) return null;

  return (
    <div className="p-4">
      {/* Botón + filtros */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
        >
          Añadir Partido
        </button>

        <div className="flex gap-4">
          <select
            value={filtroLiga}
            onChange={(e) => setFiltroLiga(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm"
          >
            <option value="TODAS">Todas las ligas</option>
            {ligasUnicas.map((liga) => (
              <option key={liga} value={liga}>
                {liga}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="LIVE">LIVE</option>
            <option value="APOSTADO">APOSTADO</option>
            <option value="NO">NO</option>
          </select>
        </div>
      </div>

      {/* Tabla de partidos */}
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="min-w-full text-sm text-gray-800 border-collapse">
          <thead className="bg-blue-600 text-white text-sm">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Partido</th>
              <th className="px-3 py-2 text-left">Liga</th>
              <th className="px-3 py-2 text-center">% Local</th>
              <th className="px-3 py-2 text-center">% Visitante</th>
              <th className="px-3 py-2 text-center">% General</th>
              <th className="px-3 py-2 text-center">RL</th>
              <th className="px-3 py-2 text-center">RV</th>
              <th className="px-3 py-2 text-center">RHL</th>
              <th className="px-3 py-2 text-center">RHV</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Notas</th>
            </tr>
          </thead>
          <tbody>
            {partidosFiltrados.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-gray-50 transition border-t border-gray-200"
              >
                <td className="px-3 py-2">{formatFecha(p.fecha)}</td>
                <td className="px-3 py-2">{p.nombre_partido}</td>
                <td className="px-3 py-2">
                  {p.liga && p.liga.codigo_pais ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w20/${p.liga.codigo_pais.toLowerCase()}.png`}
                        alt={p.liga.nombre}
                        width={20}
                        height={15}
                      />
                      {p.liga.nombre}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Sin liga</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">{p.porcentaje_local}%</td>
                <td className="px-3 py-2 text-center">
                  {p.porcentaje_visitante}%
                </td>
                <td className="px-3 py-2 text-center">
                  {p.porcentaje_general}%
                </td>
                <td className="px-3 py-2 text-center">{p.racha_local}</td>
                <td className="px-3 py-2 text-center">{p.racha_visitante}</td>
                <td className="px-3 py-2 text-center">{p.racha_hist_local}</td>
                <td className="px-3 py-2 text-center">
                  {p.racha_hist_visitante}
                </td>
                <td className="px-3 py-2">{p.estado}</td>
                <td className="px-3 py-2">{p.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario modal */}
      <PartidoFormModal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        onPartidoGuardado={() => {
          const token = localStorage.getItem("access_token");
          if (!token || !metodoSeleccionado) return;

          fetch("http://localhost:8000/api/general/partidos/", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data: Partido[]) => {
              const filtrados = data
                .filter((p) => p.metodo === metodoSeleccionado.id)
                .sort(
                  (a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );
              setPartidos(filtrados);
            });
        }}
      />
    </div>
  );
}
