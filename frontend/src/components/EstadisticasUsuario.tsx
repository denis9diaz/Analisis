import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = {
  ACIERTO: "#16a34a",
  FALLO: "#dc2626",
  "SIN RESULTADO": "#2563eb",
  LIVE: "#16a34a",
  APOSTADO: "#2563eb",
  NO: "#dc2626",
  VACÍO: "#e5e7eb",
};

const RESULTADO_LABELS = {
  VERDE: "ACIERTO",
  ROJO: "FALLO",
  SIN_RESULTADO: "SIN RESULTADO",
};

type Metodo = {
  id: number;
  nombre: string;
};

type Stats = {
  metodos: number;
  partidos: number;
  resultados: Record<string, number>;
  estados: Record<string, number>;
  cruce_resultado_estado: Record<string, Record<string, number>>;
};

export default function EstadisticasUsuario() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<null | number>(
    null
  );

  const fetchStats = async (metodoId: number | null) => {
    const token = localStorage.getItem("access_token");
    const url = metodoId
      ? `http://localhost:8000/api/general/stats/?metodo_id=${metodoId}`
      : `http://localhost:8000/api/general/stats/`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch("http://localhost:8000/api/general/metodos/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMetodos(data));

    fetchStats(null);
  }, []);

  useEffect(() => {
    fetchStats(metodoSeleccionado);
  }, [metodoSeleccionado]);

  if (!stats) return <p>Cargando estadísticas...</p>;

  const resultadoVacio = ["VERDE", "ROJO", "SIN_RESULTADO"].every(
    (key) => (stats.resultados?.[key] ?? 0) === 0
  );
  const estadoVacio = ["LIVE", "APOSTADO", "NO"].every(
    (key) => (stats.estados?.[key] ?? 0) === 0
  );

  const resultadoData = resultadoVacio
    ? [{ name: "VACÍO", value: 1 }]
    : ["VERDE", "ROJO", "SIN_RESULTADO"].map((key) => ({
        name: RESULTADO_LABELS[key as keyof typeof RESULTADO_LABELS],
        value: stats.resultados?.[key] ?? 0,
      }));

  const estadoData = estadoVacio
    ? [{ name: "VACÍO", value: 1 }]
    : ["LIVE", "APOSTADO", "NO"].map((key) => ({
        name: key,
        value: stats.estados?.[key] ?? 0,
      }));

  const renderLeyenda = (
    data: { name: string; value: number }[],
    total: number
  ) => {
    if (data.length === 1 && data[0].name === "VACÍO") return null;
    return (
      <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
        {data.map((entry) => {
          const porcentaje =
            total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[entry.name as keyof typeof COLORS],
                }}
              />
              <span>
                {entry.name} ({porcentaje}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 🔽 Selector de método */}
      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-sm text-gray-700">Filtrar por método:</label>
        <select
          className="border border-gray-300 px-3 py-1 rounded text-sm"
          value={metodoSeleccionado ?? ""}
          onChange={(e) =>
            setMetodoSeleccionado(
              e.target.value === "" ? null : +e.target.value
            )
          }
        >
          <option value="">Todos los métodos</option>
          {metodos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de Resultados */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-4">Resultados</h3>
          <div className="flex flex-col items-center">
            <PieChart width={250} height={250}>
              {resultadoVacio ? (
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#999"
                  fontSize={14}
                >
                  Sin datos
                </text>
              ) : (
                <Pie
                  data={resultadoData}
                  cx="50%"
                  cy="50%"
                  label
                  outerRadius={90}
                  dataKey="value"
                >
                  {resultadoData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
              )}
              <Tooltip />
            </PieChart>

            {renderLeyenda(
              resultadoData,
              resultadoData.reduce((acc, d) => acc + d.value, 0)
            )}
          </div>
        </div>

        {/* Gráfico de Estados */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-4">Estados</h3>
          <div className="flex flex-col items-center">
            <PieChart width={250} height={250}>
              {estadoVacio ? (
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#999"
                  fontSize={14}
                >
                  Sin datos
                </text>
              ) : (
                <Pie
                  data={estadoData}
                  cx="50%"
                  cy="50%"
                  label
                  outerRadius={90}
                  dataKey="value"
                >
                  {estadoData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
              )}
              <Tooltip />
            </PieChart>

            {renderLeyenda(
              estadoData,
              estadoData.reduce((acc, d) => acc + d.value, 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
