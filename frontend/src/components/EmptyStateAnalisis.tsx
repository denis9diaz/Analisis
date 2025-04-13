export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-start h-full pt-24 text-gray-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 mb-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c.657 0 1.313.168 1.889.497A4 4 0 0016 8a4 4 0 100 8 4 4 0 00-2.111-.497A4.001 4.001 0 0112 16a4.001 4.001 0 01-1.889-.497A4 4 0 008 16a4 4 0 100-8c.657 0 1.313.168 1.889.497A4.001 4.001 0 0112 8z"
        />
      </svg>
      <h2 className="text-xl font-semibold mb-6">Sin método seleccionado</h2>
      <p className="text-ml text-center max-w-sm mb-6">
        Selecciona un método de análisis en la sección lateral
        izquierda o crea un método pulsando "Añadir método".
      </p>
      <p className="text-ml text-center max-w-sm">
        La pestaña "Notas" está pensada para apuntar los partidos que quieres analizar en un futuro. Añádelos y los tendrás a solo un clic.
      </p>
    </div>
  );
}
