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

    console.log("Método seleccionado:", metodoSeleccionado);

    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/general/partidos/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data: Partido[]) => {
        console.log("Partidos obtenidos:", data);
        const filtrados = data
          .filter((p) => p.metodo === metodoSeleccionado.id)
          .sort(
            (a, b) =>
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
        console.log("Partidos filtrados:", filtrados);
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
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg"
        >
          Añadir Partido
        </button>
      </div>

      {/* Tabla de partidos */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Fecha</th>
              <th className="border px-2 py-1">Partido</th>
              <th className="border px-2 py-1">Liga</th>
              <th className="border px-2 py-1 w-24">%Local</th>
              <th className="border px-2 py-1 w-24">%Visitante</th>
              <th className="border px-2 py-1 w-24">%General</th>
              <th className="border px-2 py-1 w-20">RL</th>
              <th className="border px-2 py-1 w-20">RV</th>
              <th className="border px-2 py-1 w-20">RHL</th>
              <th className="border px-2 py-1 w-20">RHV</th>
              <th className="border px-2 py-1">Estado</th>
              <th className="border px-2 py-1">Notas</th>
            </tr>
          </thead>
          <tbody>
            {partidos.map((p) => (
              <tr key={p.id}>
                <td className="border px-2 py-1">{formatFecha(p.fecha)}</td>
                <td className="border px-2 py-1">{p.nombre_partido}</td>
                <td className="border px-2 py-1">
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
                <td className="border px-2 py-1 w-24">{p.porcentaje_local}%</td>
                <td className="border px-2 py-1 w-24">
                  {p.porcentaje_visitante}%
                </td>
                <td className="border px-2 py-1 w-24">
                  {p.porcentaje_general}%
                </td>
                <td className="border px-2 py-1 w-20">{p.racha_local}</td>
                <td className="border px-2 py-1 w-20">{p.racha_visitante}</td>
                <td className="border px-2 py-1 w-20">{p.racha_hist_local}</td>
                <td className="border px-2 py-1 w-20">
                  {p.racha_hist_visitante}
                </td>
                <td className="border px-2 py-1">{p.estado}</td>
                <td className="border px-2 py-1">{p.notas}</td>
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
              console.log("Partidos cargados tras guardar:", data);
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
