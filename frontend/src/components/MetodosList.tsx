import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import { fetchWithAuth } from "../utils/authFetch";
import MetodoFormModal from "./MetodoFormModal";

type Metodo = {
  id: number;
  nombre: string;
};

export default function MetodosList() {
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const { metodoSeleccionado, setMetodoSeleccionado } = useMetodo();
  const [showModalMetodo, setShowModalMetodo] = useState(false);

  useEffect(() => {
    fetchWithAuth("http://localhost:8000/api/general/metodos/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Métodos recibidos:", data);
        setMetodos(data);
      })
      .catch((err) => console.error("Error cargando métodos:", err));
  }, []);

  const handleSelectMetodo = (metodo: Metodo) => {
    setMetodoSeleccionado(metodo);
  };

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Mis métodos</h3>
      <button
        onClick={() => setShowModalMetodo(true)}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
      >
        Añadir método
      </button>
      {/* Contenedor con scroll */}
      <div className="max-h-150 overflow-y-auto space-y-2">
        <ul className="space-y-2">
          {metodos.map((metodo) => {
            const isSelected = metodoSeleccionado?.id === metodo.id;
            return (
              <li key={metodo.id}>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg shadow-sm border transition duration-200 ${
                    isSelected
                      ? "border-blue-600 text-blue-700 font-semibold bg-white shadow"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent"
                  }`}
                  onClick={() => handleSelectMetodo(metodo)}
                >
                  {metodo.nombre}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <MetodoFormModal
        isOpen={showModalMetodo}
        onRequestClose={() => setShowModalMetodo(false)}
        onMetodoGuardado={() => {
          fetchWithAuth("http://localhost:8000/api/general/metodos/")
            .then((res) => res.json())
            .then((data) => setMetodos(data));
        }}
      />
    </div>
  );
}
