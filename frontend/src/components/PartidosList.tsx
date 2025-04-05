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

console.log("PartidosList renderizado");

export default function PartidosList() {
  const { metodoSeleccionado } = useMetodo();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [fecha, setFecha] = useState("");
  const [nombrePartido, setNombrePartido] = useState("");
  const [liga, setLiga] = useState("");
  const [porcentajeLocal, setPorcentajeLocal] = useState(0);
  const [porcentajeVisitante, setPorcentajeVisitante] = useState(0);
  const [porcentajeGeneral, setPorcentajeGeneral] = useState(0);
  const [rachaLocal, setRachaLocal] = useState("");
  const [rachaVisitante, setRachaVisitante] = useState("");
  const [rachaHistLocal, setRachaHistLocal] = useState("");
  const [rachaHistVisitante, setRachaHistVisitante] = useState("");
  const [estado, setEstado] = useState("NO");
  const [notas, setNotas] = useState("");

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
            (a, b) =>
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
        setPartidos(filtrados);
      })
      .catch((err) => console.error("Error cargando partidos:", err));
  }, [metodoSeleccionado]);

  const handleSubmitPartido = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token || !metodoSeleccionado) return;

    fetch("http://localhost:8000/api/general/partidos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fecha,
        nombre_partido: nombrePartido,
        liga,
        porcentaje_local: porcentajeLocal,
        porcentaje_visitante: porcentajeVisitante,
        porcentaje_general: porcentajeGeneral,
        metodo: metodoSeleccionado.id,
        racha_local: rachaLocal,
        racha_visitante: rachaVisitante,
        racha_hist_local: rachaHistLocal,
        racha_hist_visitante: rachaHistVisitante,
        estado,
        notas,
      }),
    })
      .then((res) => res.json())
      .then((nuevoPartido: Partido) => {
        setPartidos((prev) => [...prev, nuevoPartido]);
        setFecha("");
        setNombrePartido("");
        setLiga("");
        setPorcentajeLocal(0);
        setPorcentajeVisitante(0);
        setPorcentajeGeneral(0);
        setRachaLocal("");
        setRachaVisitante("");
        setRachaHistLocal("");
        setRachaHistVisitante("");
        setEstado("NO");
        setNotas("");
      })
      .catch((err) => console.error("Error guardando partido:", err));
  };

  if (!metodoSeleccionado) return null;

  return (
    <div className="p-4">
      {/* Botón para añadir partido */}
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
        >
          Añadir Partido
        </button>
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
            {partidos.map((p) => (
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
