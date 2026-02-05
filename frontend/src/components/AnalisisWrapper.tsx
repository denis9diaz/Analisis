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
        <div className="flex flex-col lg:flex-row p-2 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6">
          <div className="w-full lg:w-64 xl:w-72 bg-white rounded-lg shadow-md p-3 sm:p-4 lg:self-start lg:sticky lg:top-4">
            <MetodosList />
          </div>
          <div className="flex-1 min-w-0">
            <ContenidoAnalisis />
          </div>
        </div>
      </div>
    </MetodoProvider>
  );
}
