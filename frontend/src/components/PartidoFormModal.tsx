import { useEffect, useState } from "react";
import Modal from "react-modal";
Modal.setAppElement("#root");
import Select from "react-select";
import { useMetodo } from "../context/MetodoContext";
import { fetchWithAuth } from "../utils/authFetch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Liga = {
  id: number;
  nombre: string;
  codigo_pais: string;
};

type Option = {
  value: number;
  label: string;
  data: Liga;
};

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onPartidoGuardado: () => void;
};

export default function PartidoFormModal({
  isOpen,
  onRequestClose,
  onPartidoGuardado,
}: Props) {
  const { metodoSeleccionado } = useMetodo();
  const [ligas, setLigas] = useState<Option[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<Option | null>(null);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [nombre, setNombre] = useState("");
  const [porLocal, setPorLocal] = useState<number | "">("");
  const [porVisitante, setPorVisitante] = useState<number | "">("");
  const [porGeneral, setPorGeneral] = useState<number | "">("");
  const [rachaLocal, setRachaLocal] = useState("");
  const [rachaVisitante, setRachaVisitante] = useState("");
  const [rachaHistLocal, setRachaHistLocal] = useState("");
  const [rachaHistVisitante, setRachaHistVisitante] = useState("");
  const [estado, setEstado] = useState("");
  const [notas, setNotas] = useState("");
  const [equipoDestacado, setEquipoDestacado] = useState<
    "local" | "visitante" | ""
  >("");

  useEffect(() => {
    const API_URL = import.meta.env.PUBLIC_API_URL;

    fetchWithAuth(`${API_URL}/api/general/ligas/`)
      .then((res) => res.json())
      .then((data: Liga[]) => {
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
          "Ykkonen",
          "Kakkonen",
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

        const options: Option[] = data
          .map((liga) => ({
            value: liga.id,
            label: liga.nombre,
            data: liga,
          }))
          .sort((a, b) => {
            const indexA = ORDEN_VISUAL.indexOf(a.label);
            const indexB = ORDEN_VISUAL.indexOf(b.label);
            if (indexA === -1) return 1; // al final si no está en la lista
            if (indexB === -1) return -1;
            return indexA - indexB;
          });

        setLigas(options);
      });
  }, []);

  useEffect(() => {
    if (porLocal !== "" && porVisitante !== "") {
      const promedio = (+porLocal + +porVisitante) / 2;
      setPorGeneral(parseFloat(promedio.toFixed(2)));
    } else {
      setPorGeneral("");
    }
  }, [porLocal, porVisitante]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!metodoSeleccionado || !ligaSeleccionada || estado === "") return;

    const API_URL = import.meta.env.PUBLIC_API_URL;

    fetchWithAuth(`${API_URL}/api/general/partidos/`, {
      method: "POST",
      body: JSON.stringify({
        metodo: metodoSeleccionado.id,
        fecha:
          fecha.getFullYear() +
          "-" +
          String(fecha.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(fecha.getDate()).padStart(2, "0"),

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
        equipo_destacado: equipoDestacado || null,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        onPartidoGuardado();
        onRequestClose();

        // Limpiar formulario
        setFecha(new Date());
        setNombre("");
        setEquipoDestacado("");
        setLigaSeleccionada(null);
        setPorLocal("");
        setPorVisitante("");
        setPorGeneral("");
        setRachaLocal("");
        setRachaVisitante("");
        setRachaHistLocal("");
        setRachaHistVisitante("");
        setEstado("");
        setNotas("");
      })
      .catch((err) => console.error("Error al guardar partido:", err));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Añadir Partido"
      className="bg-white p-4 rounded-xl shadow-lg max-w-2xl w-full mx-4 sm:mx-auto mt-20 max-h-[90vh] overflow-y-auto outline-none text-gray-700"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-800 pt-2 ps-2">
        Añadir partido
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DatePicker
          selected={fecha}
          onChange={(date) => date && setFecha(date)}
          dateFormat="dd/MM/yyyy"
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300"
        />
        <input
          type="text"
          placeholder="Partido"
          value={nombre}
          spellCheck="false"
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={equipoDestacado}
          onChange={(e) =>
            setEquipoDestacado(
              e.target.value === ""
                ? ""
                : (e.target.value as "local" | "visitante")
            )
          }
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">¿Qué equipo debe marcar?</option>
          <option value="local">Local</option>
          <option value="visitante">Visitante</option>
        </select>
        <Select
          options={ligas}
          value={ligaSeleccionada}
          onChange={(op) => setLigaSeleccionada(op)}
          placeholder="Selecciona una liga"
          isClearable
          formatOptionLabel={(option: Option) => (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={`https://flagcdn.com/w20/${option.data.codigo_pais.toLowerCase()}.png`}
                alt={option.label}
              />
              {option.label}
            </div>
          )}
          filterOption={(option, inputValue) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
        <input
          type="number"
          placeholder="% Local"
          value={porLocal}
          onChange={(e) =>
            setPorLocal(e.target.value === "" ? "" : +e.target.value)
          }
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="% Visitante"
          value={porVisitante}
          onChange={(e) =>
            setPorVisitante(e.target.value === "" ? "" : +e.target.value)
          }
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="% General"
          value={porGeneral}
          onChange={(e) =>
            setPorGeneral(e.target.value === "" ? "" : +e.target.value)
          }
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Racha Local"
          value={rachaLocal}
          onChange={(e) => setRachaLocal(e.target.value)}
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Racha Histórica Local"
          value={rachaHistLocal}
          onChange={(e) => setRachaHistLocal(e.target.value)}
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Racha Visitante"
          value={rachaVisitante}
          onChange={(e) => setRachaVisitante(e.target.value)}
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Racha Histórica Visitante"
          value={rachaHistVisitante}
          onChange={(e) => setRachaHistVisitante(e.target.value)}
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Estado
          </option>
          <option value="LIVE">LIVE</option>
          <option value="NO">NO</option>
          <option value="APOSTADO">APOSTADO</option>
        </select>
        <textarea
          placeholder="Notas"
          value={notas}
          spellCheck="false"
          onChange={(e) => setNotas(e.target.value)}
          className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end pt-2 pb-2">
          <button
            type="button"
            className="border border-rose-600 text-rose-600 px-5 py-2 rounded-xl hover:bg-rose-50 transition duration-300 text-sm font-semibold mr-2 cursor-pointer"
            onClick={onRequestClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="border border-blue-600 text-blue-600 px-5 py-2 rounded-xl hover:bg-blue-50 transition duration-300 text-sm font-semibold cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
