import { MetodoProvider } from "../context/MetodoContext";
import MetodosList from "./MetodosList";
import PartidosList from "./PartidosList";
import NotasList from "./NotasList";
import EmptyStateAnalisis from "./EmptyStateAnalisis";
import { useMetodo } from "../context/MetodoContext";

function ContenidoAnalisis() {
  const { metodoSeleccionado, modoNotas } = useMetodo();

  if (!metodoSeleccionado && !modoNotas) return <EmptyStateAnalisis />;

  return modoNotas ? <NotasList /> : <PartidosList />;
}

export default function AnalisisWrapper() {
  return (
    <MetodoProvider>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-200">
        <div className="flex flex-col xl:flex-row p-4 xl:p-6 gap-4 xl:gap-6">
        <div className="w-full lg:w-1/6 bg-white rounded-lg shadow-md p-4 self-start">
        <MetodosList />
          </div>
          <div className="flex-1">
            <ContenidoAnalisis />
          </div>
        </div>
      </div>
    </MetodoProvider>
  );
}
