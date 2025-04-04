import { useEffect, useState } from "react";

type Metodo = {
  id: number;
  nombre: string;
};

export default function MetodosList() {
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const [selectedMetodo, setSelectedMetodo] = useState<Metodo | null>(null);

  useEffect(() => {
    // Obtener el token de localStorage
    const token = localStorage.getItem("access_token");
    console.log("Token recuperado:", token); // Verifica si el token está en localStorage

    if (!token) {
      console.error("No se encontró el token de acceso.");
      return; // Si no hay token, no realizamos la petición
    }

    // Realizar la petición para obtener los métodos
    fetch("http://localhost:8000/api/general/metodos/", {
      headers: {
        Authorization: `Bearer ${token}`, // Enviamos el token en los headers
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Métodos recibidos:", data); // Ver los datos que devuelve la API
        setMetodos(data);
      })
      .catch((err) => console.error("Error cargando métodos:", err));
  }, []);

  const handleSelectMetodo = (metodo: Metodo) => {
    setSelectedMetodo(metodo);
    // Aquí puedes agregar lógica para filtrar los partidos según el método
  };

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-4">Mis Métodos</h3>
      <ul className="space-y-2">
        {metodos.map((metodo) => (
          <li key={metodo.id}>
            <button
              className={`w-full text-left px-4 py-2 border rounded ${
                selectedMetodo?.id === metodo.id
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

      {selectedMetodo && (
        <div className="mt-4">
          <h4 className="font-semibold">Método Seleccionado:</h4>
          <p>{selectedMetodo.nombre}</p>
        </div>
      )}
    </div>
  );
}
