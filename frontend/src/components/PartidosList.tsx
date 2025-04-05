import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import PartidoFormModal from "./PartidoFormModal";
import { fetchWithAuth } from "../utils/authFetch";

type Partido = {
  id: number;
  nombre_partido: string;
  liga: {
    id: number;
    nombre: string;
    codigo_pais: string;
  } | null;
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

const MESES = [
  { value: "2025-01", label: "Enero 2025" },
  { value: "2025-02", label: "Febrero 2025" },
  { value: "2025-03", label: "Marzo 2025" },
  { value: "2025-04", label: "Abril 2025" },
  { value: "2025-05", label: "Mayo 2025" },
  { value: "2025-06", label: "Junio 2025" },
  { value: "2025-07", label: "Julio 2025" },
  { value: "2025-08", label: "Agosto 2025" },
  { value: "2025-09", label: "Septiembre 2025" },
  { value: "2025-10", label: "Octubre 2025" },
  { value: "2025-11", label: "Noviembre 2025" },
  { value: "2025-12", label: "Diciembre 2025" },
];

export default function PartidosList() {
  const { metodoSeleccionado } = useMetodo();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [filtroLiga, setFiltroLiga] = useState("TODAS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroResultado, setFiltroResultado] = useState("TODOS");
  const [filtroMes, setFiltroMes] = useState("TODOS");

  const formatFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (!metodoSeleccionado) return;

    fetchWithAuth("http://localhost:8000/api/general/partidos/")
      .then((res) => res.json())
      .then((data: Partido[]) => {
        const filtrados = data
          .filter((p) => p.metodo === metodoSeleccionado.id)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setPartidos(filtrados);
      });
  }, [metodoSeleccionado]);

  const ligasUnicas = Array.from(
    new Set(partidos.map((p) => p.liga?.nombre).filter(Boolean))
  );

  const partidosFiltrados = partidos.filter((p) => {
    const coincideLiga = filtroLiga === "TODAS" || p.liga?.nombre === filtroLiga;
    const coincideEstado = filtroEstado === "TODOS" || p.estado === filtroEstado;
    const coincideResultado = filtroResultado === "TODOS" || (p.cumplido || "") === filtroResultado;
    const coincideMes = filtroMes === "TODOS" || p.fecha.startsWith(filtroMes);
    return coincideLiga && coincideEstado && coincideResultado && coincideMes;
  });

  const total = partidosFiltrados.length;
  const aciertos = partidosFiltrados.filter((p) => p.cumplido === "VERDE").length;
  const fallos = partidosFiltrados.filter((p) => p.cumplido === "ROJO").length;
  const sinResultado = partidosFiltrados.filter((p) => !p.cumplido || p.cumplido === "").length;
  const porcentaje = total > 0 ? ((aciertos / total) * 100).toFixed(1) : "0";

  const handleResultadoChange = async (id: number, nuevoResultado: string) => {
    const res = await fetchWithAuth("http://localhost:8000/api/general/partidos/", {
      method: "PATCH",
      body: JSON.stringify({ id, cumplido: nuevoResultado || null }),
    });

    const partidoActualizado: Partido = await res.json();
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cumplido: partidoActualizado.cumplido } : p
      )
    );
  };

  if (!metodoSeleccionado) return null;

  return (
    <div className="p-4">
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
        >
          Añadir Partido
        </button>

        <div className="flex gap-4">
          <select value={filtroLiga} onChange={(e) => setFiltroLiga(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm">
            <option value="TODAS">Todas las ligas</option>
            {ligasUnicas.map((liga) => (
              <option key={liga} value={liga}>{liga}</option>
            ))}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm">
            <option value="TODOS">Todos los estados</option>
            <option value="LIVE">LIVE</option>
            <option value="APOSTADO">APOSTADO</option>
            <option value="NO">NO</option>
          </select>
          <select value={filtroResultado} onChange={(e) => setFiltroResultado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm">
            <option value="TODOS">Todos los resultados</option>
            <option value="VERDE">Acierto</option>
            <option value="ROJO">Fallo</option>
            <option value="">Sin resultado</option>
          </select>
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm">
            <option value="TODOS">Todos los meses</option>
            {MESES.map((mes) => (
              <option key={mes.value} value={mes.value}>{mes.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm text-sm text-gray-700">
        <p className="mb-1 font-medium">📊 Estadísticas (según filtros aplicados):</p>
        <div className="flex flex-wrap gap-4">
          <span>Partidos: <strong>{total}</strong></span>
          <span className="text-green-700">Aciertos: <strong>{aciertos}</strong></span>
          <span className="text-red-700">Fallos: <strong>{fallos}</strong></span>
          <span className="text-gray-600">Sin resultado: <strong>{sinResultado}</strong></span>
          <span>Porcentaje de acierto: <strong>{porcentaje}%</strong></span>
        </div>
      </div>

      {/* Tabla */}
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
              <th className="px-3 py-2 text-center">Racha Loc.</th>
              <th className="px-3 py-2 text-center">Racha Vis.</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-center">Resultado</th>
              <th className="px-3 py-2 text-left">Notas</th>
            </tr>
          </thead>
          <tbody>
            {partidosFiltrados.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition border-t border-gray-200">
                <td className="px-3 py-2">{formatFecha(p.fecha)}</td>
                <td className="px-3 py-2">{p.nombre_partido}</td>
                <td className="px-3 py-2">
                  {p.liga ? (
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
                <td className="px-3 py-2 text-center">{p.porcentaje_visitante}%</td>
                <td className="px-3 py-2 text-center">{p.porcentaje_general}%</td>
                <td className="px-3 py-2 text-center">{p.racha_local} ({p.racha_hist_local})</td>
                <td className="px-3 py-2 text-center">{p.racha_visitante} ({p.racha_hist_visitante})</td>
                <td className="px-3 py-2 text-center">{p.estado}</td>
                <td className="px-3 py-2 text-center">
                  <select
                    value={p.cumplido || ""}
                    onChange={(e) => handleResultadoChange(p.id, e.target.value)}
                    className={`px-2 py-1 rounded-md border text-sm shadow-sm ${
                      p.cumplido === "VERDE"
                        ? "bg-green-100 text-green-800"
                        : p.cumplido === "ROJO"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    <option value="">Sin resultado</option>
                    <option value="VERDE">Acierto</option>
                    <option value="ROJO">Fallo</option>
                  </select>
                </td>
                <td className="px-3 py-2">{p.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PartidoFormModal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        onPartidoGuardado={() => {
          fetchWithAuth("http://localhost:8000/api/general/partidos/")
            .then((res) => res.json())
            .then((data: Partido[]) => {
              const filtrados = data
                .filter((p) => p.metodo === metodoSeleccionado.id)
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
              setPartidos(filtrados);
            });
        }}
      />
    </div>
  );
}
