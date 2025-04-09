import { useState } from "react";
import Modal from "react-modal";
import { fetchWithAuth } from "../utils/authFetch";

Modal.setAppElement("#root");

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onMetodoGuardado: () => void;
};

export default function MetodoFormModal({ isOpen, onRequestClose, onMetodoGuardado }: Props) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;

    setLoading(true);
    try {
        const res = await fetchWithAuth("http://localhost:8000/api/general/metodos/", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // 👈 AÑADE ESTO
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
      className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-auto mt-24 outline-none text-gray-700"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Añadir método</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre del método"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onRequestClose}
            className="bg-red-600 text-white px-3 py-1 rounded mr-2 hover:bg-red-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
