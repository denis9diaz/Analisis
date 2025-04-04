import { useEffect, useState } from "react";

type Partido = {
  id: number;
  nombre_partido: string;
  liga: { nombre: string };
  fecha: string;
  porcentaje_local: number;
  porcentaje_visitante: number;
  porcentaje_general: number;
  estado: string;
  cumplido: string | null;
  notas: string;
};

export default function PartidosList() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token recuperado:", token);

    if (!token) {
      console.error("No se encontró el token de acceso.");
      return;
    }

    fetch("http://localhost:8000/api/general/partidos/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Partidos recibidos:", data);
        setPartidos(data);
      })
      .catch((err) => console.error("Error cargando partidos:", err));
  }, []);

  const handleSelectPartido = (partido: Partido) => {
    setSelectedPartido(partido);
  };

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-4">Mis Partidos</h3>
      <ul className="space-y-2">
        {partidos.map((partido) => (
          <li key={partido.id}>
            <button
              className={`w-full text-left px-4 py-2 border rounded ${
                selectedPartido?.id === partido.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => handleSelectPartido(partido)}
            >
              {partido.nombre_partido} - {partido.liga.nombre}
            </button>
          </li>
        ))}
      </ul>

      {selectedPartido && (
        <div className="mt-4">
          <h4 className="font-semibold">Partido Seleccionado:</h4>
          <p>{selectedPartido.nombre_partido}</p>
          <p>Fecha: {selectedPartido.fecha}</p>
          <p>Estado: {selectedPartido.estado}</p>
          <p>Resultado: {selectedPartido.cumplido}</p>
          <p>Notas: {selectedPartido.notas}</p>
        </div>
      )}
    </div>
  );
}
