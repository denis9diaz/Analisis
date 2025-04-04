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
      <div className="flex">
        <div className="w-1/6">
          <MetodosList />
        </div>
        <div className="w-5/6">
          <PartidosConMetodo />
        </div>
      </div>
    </MetodoProvider>
  );
}
