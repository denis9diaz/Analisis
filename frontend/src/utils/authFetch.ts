export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
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

    // Si no hay access token, redirigir al login inmediatamente
    if (!access) {
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        window.location.href = "/";
        return Promise.reject("No access token disponible");
    }

    let res = await fetch(input, applyAuth(access));

    if (res.status === 401 && refresh) {
        // Intentar refrescar token
        const refreshRes = await fetch("/api/auth/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("access_token", data.access);
            access = data.access;

            // Reintentar la petición original con nuevo token
            res = await fetch(input, applyAuth(access as string));
        } else {
            // Logout automático
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("username");
            window.location.href = "/";
            return Promise.reject("Sesión expirada");
        }
    }

    return res;
}
