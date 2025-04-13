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

type Stats = {
  total: number;
  resultados: Record<string, number>;
  estados: Record<string, number>;
};

export default function NotasStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const API_URL = import.meta.env.PUBLIC_API_URL;

    fetch(`${API_URL}/api/general/stats_notas/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStats)
      .catch((err) => console.error("Error al cargar estadísticas de notas:", err));
  }, []);

  if (!stats) return null;

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
    <div className="grid md:grid-cols-2 gap-6 my-8">
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
  );
}
