import { useEffect, useState } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { useMetodo } from "../context/MetodoContext";

type Liga = {
  id: number;
  nombre: string;
  codigo_pais: string;
};

type Option = {
  value: number;
  label: JSX.Element;
};

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onPartidoGuardado: () => void;
};

export default function PartidoFormModal({ isOpen, onRequestClose, onPartidoGuardado }: Props) {
  const { metodoSeleccionado } = useMetodo();
  const [ligas, setLigas] = useState<Option[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<Option | null>(null);

  const [fecha, setFecha] = useState("");
  const [nombre, setNombre] = useState("");
  const [porLocal, setPorLocal] = useState(0);
  const [porVisitante, setPorVisitante] = useState(0);
  const [porGeneral, setPorGeneral] = useState(0);
  const [rachaLocal, setRachaLocal] = useState("");
  const [rachaVisitante, setRachaVisitante] = useState("");
  const [rachaHistLocal, setRachaHistLocal] = useState("");
  const [rachaHistVisitante, setRachaHistVisitante] = useState("");
  const [estado, setEstado] = useState("NO");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/general/ligas/")
      .then((res) => res.json())
      .then((data: Liga[]) => {
        const options = data.map((liga) => ({
          value: liga.id,
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={`https://flagcdn.com/w20/${liga.codigo_pais.toLowerCase()}.png`}
                alt={liga.nombre}
              />
              {liga.nombre}
            </div>
          ),
        }));
        setLigas(options);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!metodoSeleccionado || !ligaSeleccionada) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/general/partidos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        metodo: metodoSeleccionado.id,
        fecha,
        nombre_partido: nombre,
        liga: ligaSeleccionada.value,
        porcentaje_local: porLocal,
        porcentaje_visitante: porVisitante,
        porcentaje_general: porGeneral,
        racha_local: rachaLocal,
        racha_visitante: rachaVisitante,
        racha_hist_local: rachaHistLocal,
        racha_hist_visitante: rachaHistVisitante,
        estado,
        notas,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        onPartidoGuardado(); // recarga la lista
        onRequestClose(); // cierra el modal
      })
      .catch((err) => console.error("Error al guardar partido:", err));
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Añadir Partido"
      className="bg-white p-6 rounded shadow-md max-w-xl mx-auto mt-20 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
    >
      <h2 className="text-xl font-bold mb-4">Añadir Partido</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input w-full" />
        <input type="text" placeholder="Nombre del partido" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input w-full" />
        <Select
          options={ligas}
          value={ligaSeleccionada}
          onChange={(op) => setLigaSeleccionada(op)}
          placeholder="Selecciona una liga"
        />
        <input type="number" placeholder="% Local" value={porLocal} onChange={(e) => setPorLocal(+e.target.value)} className="input w-full" />
        <input type="number" placeholder="% Visitante" value={porVisitante} onChange={(e) => setPorVisitante(+e.target.value)} className="input w-full" />
        <input type="number" placeholder="% General" value={porGeneral} onChange={(e) => setPorGeneral(+e.target.value)} className="input w-full" />
        <input type="text" placeholder="Racha Local" value={rachaLocal} onChange={(e) => setRachaLocal(e.target.value)} className="input w-full" />
        <input type="text" placeholder="Racha Visitante" value={rachaVisitante} onChange={(e) => setRachaVisitante(e.target.value)} className="input w-full" />
        <input type="text" placeholder="Racha Hist. Local" value={rachaHistLocal} onChange={(e) => setRachaHistLocal(e.target.value)} className="input w-full" />
        <input type="text" placeholder="Racha Hist. Visitante" value={rachaHistVisitante} onChange={(e) => setRachaHistVisitante(e.target.value)} className="input w-full" />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input w-full">
          <option value="NO">No</option>
          <option value="LIVE">En Vivo</option>
          <option value="APOSTADO">Apostado</option>
        </select>
        <textarea placeholder="Notas" value={notas} onChange={(e) => setNotas(e.target.value)} className="input w-full" />
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Guardar</button>
        </div>
      </form>
    </Modal>
  );
}
