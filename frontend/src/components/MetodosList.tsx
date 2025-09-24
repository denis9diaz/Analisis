import { useEffect, useState } from "react";
import { useMetodo } from "../context/MetodoContext";
import { fetchWithAuth } from "../utils/authFetch";
import MetodoFormModal from "./MetodoFormModal";
import Modal from "react-modal";
import { Trash2 } from "lucide-react";

type Metodo = {
  id: number;
  nombre: string;
};

export default function MetodosList() {
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const { metodoSeleccionado, setMetodoSeleccionado, modoNotas, setModoNotas } =
    useMetodo();

  const [showModalMetodo, setShowModalMetodo] = useState(false);
  const [metodoAEliminar, setMetodoAEliminar] = useState<Metodo | null>(null);

  useEffect(() => {
    cargarMetodos();
  }, []);

  const cargarMetodos = () => {
    const API_URL = import.meta.env.PUBLIC_API_URL;

    fetchWithAuth(`${API_URL}/api/general/metodos/`)
      .then((res) => res.json())
      .then((data) => setMetodos(data));
  };

  const handleSelectMetodo = (metodo: Metodo) => {
    setModoNotas(false); // salir del modo notas si se selecciona un método
    setMetodoSeleccionado(metodo);
  };

  const eliminarMetodo = () => {
    if (!metodoAEliminar) return;
    const API_URL = import.meta.env.PUBLIC_API_URL;

    fetchWithAuth(`${API_URL}/api/general/metodos/${metodoAEliminar.id}/`, {
      method: "DELETE",
    }).then(() => {
      setMetodoAEliminar(null);
      cargarMetodos();
      if (metodoSeleccionado?.id === metodoAEliminar.id) {
        setMetodoSeleccionado(null);
      }
    });
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          Mis métodos
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {metodos.length} métodos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setShowModalMetodo(true)}
          className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <span className="relative flex items-center justify-center gap-1 text-m">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Añadir
          </span>
        </button>

        <button
          onClick={() => {
            setModoNotas(!modoNotas);
            setMetodoSeleccionado(null);
          }}
          className={`group relative font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
            modoNotas 
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white" 
              : "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700"
          }`}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <span className="relative flex items-center justify-center gap-1 text-m">
            {modoNotas ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
            {modoNotas ? "Métodos" : "Notas"}
          </span>
        </button>
      </div>

      {!modoNotas && (
        <div className="max-h-150 overflow-y-auto">
          {metodos.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">No tienes métodos creados</p>
              <p className="text-gray-400 text-xs mt-1">Crea tu primer método para comenzar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {metodos.map((metodo, index) => {
                const isSelected = metodoSeleccionado?.id === metodo.id;
                return (
                  <div
                    key={metodo.id}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md shadow-blue-100"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Indicador de selección */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                    )}
                    
                    <div className="flex items-center justify-between px-3 py-2">
                      <button
                        className="flex-1 text-left group cursor-pointer"
                        onClick={() => handleSelectMetodo(metodo)}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Número del método */}
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isSelected 
                              ? "bg-blue-500 text-white" 
                              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          }`}>
                            {index + 1}
                          </div>
                          
                          {/* Contenido del método */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-m transition-colors truncate ${
                              isSelected 
                                ? "text-blue-800" 
                                : "text-gray-800 group-hover:text-gray-900"
                            }`}>
                              {metodo.nombre}
                            </h4>
                          </div>

                          {/* Estado visual */}
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Botón de eliminar */}
                      <button
                        className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 cursor-pointer group"
                        onClick={() => setMetodoAEliminar(metodo)}
                        title="Eliminar método"
                      >
                        <Trash2 size={13} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Efecto hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <MetodoFormModal
        isOpen={showModalMetodo}
        onRequestClose={() => setShowModalMetodo(false)}
        onMetodoGuardado={cargarMetodos}
      />

      <Modal
        isOpen={!!metodoAEliminar}
        onRequestClose={() => setMetodoAEliminar(null)}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto mt-40 border border-gray-100"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 backdrop-blur-sm"
      >
        <div className="text-center">
          {/* Icono de advertencia */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            ¿Eliminar método?
          </h2>
          <p className="text-sm text-gray-600 mb-2 font-medium">
            "{metodoAEliminar?.nombre}"
          </p>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Esta acción no se puede deshacer. Se eliminarán todos los partidos asociados y datos relacionados.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setMetodoAEliminar(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={eliminarMetodo}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
