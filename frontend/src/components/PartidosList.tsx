import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import PartidoFormModal from "./PartidoFormModal";
import { fetchWithAuth } from "../utils/authFetch";
import Select from "react-select";
import { Trash2 } from "lucide-react";
import Modal from "react-modal";

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
  equipo_destacado?: "local" | "visitante" | null;
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
  const [partidoAEliminar, setPartidoAEliminar] = useState<Partido | null>(
    null
  );
  const [notasTemp, setNotasTemp] = useState<{ [id: number]: string }>({});

  const handleNotasChange = (id: number, nuevaNota: string) => {
    setNotasTemp((prev) => ({ ...prev, [id]: nuevaNota }));
  };

  const guardarNotas = async (id: number) => {
    const nuevaNota = notasTemp[id];
    if (nuevaNota === undefined) return;

    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetchWithAuth(`${API_URL}/api/general/partidos/`, {
      method: "PATCH",
      body: JSON.stringify({ id, notas: nuevaNota }),
    });

    const partidoActualizado: Partido = await res.json();
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, notas: partidoActualizado.notas } : p
      )
    );

    setNotasTemp((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
  };

  const eliminarPartido = async () => {
    if (!partidoAEliminar) return;

    const API_URL = import.meta.env.PUBLIC_API_URL;
    await fetchWithAuth(`${API_URL}/api/general/partidos/`, {
      method: "DELETE",
      body: JSON.stringify({ id: partidoAEliminar.id }),
    });

    setPartidoAEliminar(null);

    // Refrescar la lista de partidos
    const res = await fetchWithAuth(`${API_URL}/api/general/partidos/`);
    const data: Partido[] = await res.json();
    const filtrados = data
      .filter((p) => p.metodo === metodoSeleccionado?.id)
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    setPartidos(filtrados);
  };

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

    const API_URL = import.meta.env.PUBLIC_API_URL;
    fetchWithAuth(`${API_URL}/api/general/partidos/`)
      .then((res) => res.json())
      .then((data: Partido[]) => {
        console.log("📦 Datos recibidos del backend:", data);
        const filtrados = data
          .filter((p) => p.metodo === metodoSeleccionado.id)
          .sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
        setPartidos(filtrados);
      });
  }, [metodoSeleccionado]);

  const ORDEN_LIGAS = [
    "Bundesliga",
    "Bundesliga II",
    "A-League",
    "Bundesliga (AT)", // este es para diferenciar si es necesario
    "Jupiler Pro-League",
    "Serie A Betano",
    "Superliga",
    "Premier League (GB-SCT)",
    "LaLiga EA Sports",
    "LaLiga Hypermotion",
    "MLS",
    "Meistriliiga",
    "Esiliiga",
    "Veikkausliiga",
    "Ykkosliiga",
    "Ligue 1",
    "Premier League",
    "Championship",
    "League One",
    "League Two",
    "Besta deild karla",
    "Division 1",
    "Serie A",
    "Eliteserien",
    "OBOS-ligaen",
    "Eredivisie",
    "Keuken Kampioen",
    "Liga Portugal",
    "Allsvenskan",
    "Superettan",
    "Super League",
    "Super Lig",
    "Champions League",
    "Europa League",
    "Conference League",
  ];

  const ligasMap = new Map<string, Partido["liga"]>();

  partidos.forEach((p) => {
    if (p.liga && !ligasMap.has(p.liga.nombre)) {
      ligasMap.set(
        p.liga.nombre,
        p.liga as { id: number; nombre: string; codigo_pais: string }
      );
    }
  });

  const ligasUnicas: { id: number; nombre: string; codigo_pais: string }[] =
    ORDEN_LIGAS.map((nombre) => ligasMap.get(nombre)).filter(
      (l): l is { id: number; nombre: string; codigo_pais: string } => !!l
    );

  const opcionesLiga = [
    { value: "TODAS", label: "Todas las ligas" },
    ...ligasUnicas.map((liga) => ({
      value: liga.nombre,
      label: (
        <div className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/w20/${liga.codigo_pais.toLowerCase()}.png`}
            alt={liga.nombre}
            className="inline"
            width={20}
            height={15}
          />
          <span>{liga.nombre}</span>
        </div>
      ),
    })),
  ];

  const mostrarPorcentaje = (valor: any) => {
    const numero = parseFloat(valor);
    return isNaN(numero) ? "-" : `${numero.toFixed(1)}%`;
  };

  const partidosFiltrados = partidos.filter((p) => {
    const coincideLiga =
      filtroLiga === "TODAS" || p.liga?.nombre === filtroLiga;
    const coincideEstado =
      filtroEstado === "TODOS" || p.estado === filtroEstado;
    const coincideResultado =
      filtroResultado === "TODOS" || (p.cumplido || "") === filtroResultado;
    const coincideMes = filtroMes === "TODOS" || p.fecha.startsWith(filtroMes);
    return coincideLiga && coincideEstado && coincideResultado && coincideMes;
  });

  const itemsPorPagina = 11;
  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(partidosFiltrados.length / itemsPorPagina);
  const partidosPaginados = partidosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const total = partidosFiltrados.length;
  const aciertos = partidosFiltrados.filter(
    (p) => p.cumplido === "VERDE"
  ).length;
  const fallos = partidosFiltrados.filter((p) => p.cumplido === "ROJO").length;
  const sinResultado = partidosFiltrados.filter(
    (p) => !p.cumplido || p.cumplido === ""
  ).length;
  const porcentaje = total > 0 ? ((aciertos / total) * 100).toFixed(1) : "0";

  const handleResultadoChange = async (id: number, nuevoResultado: string) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetchWithAuth(`${API_URL}/api/general/partidos/`, {
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
    <div className="p-1">
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-gray-700">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
        >
          Añadir partido
        </button>

        <div className="flex gap-4 items-center flex-wrap">
          {/* Filtro liga */}
          <div className="min-w-[200px]">
            <Select
              options={[
                { value: "TODAS", label: "Todas las ligas" },
                ...ligasUnicas.map((liga) => ({
                  value: liga.nombre,
                  label: (
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w20/${liga.codigo_pais.toLowerCase()}.png`}
                        alt={liga.nombre}
                        className="inline"
                        width={20}
                        height={15}
                      />
                      <span>{liga.nombre}</span>
                    </div>
                  ),
                })),
              ]}
              value={
                filtroLiga === "TODAS"
                  ? { value: "TODAS", label: "Todas las ligas" }
                  : {
                      value: filtroLiga,
                      label: (
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w20/${ligasUnicas
                              .find((l) => l.nombre === filtroLiga)
                              ?.codigo_pais.toLowerCase()}.png`}
                            alt={filtroLiga}
                            width={20}
                            height={15}
                          />
                          <span>{filtroLiga}</span>
                        </div>
                      ),
                    }
              }
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setFiltroLiga(selectedOption.value);
                }
              }}
              classNamePrefix="react-select"
            />
          </div>

          {/* Filtro estado */}
          <div className="min-w-[200px]">
            <Select
              options={[
                { value: "TODOS", label: "Todos los estados" },
                { value: "LIVE", label: "LIVE" },
                { value: "APOSTADO", label: "APOSTADO" },
                { value: "NO", label: "NO" },
              ]}
              value={{
                value: filtroEstado,
                label:
                  filtroEstado === "TODOS" ? "Todos los estados" : filtroEstado,
              }}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setFiltroEstado(selectedOption.value);
                }
              }}
              classNamePrefix="react-select"
            />
          </div>

          {/* Filtro resultado */}
          <div className="min-w-[200px]">
            <Select
              options={[
                { value: "TODOS", label: "Todos los resultados" },
                { value: "VERDE", label: "Acierto" },
                { value: "ROJO", label: "Fallo" },
                { value: "", label: "Sin resultado" },
              ]}
              value={{
                value: filtroResultado,
                label:
                  filtroResultado === "TODOS"
                    ? "Todos los resultados"
                    : filtroResultado === "VERDE"
                    ? "Acierto"
                    : filtroResultado === "ROJO"
                    ? "Fallo"
                    : "Sin resultado",
              }}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setFiltroResultado(selectedOption.value);
                }
              }}
              classNamePrefix="react-select"
            />
          </div>

          {/* Filtro mes */}
          <div className="min-w-[200px]">
            <Select
              options={[{ value: "TODOS", label: "Todos los meses" }, ...MESES]}
              value={
                filtroMes === "TODOS"
                  ? { value: "TODOS", label: "Todos los meses" }
                  : MESES.find((m) => m.value === filtroMes)
              }
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setFiltroMes(selectedOption.value);
                }
              }}
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm text-sm text-gray-700">
        <p className="mb-1 font-medium flex items-center gap-2">
          <img src="/2.png" alt="Estadísticas" className="w-5 h-5" />
          Estadísticas (según filtros aplicados):
        </p>
        <div className="flex flex-wrap gap-4">
          <span>
            Partidos: <strong>{total}</strong>
          </span>
          <span className="text-green-700">
            Aciertos: <strong>{aciertos}</strong>
          </span>
          <span className="text-red-700">
            Fallos: <strong>{fallos}</strong>
          </span>
          <span className="text-gray-600">
            Sin resultado: <strong>{sinResultado}</strong>
          </span>
          <span>
            Porcentaje de acierto: <strong>{porcentaje}%</strong>
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="min-w-full text-sm text-gray-800 border-collapse table-fixed">
          <thead className="bg-blue-600 text-white text-sm">
            <tr>
              <th className="px-3 py-2 text-left w-[100px]">Fecha</th>
              <th className="px-3 py-2 text-left w-[180px]">Liga</th>
              <th className="px-3 py-2 text-left w-[250px]">Partido</th>
              <th className="px-3 py-2 text-center w-[80px]">% Local</th>
              <th className="px-3 py-2 text-center w-[80px]">% Visit.</th>
              <th className="px-3 py-2 text-center w-[80px]">% Total</th>
              <th className="px-3 py-2 text-center w-[60px]">R.L.</th>
              <th className="px-3 py-2 text-center w-[60px]">R.V.</th>
              <th className="px-3 py-2 text-center w-[50px]">Estado</th>
              <th className="px-3 py-2 text-left w-[280px]">Notas</th>
              <th className="px-2 py-2 w-[30px]"></th>
            </tr>
          </thead>
          <tbody>
            {partidosPaginados.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-gray-50 transition border-t border-gray-200"
              >
                <td className="px-3 py-2 w-[100px]">{formatFecha(p.fecha)}</td>
                <td className="px-3 py-2 w-[180px]">
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
                <td className="px-3 py-2 w-[250px]">
                  {metodoSeleccionado?.nombre === "Team to Score"
                    ? (() => {
                        const [local, visitante] =
                          p.nombre_partido.split(" - ");
                        return (
                          <span>
                            {p.equipo_destacado === "local" ? (
                              <strong>{local}</strong>
                            ) : (
                              local
                            )}{" "}
                            -{" "}
                            {p.equipo_destacado === "visitante" ? (
                              <strong>{visitante}</strong>
                            ) : (
                              visitante
                            )}
                          </span>
                        );
                      })()
                    : p.nombre_partido}
                </td>
                <td className="px-3 py-2 text-center w-[80px]">
                  {mostrarPorcentaje(p.porcentaje_local)}
                </td>
                <td className="px-3 py-2 text-center w-[80px]">
                  {mostrarPorcentaje(p.porcentaje_visitante)}
                </td>
                <td className="px-3 py-2 text-center w-[80px]">
                  {mostrarPorcentaje(p.porcentaje_general)}
                </td>
                <td className="px-3 py-2 text-center w-[60px]">
                  {p.racha_local} ({p.racha_hist_local})
                </td>
                <td className="px-3 py-2 text-center w-[60px]">
                  {p.racha_visitante} ({p.racha_hist_visitante})
                </td>
                <td
                  className={`px-3 py-2 text-center w-[105px] rounded-md transition duration-300
      ${
        p.cumplido === "VERDE"
          ? "bg-green-100 text-green-800"
          : p.cumplido === "ROJO"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-600"
      }`}
                >
                  <div className="relative group">
                    <span className="block cursor-pointer group-hover:opacity-0 transition-opacity">
                      {p.estado}
                    </span>
                    <select
                      value={p.cumplido || ""}
                      onChange={(e) =>
                        handleResultadoChange(p.id, e.target.value)
                      }
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <option value="">Sin resultado</option>
                      <option value="VERDE">Acierto</option>
                      <option value="ROJO">Fallo</option>
                    </select>
                  </div>
                </td>
                <td className="px-3 py-2 text-left w-[280px]">
                  <textarea
                    value={
                      notasTemp[p.id] !== undefined ? notasTemp[p.id] : p.notas
                    }
                    onChange={(e) => handleNotasChange(p.id, e.target.value)}
                    onBlur={() => guardarNotas(p.id)}
                    spellCheck={false}
                    className="w-full h-[25px] resize-none border rounded-md p-1 text-sm whitespace-nowrap overflow-x-auto overflow-y-hidden custom-scroll"
                  />
                </td>
                <td className="px-2 py-2 w-[30px] text-center">
                  <button
                    onClick={() => setPartidoAEliminar(p)}
                    className="text-gray-400 hover:text-rose-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Controles de paginación */}
        <div className="flex justify-center mt-3 gap-2 text-sm mb-2">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              className={`px-3 py-1 rounded ${
                paginaActual === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <PartidoFormModal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        onPartidoGuardado={() => {
          const API_URL = import.meta.env.PUBLIC_API_URL;
          fetchWithAuth(`${API_URL}/api/general/partidos/`)
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

      <Modal
        isOpen={!!partidoAEliminar}
        onRequestClose={() => setPartidoAEliminar(null)}
        className="bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto mt-40"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          ¿Estás seguro que deseas eliminar este partido?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setPartidoAEliminar(null)}
            className="border border-rose-600 text-rose-600 px-5 py-2 rounded-xl hover:bg-rose-50 transition duration-300 text-sm font-semibold mr-2 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={eliminarPartido}
            className="border border-blue-600 text-blue-600 px-5 py-2 rounded-xl hover:bg-blue-50 transition duration-300 text-sm font-semibold cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
