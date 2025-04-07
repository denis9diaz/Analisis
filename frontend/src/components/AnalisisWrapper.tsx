import { MetodoProvider } from "../context/MetodoContext";
import MetodosList from "./MetodosList";
import PartidosList from "./PartidosList";
import { useMetodo } from "../context/MetodoContext";

function PartidosConMetodo() {
  const { metodoSeleccionado } = useMetodo();
  return metodoSeleccionado ? <PartidosList /> : null;
}

export default function AnalisisWrapper() {
  return (
    <MetodoProvider>
      <div className="flex min-h-screen bg-gray-200 p-6 gap-6">
        <div className="w-1/6 bg-white rounded-lg shadow-md p-4">
          <MetodosList />
        </div>
        <div className="flex-1">
          <PartidosConMetodo />
        </div>
      </div>
    </MetodoProvider>
  );
}
