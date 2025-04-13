import { useEffect, useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchWithAuth } from "../utils/authFetch";

type Nota = {
  id: number;
  fecha: string;
  equipo: string;
  tipo: string;
  analizar: string;
  stake: string;
  estado: string;
  cumplido: string | null;
  notas: string;
};

export default function NotasList() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fecha: new Date(),
    equipo: "",
    tipo: "LOCAL",
    analizar: "",
    stake: "",
    estado: "NO",
    notas: "",
  });

  const [tempEdits, setTempEdits] = useState<Record<number, Partial<Nota>>>({});

  const fetchNotas = () => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    fetchWithAuth(`${API_URL}/api/general/notas/`)
      .then((res) => res.json())
      .then(setNotas);
  };

  useEffect(fetchNotas, []);

  const handleGuardar = async () => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetchWithAuth(`${API_URL}/api/general/notas/`, {
      method: "POST",
      body: JSON.stringify({
        ...form,
        fecha: form.fecha.toISOString().split("T")[0],
      }),
    });
    if (res.ok) {
      const nueva = await res.json();
      setNotas((prev) => [nueva, ...prev]);
      setForm({
        fecha: new Date(),
        equipo: "",
        tipo: "LOCAL",
        analizar: "",
        stake: "",
        estado: "NO",
        notas: "",
      });
      setShowModal(false);
    }
  };

  const handleEdit = (id: number, campo: keyof Nota, valor: string | null) => {
    setTempEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  };

  const guardarCampo = async (id: number) => {
    const cambios = tempEdits[id];
    if (!cambios) return;

    const API_URL = import.meta.env.PUBLIC_API_URL;
    const res = await fetchWithAuth(`${API_URL}/api/general/notas/`, {
      method: "PATCH",
      body: JSON.stringify({ id, ...cambios }),
    });
    const actualizada = await res.json();
    setNotas((prev) => prev.map((n) => (n.id === id ? actualizada : n)));
    setTempEdits((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
  };

  const itemsPorPagina = 11;
  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(notas.length / itemsPorPagina);
  const paginadas = notas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  return (
    <div className="p-1">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
        >
          Añadir nota
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm text-gray-700 border-collapse table-fixed">
          <thead className="bg-blue-600 text-white text-sm leading-tight">
            <tr>
              <th className="px-2 py-1 text-left w-[90px]">Fecha</th>
              <th className="px-2 py-1 text-left w-[120px]">Equipo</th>
              <th className="px-2 py-1 text-left w-[110px]">Home / Away</th>
              <th className="px-2 py-1 text-left w-[140px]">Analizar</th>
              <th className="px-2 py-1 text-left w-[90px]">Stake</th>
              <th className="px-2 py-1 text-left w-[110px]">Estado</th>
              <th className="px-2 py-1 text-left w-[280px]">Notas</th>
            </tr>
          </thead>

          <tbody>
            {paginadas.map((n) => (
              <tr key={n.id} className="border-t border-gray-200">
                <td className="px-2 py-1 w-[90px]">
                  <DatePicker
                    selected={new Date(n.fecha)}
                    onChange={(date) =>
                      date &&
                      handleEdit(
                        n.id,
                        "fecha",
                        date.toISOString().split("T")[0]
                      )
                    }
                    onBlur={() => guardarCampo(n.id)}
                    className="bg-transparent w-full text-sm leading-tight"
                    dateFormat="dd/MM/yyyy"
                  />
                </td>
                <td className="px-2 py-1 w-[120px]">
                  <input
                    type="text"
                    defaultValue={n.equipo}
                    onChange={(e) => handleEdit(n.id, "equipo", e.target.value)}
                    onBlur={() => guardarCampo(n.id)}
                    className="bg-transparent w-full text-sm leading-tight"
                  />
                </td>
                <td className="px-2 py-1 w-[110px]">
                  <select
                    value={tempEdits[n.id]?.tipo || n.tipo}
                    onChange={(e) => handleEdit(n.id, "tipo", e.target.value)}
                    onBlur={() => guardarCampo(n.id)}
                    className="bg-transparent w-full text-sm leading-tight"
                  >
                    <option value="LOCAL">Local</option>
                    <option value="VISITANTE">Visitante</option>
                  </select>
                </td>
                <td className="px-2 py-1 w-[140px]">
                  <input
                    type="text"
                    defaultValue={n.analizar}
                    onChange={(e) =>
                      handleEdit(n.id, "analizar", e.target.value)
                    }
                    onBlur={() => guardarCampo(n.id)}
                    className="bg-transparent w-full text-sm leading-tight"
                  />
                </td>
                <td className="px-2 py-1 w-[90px]">
                  <input
                    type="text"
                    defaultValue={n.stake}
                    onChange={(e) => handleEdit(n.id, "stake", e.target.value)}
                    onBlur={() => guardarCampo(n.id)}
                    className="bg-transparent w-full text-sm leading-tight"
                  />
                </td>
                <td
                  className={`px-2 py-1 w-[110px] text-center rounded-md transition duration-300
    ${
      n.cumplido === "VERDE"
        ? "bg-green-100 text-green-800"
        : n.cumplido === "ROJO"
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-600"
    }`}
                >
                  <div className="relative group">
                    <span className="block cursor-pointer group-hover:opacity-0 transition-opacity">
                      {n.estado}
                    </span>
                    <select
                      value={n.cumplido || ""}
                      onChange={async (e) => {
                        const API_URL = import.meta.env.PUBLIC_API_URL;
                        const res = await fetchWithAuth(
                          `${API_URL}/api/general/notas/`,
                          {
                            method: "PATCH",
                            body: JSON.stringify({
                              id: n.id,
                              cumplido: e.target.value || null,
                            }),
                          }
                        );
                        if (res.ok) {
                          const actualizada = await res.json();
                          setNotas((prev) =>
                            prev.map((nota) =>
                              nota.id === n.id ? actualizada : nota
                            )
                          );
                        }
                      }}
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <option value="">Sin resultado</option>
                      <option value="VERDE">Acierto</option>
                      <option value="ROJO">Fallo</option>
                    </select>
                  </div>
                </td>

                <td className="px-2 py-1 w-[280px]">
                  <textarea
                    value={
                      tempEdits[n.id]?.notas !== undefined
                        ? tempEdits[n.id]?.notas || ""
                        : n.notas || ""
                    }
                    onChange={(e) => handleEdit(n.id, "notas", e.target.value)}
                    onBlur={() => guardarCampo(n.id)}
                    spellCheck={false}
                    className="w-full h-[25px] resize-none border rounded-md p-1 text-sm whitespace-nowrap overflow-x-auto overflow-y-hidden bg-transparent custom-scroll"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4 mb-2 gap-2">
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

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Añadir Nota"
        className="bg-white p-4 rounded-xl shadow-lg max-w-2xl w-full mx-auto mt-20 max-h-[90vh] overflow-y-auto outline-none text-gray-700"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-800 pt-2 ps-2">
          Añadir nota
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGuardar();
          }}
          className="space-y-4"
        >
          <DatePicker
            selected={form.fecha}
            onChange={(date) => date && setForm((f) => ({ ...f, fecha: date }))}
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300"
          />
          <input
            type="text"
            placeholder="Equipo"
            value={form.equipo}
            onChange={(e) => setForm((f) => ({ ...f, equipo: e.target.value }))}
            className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300"
          />
          <select
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
            className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 text-gray-700"
          >
            <option value="LOCAL">Local</option>
            <option value="VISITANTE">Visitante</option>
          </select>
          <input
            type="text"
            placeholder="Analizar"
            value={form.analizar}
            onChange={(e) =>
              setForm((f) => ({ ...f, analizar: e.target.value }))
            }
            className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300"
          />
          <input
            type="text"
            placeholder="Stake"
            value={form.stake}
            onChange={(e) => setForm((f) => ({ ...f, stake: e.target.value }))}
            className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300"
          />
          <select
            value={form.estado}
            onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
            className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300 text-gray-700"
          >
            <option value="NO">NO</option>
            <option value="LIVE">LIVE</option>
            <option value="APOSTADO">APOSTADO</option>
          </select>
          <textarea
            placeholder="Notas"
            value={form.notas}
            onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            className="w-full px-3 py-1 rounded-md bg-gray-100 border border-gray-300"
          />
          <div className="flex justify-end pt-2 pb-2">
            <button
              type="button"
              className="border border-rose-600 text-rose-600 px-5 py-2 rounded-xl hover:bg-rose-50 transition duration-300 text-sm font-semibold mr-2 cursor-pointer"
              onClick={() => setShowModal(false)}
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
    </div>
  );
}
