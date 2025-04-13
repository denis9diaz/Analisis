import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import { fetchWithAuth } from "../utils/authFetch";
import MetodoFormModal from "./MetodoFormModal";
import Modal from "react-modal";
import { Trash2 } from "lucide-react";

type Metodo = {
  id: number;
  nombre: string;
};

export default function MetodosList() {
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const { metodoSeleccionado, setMetodoSeleccionado, modoNotas, setModoNotas } =
    useMetodo();

  const [showModalMetodo, setShowModalMetodo] = useState(false);
  const [metodoAEliminar, setMetodoAEliminar] = useState<Metodo | null>(null);

  useEffect(() => {
    cargarMetodos();
  }, []);

  const cargarMetodos = () => {
    const API_URL = import.meta.env.PUBLIC_API_URL;

    fetchWithAuth(`${API_URL}/api/general/metodos/`)
      .then((res) => res.json())
      .then((data) => setMetodos(data));
  };

  const handleSelectMetodo = (metodo: Metodo) => {
    setModoNotas(false); // salir del modo notas si se selecciona un método
    setMetodoSeleccionado(metodo);
  };

  const eliminarMetodo = () => {
    if (!metodoAEliminar) return;
    const API_URL = import.meta.env.PUBLIC_API_URL;

    fetchWithAuth(`${API_URL}/api/general/metodos/${metodoAEliminar.id}/`, {
      method: "DELETE",
    }).then(() => {
      setMetodoAEliminar(null);
      cargarMetodos();
      if (metodoSeleccionado?.id === metodoAEliminar.id) {
        setMetodoSeleccionado(null);
      }
    });
  };

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Mis métodos</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowModalMetodo(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
        >
          Añadir método
        </button>

        <button
          onClick={() => {
            setModoNotas(!modoNotas); // ✅ usamos el valor actual directamente
            setMetodoSeleccionado(null);
          }}
          className={`${
            modoNotas
              ? "bg-green-700 hover:bg-green-800"
              : "bg-green-600 hover:bg-green-700"
          } text-white font-semibold py-2 px-4 rounded shadow`}
        >
          {modoNotas ? "Métodos" : "Notas"}
        </button>
      </div>

      {!modoNotas && (
        <div className="max-h-150 overflow-y-auto space-y-2">
          <ul className="space-y-2">
            {metodos.map((metodo) => {
              const isSelected = metodoSeleccionado?.id === metodo.id;
              return (
                <li
                  key={metodo.id}
                  className="flex items-center justify-between"
                >
                  <button
                    className={`flex-1 text-left px-4 py-2 rounded-lg shadow-sm border transition duration-200 ${
                      isSelected
                        ? "border-blue-600 text-blue-700 font-semibold bg-white shadow"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent"
                    }`}
                    onClick={() => handleSelectMetodo(metodo)}
                  >
                    {metodo.nombre}
                  </button>
                  <button
                    className="ml-2 text-gray-500 hover:text-rose-600 transition"
                    onClick={() => setMetodoAEliminar(metodo)}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <MetodoFormModal
        isOpen={showModalMetodo}
        onRequestClose={() => setShowModalMetodo(false)}
        onMetodoGuardado={cargarMetodos}
      />

      <Modal
        isOpen={!!metodoAEliminar}
        onRequestClose={() => setMetodoAEliminar(null)}
        className="bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto mt-40"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          ¿Estás seguro que deseas eliminar este método?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Si lo eliminas, perderás todos los partidos asociados y no podrás
          recuperarlos.
        </p>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setMetodoAEliminar(null)}
            className="border border-rose-600 text-rose-600 px-5 py-2 rounded-xl hover:bg-rose-50 transition duration-300 text-sm font-semibold mr-2 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={eliminarMetodo}
            className="border border-blue-600 text-blue-600 px-5 py-2 rounded-xl hover:bg-blue-50 transition duration-300 text-sm font-semibold cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
