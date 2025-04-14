const API_URL = import.meta.env.PUBLIC_API_URL;

let isRefreshing = false; // Estado para evitar múltiples refrescos simultáneos
let refreshQueue: (() => void)[] = []; // Cola para reintentar peticiones

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {},
  redirectOnFail: boolean = true
): Promise<Response> {
  let access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  const applyAuth = (token: string) => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!access) {
    if (redirectOnFail) {
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      window.location.href = "/";
    }
    return Promise.reject("No access token disponible");
  }

  let finalUrl = input;
  if (typeof input === "string" && input.startsWith("/")) {
    finalUrl = `${API_URL}${input}`;
  }

  let res = await fetch(finalUrl, applyAuth(access));

  if (res.status === 401 && refresh) {
    console.warn("Token de acceso expirado. Intentando refrescar...");
    try {
      await silentTokenRefresh();
      access = localStorage.getItem("access_token");
      if (access) {
        return fetch(finalUrl, applyAuth(access));
      }
    } catch (err) {
      console.error("Error al refrescar el token:", err);
      if (redirectOnFail) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        window.location.href = "/";
      }
      return Promise.reject("Sesión expirada. Refresh token inválido.");
    }
  }

  return res;
}

export async function silentTokenRefresh() {
  const refresh = localStorage.getItem("refresh_token");

  if (!refresh) {
    console.warn("No refresh token disponible.");
    return;
  }

  try {
    console.log("Intentando refrescar el token...");
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access_token", data.access);
    
      // 🔥 NUEVO: Guarda también el nuevo refresh token si lo manda
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }
    
      console.info("Access token refrescado en segundo plano.");
    } else {
      console.warn("No se pudo refrescar el token en segundo plano. Eliminando credenciales...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      window.location.href = "/";
    }
  } catch (err) {
    console.error("Error al refrescar token en segundo plano:", err);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    window.location.href = "/";
  }
}

// Expone la función globalmente para que pueda ser usada desde Astro
if (typeof window !== "undefined") {
  // @ts-ignore
  window.silentTokenRefresh = silentTokenRefresh;
}
