import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Metodo = {
  id: number;
  nombre: string;
};

type MetodoContextType = {
  metodoSeleccionado: Metodo | null;
  setMetodoSeleccionado: (metodo: Metodo | null) => void;
  showMetodoModal: boolean;
  setShowMetodoModal: (show: boolean) => void;
};

const MetodoContext = createContext<MetodoContextType | undefined>(undefined);

export function MetodoProvider({ children }: { children: ReactNode }) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<Metodo | null>(null);
  const [showMetodoModal, setShowMetodoModal] = useState(false);

  return (
    <MetodoContext.Provider
      value={{
        metodoSeleccionado,
        setMetodoSeleccionado,
        showMetodoModal,
        setShowMetodoModal,
      }}
    >
      {children}
    </MetodoContext.Provider>
  );
}

export function useMetodo() {
  const context = useContext(MetodoContext);
  if (!context) throw new Error("useMetodo debe usarse dentro de MetodoProvider");
  return context;
}
