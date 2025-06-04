import { useState } from "react";
import Modal from "react-modal";
import { fetchWithAuth } from "../utils/authFetch";

Modal.setAppElement("#root");

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onMetodoGuardado: () => void;
};

export default function MetodoFormModal({
  isOpen,
  onRequestClose,
  onMetodoGuardado,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.PUBLIC_API_URL;

      const res = await fetchWithAuth(`${API_URL}/api/general/metodos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      if (res.ok) {
        await res.json();
        onMetodoGuardado();
        onRequestClose();
        setNombre("");
      } else {
        console.error("Error al guardar método");
      }
    } catch (err) {
      console.error("Error al guardar método:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Añadir Método"
      className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 sm:mx-auto mt-24 outline-none text-gray-700"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Añadir método
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre del método"
          value={nombre}
          spellCheck="false"
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onRequestClose}
            className="border border-rose-600 text-rose-600 px-5 py-2 rounded-xl hover:bg-rose-50 transition duration-300 text-sm font-semibold mr-2 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading
                ? "border border-blue-200 text-blue-300 cursor-not-allowed"
                : "border border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer"
            } px-5 py-2 rounded-xl transition duration-300 text-sm font-semibold`}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
