import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";

type Metodo = {
  id: number;
  nombre: string;
};

export default function MetodosList() {
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const { metodoSeleccionado, setMetodoSeleccionado } = useMetodo();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token recuperado:", token);

    if (!token) {
      console.error("No se encontró el token de acceso.");
      return;
    }

    fetch("http://localhost:8000/api/general/metodos/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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
      <h3 className="text-xl font-semibold mb-4">Mis Métodos</h3>
      <ul className="space-y-2">
        {metodos.map((metodo) => (
          <li key={metodo.id}>
            <button
              className={`w-full text-left px-4 py-2 border rounded ${
                metodoSeleccionado?.id === metodo.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => handleSelectMetodo(metodo)}
            >
              {metodo.nombre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
