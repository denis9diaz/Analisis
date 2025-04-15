import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedPlan = params.get("plan") || "";
    setPlan(selectedPlan);

    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("username");

    if (!token || !user) {
      // Guarda el plan para redirigir después de login
      const redirectTo = `/checkout?plan=${selectedPlan}`;
      window.location.href = `/inicio-sesion?next=${encodeURIComponent(
        redirectTo
      )}`;
    } else {
      setUsername(user);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-white">Cargando...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#0b0f24] text-white p-6 rounded-xl shadow-lg border border-white/10">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Confirmar suscripción
      </h1>
      <p className="text-center mb-6">
        Estás a punto de contratar el plan:{" "}
        <strong className="text-green-300 capitalize">{plan}</strong>
      </p>

      <button
        className="w-full cursor-pointer bg-gradient-to-br from-green-300 via-green-400 to-green-600 text-gray-800 font-semibold py-3 px-6 rounded-full hover:from-green-400 hover:to-green-700 transition"
        onClick={async () => {
          console.log("Plan enviado al backend:", plan);
          const planMap = {
            mensual: "mensual",
            trimestral: "trimestral",
            anual: "anual",
          };

          const backendPlan = planMap[plan as keyof typeof planMap];

          if (!backendPlan) {
            alert("El plan seleccionado no es válido.");
            return;
          }

          const API_URL = import.meta.env.PUBLIC_API_URL;

          const res = await fetch(
            `${API_URL}/api/general/suscripcion/`,

            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
              body: JSON.stringify({ plan: backendPlan }),
            }
          );

          if (res.ok) {
            const toast = document.getElementById("toast-success");
            if (toast) {
              toast.classList.remove("opacity-0");
              toast.classList.add("opacity-100");

              setTimeout(() => {
                toast.classList.remove("opacity-100");
                toast.classList.add("opacity-0");
                window.location.href = "/cuenta";
              }, 2000);
            }
          } else {
            const errorText = await res.text();
            alert("Error al contratar el plan.\n" + errorText);
          }
        }}
      >
        Confirmar contratación
      </button>
      <div
        id="toast-success"
        className="fixed top-36 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg opacity-0 transition-all duration-300 pointer-events-none z-50 text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-300"
      >
        Suscripción activada correctamente
      </div>
    </div>
  );
}
