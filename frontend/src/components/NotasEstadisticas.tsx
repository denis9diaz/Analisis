import React from "react";

const COLORS = {
  VERDE: "#16a34a",
  ROJO: "#dc2626",
  SIN_RESULTADO: "#2563eb",
};

export type Nota = {
  fecha: string;
  estado: string;
  cumplido: string | null;
  stake?: number | string;
  liga?: { nombre: string };
};

type Props = {
  notas: Nota[];
  filtroLiga: string;
  filtroEstado: string;
  filtroResultado: string;
  filtroMes: string;
  filtroStake: string; // ✅ NUEVO
};

export default function NotasEstadisticas({
  notas,
  filtroLiga,
  filtroEstado,
  filtroResultado,
  filtroMes,
  filtroStake, // ✅ NUEVO
}: Props) {
  const notasFiltradas = notas.filter((n) => {
    const coincideLiga =
      filtroLiga === "TODAS" || n.liga?.nombre === filtroLiga;
    const coincideEstado = filtroEstado === "TODOS" || n.estado === filtroEstado;
    const coincideResultado =
      filtroResultado === "TODOS" || (n.cumplido || "") === filtroResultado;
    const coincideMes = filtroMes === "TODOS" || n.fecha.startsWith(filtroMes);
    const coincideStake = filtroStake === "TODOS" || String(n.stake) === filtroStake;

    return coincideLiga && coincideEstado && coincideResultado && coincideMes && coincideStake;
  });

  const total = notasFiltradas.length;
  const aciertos = notasFiltradas.filter((n) => n.cumplido === "VERDE").length;
  const fallos = notasFiltradas.filter((n) => n.cumplido === "ROJO").length;
  const sinResultado = notasFiltradas.filter(
    (n) => !n.cumplido || n.cumplido === ""
  ).length;
  const porcentaje = total > 0 ? ((aciertos / total) * 100).toFixed(1) : "0";

  return (
    <div className="mb-4 bg-white border border-gray-200 rounded-md p-4 shadow-sm text-sm text-gray-700">
      <p className="mb-1 font-medium flex items-center gap-2">
        <img src="/2.png" alt="Estadísticas" className="w-5 h-5" />
        Estadísticas (según filtros aplicados):
      </p>
      <div className="flex flex-wrap gap-4">
        <span>
          Partidos: <strong>{total}</strong>
        </span>
        <span className="text-green-700">
          Aciertos: <strong>{aciertos}</strong>
        </span>
        <span className="text-red-700">
          Fallos: <strong>{fallos}</strong>
        </span>
        <span className="text-gray-600">
          Sin resultado: <strong>{sinResultado}</strong>
        </span>
        <span>
          Porcentaje de acierto: <strong>{porcentaje}%</strong>
        </span>
      </div>
    </div>
  );
}
