import { useEffect, useState } from 'react'

export default function CheckoutPage() {
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const selectedPlan = params.get('plan') || ''
    setPlan(selectedPlan)

    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('username')

    if (!token || !user) {
      window.location.href = '/inicio-sesion'
    } else {
      setUsername(user)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="text-center mt-10 text-white">Cargando...</div>
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#0b0f24] text-white p-6 rounded-xl shadow-lg border border-white/10">
      <h1 className="text-2xl font-bold mb-4 text-center">Confirmar suscripción</h1>
      <p className="text-center mb-6">
        Estás a punto de contratar el plan: <strong className="text-green-300">{plan}</strong>
      </p>

      <button
        className="w-full bg-gradient-to-br from-green-300 via-green-400 to-green-600 text-white font-semibold py-3 px-6 rounded-full hover:from-green-400 hover:to-green-700 transition"
        onClick={async () => {
          const res = await fetch('http://localhost:8000/api/suscripciones/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ plan }),
          })

          if (res.ok) {
            window.location.href = '/cuenta'
          } else {
            alert('Error al contratar el plan.')
          }
        }}
      >
        Confirmar contratación
      </button>
    </div>
  )
}
