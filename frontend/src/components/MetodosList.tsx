import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import { fetchWithAuth } from "../utils/authFetch";

type Metodo = {
  id: number;
  nombre: string;
};

export default function MetodosList() {
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const { metodoSeleccionado, setMetodoSeleccionado } = useMetodo();

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
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Mis Métodos</h3>
      <ul className="space-y-2">
        {metodos.map((metodo) => {
          const isSelected = metodoSeleccionado?.id === metodo.id;
          return (
            <li key={metodo.id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg shadow-sm border transition duration-200 ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
  );
}
