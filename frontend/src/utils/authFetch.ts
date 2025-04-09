export async function fetchWithAuth(
    input: RequestInfo,
    init: RequestInit = {},
    redirectOnFail: boolean = true
) {
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

    // Si no hay access token
    if (!access) {
        if (redirectOnFail) {
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("username");
            window.location.href = "/";
        }
        return Promise.reject("No access token disponible");
    }

    let res = await fetch(input, applyAuth(access));

    // Si el access token ha expirado
    if (res.status === 401 && refresh) {
        const refreshRes = await fetch("/api/auth/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("access_token", data.access);
            access = data.access;

            // Reintentar la petición original
            res = await fetch(input, applyAuth(access!));
        } else {
            if (redirectOnFail) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("username");
                window.location.href = "/";
            }
            return Promise.reject("Sesión expirada");
        }
    }

    return res;
}

export async function silentTokenRefresh() {
    const refresh = localStorage.getItem("refresh_token");

    if (!refresh) return;

    try {
        const res = await fetch("/api/auth/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("access_token", data.access);
            console.info("Access token refrescado en segundo plano.");
        } else {
            console.warn("No se pudo refrescar el token en segundo plano.");
        }
    } catch (err) {
        console.error("Error al refrescar token en segundo plano:", err);
    }
}
