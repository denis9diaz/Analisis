import { useEffect, useState } from "react";
import Select from "react-select";

type Liga = {
  id: number;
  nombre: string;
  codigo_pais: string;
};

type Option = {
  value: number;
  label: JSX.Element;
};

export default function LigaSelect() {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/general/ligas/")
      .then((res) => res.json())
      .then((data: Liga[]) => {
        const formattedOptions = data.map((liga) => ({
          value: liga.id,
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={`https://flagcdn.com/w20/${liga.codigo_pais.toLowerCase()}.png`}
                alt={`Bandera de ${liga.nombre}`}
                width={20}
                height={15}
              />
              {liga.nombre}
            </div>
          ),
        }));

        setOptions(formattedOptions);
      })
      .catch((err) => console.error("Error cargando ligas:", err));
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor="liga" className="block font-medium mb-2">
        Selecciona una liga:
      </label>
      <Select
        options={options}
        placeholder="-- Selecciona una liga --"
        styles={{
          control: (base) => ({ ...base, minHeight: "40px" }),
          option: (base) => ({ ...base, display: "flex", alignItems: "center" }),
        }}
      />
    </div>
  );
}
