import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import PartidoFormModal from "./PartidoFormModal";
import { fetchWithAuth } from "../utils/authFetch";
import Select from "react-select";
import { Trash2 } from "lucide-react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

type Option = {
  value: string;
  label: string;
  data: {
    id: number;
    nombre: string;
    codigo_pais: string;
  };
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
  const [nombreEditado, setNombreEditado] = useState<{ [id: number]: string }>(
    {}
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  useEffect(() => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    fetchWithAuth(`${API_URL}/api/general/ligas/`)
      .then((res) => res.json())
      .then((data) => setLigasBackend(data));
  }, []);

  const ORDEN_VISUAL = [
    "Bundesliga",
    "Bundesliga II",
    "A-League",
    "Bundesliga AUS",
    "Jupiler Pro-League",
    "Serie A Betano",
    "Superliga",
    "Premier League ESC",
    "LaLiga EA Sports",
    "LaLiga Hypermotion",
    "MLS",
    "Meistriliiga",
    "Esiliiga",
    "Veikkausliiga",
    "Ykkosliiga",
    "Ligue 1",
    "Ligue 2",
    "Premier League",
    "Championship",
    "League One",
    "League Two",
    "Premier League IRL",
    "Besta deild karla",
    "Division 1",
    "Serie A",
    "Serie B",
    "Eliteserien",
    "OBOS-ligaen",
    "Eredivisie",
    "Keuken Kampioen",
    "Liga Portugal",
    "Allsvenskan",
    "Superettan",
    "Super League",
    "Challenge League",
    "Super Lig",
    "1. Lig",
    "Champions League",
    "Europa League",
    "Conference League",
  ];

  const [ligasBackend, setLigasBackend] = useState<
    { id: number; nombre: string; codigo_pais: string }[]
  >([]);

  const ligasOrdenadas = ORDEN_VISUAL.map((nombre) =>
    ligasBackend.find((liga) => liga.nombre === nombre)
  ).filter(Boolean) as { id: number; nombre: string; codigo_pais: string }[];

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
    ligasOrdenadas.map((liga) => {
      const ligaEncontrada = Array.from(ligasMap.values()).find(
        (l) => l?.nombre === liga.nombre
      );
      return (
        ligaEncontrada || {
          id: -1,
          nombre: liga.nombre,
          codigo_pais: liga.codigo_pais,
        }
      );
    });

  const opcionesLiga = [
    { value: "TODAS", label: "Todas las ligas" },
    ...ligasUnicas.map((liga) => ({
      value: liga.nombre,
      label: (
        <div className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/w40/${liga.codigo_pais.toLowerCase()}.png`}
            alt={liga.codigo_pais}
            className="inline-block h-4 w-6 object-cover"
            onError={(e) => (e.currentTarget.src = "/flags/placeholder.png")} // Use placeholder if flag fails to load
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

  const opcionesLigaEditable: Option[] = ligasOrdenadas.map((liga) => ({
    value: liga.nombre,
    label: liga.nombre,
    data: liga,
  }));

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

  const itemsPorPagina = 14;
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

  const handlePartidoChange = async (id: number, nuevoNombre: string) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetchWithAuth(`${API_URL}/api/general/partidos/`, {
      method: "PATCH",
      body: JSON.stringify({ id, nombre_partido: nuevoNombre }),
    });

    const partidoActualizado: Partido = await res.json();
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, nombre_partido: partidoActualizado.nombre_partido }
          : p
      )
    );
  };

  const handleFechaChange = async (id: number, nuevaFecha: Date) => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetchWithAuth(`${API_URL}/api/general/partidos/`, {
      method: "PATCH",
      body: JSON.stringify({
        id,
        fecha: nuevaFecha.toISOString().split("T")[0],
      }),
    });

    const partidoActualizado: Partido = await res.json();
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, fecha: partidoActualizado.fecha } : p
      )
    );
  };

  const handleLigaChange = async (id: number, nuevoNombreLiga: string) => {
    const ligaEncontrada = ligasOrdenadas.find(
      (l) => l.nombre === nuevoNombreLiga
    );

    if (!ligaEncontrada) {
      console.error(
        "No se encontró el ID de la liga en ORDEN_LIGAS:",
        nuevoNombreLiga
      );
      return;
    }

    const API_URL = import.meta.env.PUBLIC_API_URL;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/general/partidos/`, {
        method: "PATCH",
        body: JSON.stringify({ id, liga: ligaEncontrada.id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error al actualizar la liga:", errorData);
        return;
      }

      const partidoActualizado: Partido = await res.json();

      setPartidos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, liga: partidoActualizado.liga } : p
        )
      );
    } catch (error) {
      console.error("Error al actualizar la liga:", error);
    }
  };

  const renderBotonesPaginacion = () => {
    const botones = [];
    const maxVisible = 5;
    if (totalPaginas <= maxVisible + 2) {
      for (let i = 1; i <= totalPaginas; i++) {
        botones.push(
          <button
            key={i}
            onClick={() => setPaginaActual(i)}
            className={`px-3 py-1 cursor-pointer rounded ${
              paginaActual === i
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      botones.push(
        <button
          key={1}
          onClick={() => setPaginaActual(1)}
          className={`px-3 py-1 cursor-pointer rounded ${
            paginaActual === 1
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          1
        </button>
      );
      if (paginaActual > 3) {
        botones.push(
          <span key="startDots" className="px-2">
            ...
          </span>
        );
      }
      const start = Math.max(2, paginaActual - 1);
      const end = Math.min(totalPaginas - 1, paginaActual + 1);
      for (let i = start; i <= end; i++) {
        botones.push(
          <button
            key={i}
            onClick={() => setPaginaActual(i)}
            className={`px-3 py-1 cursor-pointer rounded ${
              paginaActual === i
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {i}
          </button>
        );
      }
      if (paginaActual < totalPaginas - 2) {
        botones.push(
          <span key="endDots" className="px-2">
            ...
          </span>
        );
      }
      botones.push(
        <button
          key={totalPaginas}
          onClick={() => setPaginaActual(totalPaginas)}
          className={`px-3 py-1 cursor-pointer rounded ${
            paginaActual === totalPaginas
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {totalPaginas}
        </button>
      );
    }
    return botones;
  };

  const guardarNombrePartido = async (id: number) => {
    const nuevoNombre = nombreEditado[id];
    if (!nuevoNombre) return;

    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetchWithAuth(`${API_URL}/api/general/partidos/`, {
      method: "PATCH",
      body: JSON.stringify({ id, nombre_partido: nuevoNombre }),
    });

    const partidoActualizado: Partido = await res.json();
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, nombre_partido: partidoActualizado.nombre_partido }
          : p
      )
    );

    setEditingId(null);
    setNombreEditado((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
  };

  const opcionesEquipoDestacado = [
    {
      value: "encabezado",
      label: "Equipo destacado:",
      isDisabled: true,
    },
    {
      value: "local",
      label: "Local",
    },
    {
      value: "visitante",
      label: "Visitante",
    },
    {
      value: "",
      label: "Ninguno",
    },
  ];

  function renderNombrePartidoConDestacado(
    nombre: string,
    destacado: "local" | "visitante" | null
  ) {
    const [equipo1, equipo2] = nombre.split(" - ");
    if (!equipo1 || !equipo2) return nombre;

    if (destacado === "local") {
      return (
        <span>
          <strong>{equipo1.trim()}</strong> - {equipo2.trim()}
        </span>
      );
    } else if (destacado === "visitante") {
      return (
        <span>
          {equipo1.trim()} - <strong>{equipo2.trim()}</strong>
        </span>
      );
    }
    return nombre;
  }

  if (!metodoSeleccionado) return null;

  return (
    <div className="p-1">
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-gray-700">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition cursor-pointer"
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
              styles={{
                control: (base) => ({ ...base, cursor: "pointer" }),
                option: (base) => ({ ...base, cursor: "pointer" }),
                menu: (base) => ({ ...base, zIndex: 20 }),
              }}
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
              styles={{
                control: (base) => ({ ...base, cursor: "pointer" }),
                option: (base) => ({ ...base, cursor: "pointer" }),
                menu: (base) => ({ ...base, zIndex: 20 }),
              }}
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
              styles={{
                control: (base) => ({ ...base, cursor: "pointer" }),
                option: (base) => ({ ...base, cursor: "pointer" }),
                menu: (base) => ({ ...base, zIndex: 20 }),
              }}
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
              styles={{
                control: (base) => ({ ...base, cursor: "pointer" }),
                option: (base) => ({ ...base, cursor: "pointer" }),
                menu: (base) => ({ ...base, zIndex: 20 }),
              }}
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
      <div className="overflow-x-auto overflow-y-hidden rounded-lg shadow-md bg-white scrollbar-thin hover:scrollbar-thumb-gray-400 scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <table className="w-full min-w-[900px] text-sm text-gray-800 border-collapse">
          <thead className="bg-blue-600 text-white text-sm">
            <tr>
              <th className="px-2 py-1 text-left w-[100px]">Fecha</th>
              <th className="px-2 py-1 text-left w-[170px]">Liga</th>
              <th className="px-2 py-1 text-left w-[240px]">Partido</th>
              <th className="px-1 py-1 text-center w-[80px]">% Local</th>
              <th className="px-1 py-1 text-center w-[80px]">% Visit.</th>
              <th className="px-1 py-1 text-center w-[80px]">% Total</th>
              <th className="px-1 py-1 text-center w-[60px]">R.L.</th>
              <th className="px-1 py-1 text-center w-[60px]">R.V.</th>
              <th className="px-1 py-1 text-center w-[100px]">Estado</th>
              <th className="px-2 py-1 text-left w-[260px]">Notas</th>
              <th className="px-1 py-1 w-[30px]"></th>
            </tr>
          </thead>
          <tbody>
            {partidosPaginados.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-gray-50 transition border-t border-gray-200 text-sm h-[30px] leading-tight"
              >
                <td className="px-2 py-1 w-[100px]">
                  <DatePicker
                    selected={new Date(p.fecha)}
                    onChange={(date) => date && handleFechaChange(p.id, date)}
                    dateFormat="dd/MM/yyyy"
                    className="w-full bg-transparent text-sm py-0 h-[24px] cursor-pointer"
                    withPortal
                  />
                </td>

                <td className="px-2 py-1 w-[170px] relative z-10 bg-white text-black">
                  <Select
                    options={opcionesLigaEditable}
                    value={
                      p.liga
                        ? opcionesLigaEditable.find(
                            (op) => op.value === p.liga!.nombre
                          )
                        : null
                    }
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        handleLigaChange(p.id, selectedOption.value);
                      }
                    }}
                    isSearchable
                    placeholder="Selecciona una liga"
                    classNamePrefix="react-select"
                    formatOptionLabel={(option) => (
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/w20/${option.data.codigo_pais.toLowerCase()}.png`}
                          alt={option.label}
                          width={20}
                          height={15}
                        />
                        <span>{option.label}</span>
                      </div>
                    )}
                    menuPortalTarget={document.body} // Renderiza el menú en el body para evitar problemas de contención
                    menuPosition="absolute"
                    menuPlacement="auto"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 30,
                        height: 30,
                        border: "none",
                        boxShadow: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        height: 30,
                        padding: "0 8px",
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: 30,
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999, // Asegura que el menú esté por encima de otros elementos
                        maxHeight: "400px",
                        overflowY: "auto",
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999, // Asegura que el portal del menú esté por encima de otros elementos
                      }),
                      option: (base, state) => ({
                        ...base,
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "black",
                        backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                        padding: "6px 10px",
                      }),
                    }}
                  />
                </td>

                <td className="relative px-2 py-1 w-[240px] group text-left">
                  {/* Nombre del partido, editable al hacer clic */}
                  {editingId === p.id ? (
                    <input
                      type="text"
                      value={nombreEditado[p.id] || ""}
                      onChange={(e) =>
                        setNombreEditado((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      onBlur={() => guardarNombrePartido(p.id)}
                      className="w-full bg-transparent text-sm py-0 h-[24px]"
                      autoFocus
                      spellCheck={false}
                    />
                  ) : (
                    <span
                      className="cursor-pointer block truncate pr-5"
                      onClick={() => {
                        setEditingId(p.id);
                        setNombreEditado((prev) => ({
                          ...prev,
                          [p.id]: p.nombre_partido,
                        }));
                      }}
                    >
                      {renderNombrePartidoConDestacado(
                        p.nombre_partido,
                        p.equipo_destacado ?? null
                      )}
                    </span>
                  )}

                  {/* Dropdown invisible hasta hover */}
                  <div className="absolute top-1/2 right-1 -translate-y-1/2 w-[32px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Select
                      options={opcionesEquipoDestacado}
                      value={opcionesEquipoDestacado.find(
                        (opt) => opt.value === (p.equipo_destacado ?? "")
                      )}
                      onChange={async (selectedOption) => {
                        const nuevoValor = selectedOption?.value || null;
                        const API_URL = import.meta.env.PUBLIC_API_URL;

                        const res = await fetchWithAuth(
                          `${API_URL}/api/general/partidos/`,
                          {
                            method: "PATCH",
                            body: JSON.stringify({
                              id: p.id,
                              equipo_destacado: nuevoValor,
                            }),
                          }
                        );

                        const partidoActualizado: Partido = await res.json();
                        setPartidos((prev) =>
                          prev.map((item) =>
                            item.id === p.id
                              ? {
                                  ...item,
                                  equipo_destacado:
                                    partidoActualizado.equipo_destacado,
                                }
                              : item
                          )
                        );
                      }}
                      placeholder=""
                      getOptionLabel={(e) => e.label}
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      menuPosition="absolute"
                      menuPlacement="auto"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: 24,
                          height: 24,
                          width: 24,
                          padding: 0,
                          border: "none",
                          boxShadow: "none",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: 0,
                          height: 24,
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: 24,
                        }),
                        singleValue: () => ({ display: "none" }), // oculta texto
                        placeholder: () => ({}),
                        dropdownIndicator: (base) => ({
                          ...base,
                          padding: 0,
                        }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: "14px",
                          padding: "6px 10px",
                          backgroundColor: state.isFocused
                            ? "#f0f0f0"
                            : "white",
                          color: "black",
                          cursor: state.isDisabled ? "default" : "pointer",
                          fontWeight:
                            state.data.value === "encabezado"
                              ? "bold"
                              : "normal", // 👈 esto
                        }),

                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                          minWidth: "148px",
                        }),
                      }}
                    />
                  </div>
                </td>

                <td className="px-1 py-1 text-center w-[80px]">
                  {mostrarPorcentaje(p.porcentaje_local)}
                </td>
                <td className="px-1 py-1 text-center w-[80px]">
                  {mostrarPorcentaje(p.porcentaje_visitante)}
                </td>
                <td className="px-1 py-1 text-center w-[80px]">
                  {mostrarPorcentaje(p.porcentaje_general)}
                </td>
                <td className="px-1 py-1 text-center w-[60px]">
                  {p.racha_local} ({p.racha_hist_local})
                </td>
                <td className="px-1 py-1 text-center w-[60px]">
                  {p.racha_visitante} ({p.racha_hist_visitante})
                </td>
                <td
                  className={`relative px-1 py-1 text-center w-[105px] rounded-md transition duration-300 group
    ${
      p.cumplido === "VERDE"
        ? "bg-green-100 text-green-800"
        : p.cumplido === "ROJO"
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-600"
    }`}
                >
                  {/* Texto visible por defecto */}
                  <span className="block pointer-events-none transition-opacity duration-200 group-hover:opacity-0">
                    {p.estado}
                  </span>

                  {/* Selects visibles sólo al hacer hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex flex-col justify-center gap-[2px] transition-opacity px-[4px]">
                    <select
                      value={p.estado}
                      onChange={(e) => {
                        const API_URL = import.meta.env.PUBLIC_API_URL;
                        fetchWithAuth(`${API_URL}/api/general/partidos/`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            id: p.id,
                            estado: e.target.value,
                          }),
                        })
                          .then((res) => res.json())
                          .then((partidoActualizado: Partido) => {
                            setPartidos((prev) =>
                              prev.map((item) =>
                                item.id === p.id
                                  ? {
                                      ...item,
                                      estado: partidoActualizado.estado,
                                    }
                                  : item
                              )
                            );
                          });
                      }}
                      className="text-xs border border-gray-300 rounded w-full cursor-pointer" // ✅ cursor-pointer
                    >
                      <option value="NO">NO</option>
                      <option value="LIVE">LIVE</option>
                      <option value="APOSTADO">APOSTADO</option>
                    </select>

                    <select
                      value={p.cumplido || ""}
                      onChange={(e) =>
                        handleResultadoChange(p.id, e.target.value)
                      }
                      className="text-xs border border-gray-300 rounded w-full cursor-pointer" // ✅ cursor-pointer
                    >
                      <option value="">Sin resultado</option>
                      <option value="VERDE">Acierto</option>
                      <option value="ROJO">Fallo</option>
                    </select>
                  </div>
                </td>

                <td className="px-2 py-1 text-left w-[260px]" title={p.notas}>
                  <textarea
                    value={
                      notasTemp[p.id] !== undefined ? notasTemp[p.id] : p.notas
                    }
                    onChange={(e) => handleNotasChange(p.id, e.target.value)}
                    onBlur={() => guardarNotas(p.id)}
                    spellCheck={false}
                    className="w-full h-[24px] resize-none border rounded-md p-1 text-sm whitespace-nowrap overflow-x-auto overflow-y-hidden custom-scroll"
                  />
                </td>
                <td className="px-1 py-1 w-[30px] text-center">
                  <button
                    onClick={() => setPartidoAEliminar(p)}
                    className="text-gray-400 hover:text-rose-600 p-0 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-center mt-4 gap-2 mb-2 flex-wrap">
        {renderBotonesPaginacion()}
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
