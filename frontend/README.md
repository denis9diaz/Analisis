# BetTracker - Frontend

Este es el frontend del proyecto **BetTracker**, una plataforma profesional para registrar y analizar tus apuestas deportivas. Está desarrollado utilizando **Astro**, con componentes en **React** y estilos en **TailwindCSS**.

---

## ✨ Tecnologías utilizadas

- **Astro**: Framework para crear sitios rápidos y optimizados.
- **React**: Para la construcción de los componentes interactivos.
- **TailwindCSS**: Para los estilos responsivos y personalizados.
- **JWT**: Para la autenticación y manejo de sesión del usuario.
- **React-Select**: Para la selección de ligas con banderas.

---

## ✅ Requisitos previos

- Tener **Node.js** instalado (preferiblemente la versión LTS).
- Tener **npm** (gestor de paquetes de Node.js) instalado en el sistema.

---

## ⚙️ Pasos para levantar el frontend (modo desarrollo)

### 1. Clona el repositorio
```bash
git clone https://github.com/denis9diaz/bettracker.git
cd bettracker/frontend
```

### 2. Instala las dependencias
```bash
npm install
```

### 3. Ejecuta el servidor de desarrollo
```bash
npm run dev
```

## ✅ Requisitos previos

- Tener **Node.js** instalado (preferiblemente la versión LTS).
- Tener **npm** (gestor de paquetes de Node.js) instalado en el sistema.

Esto iniciará el servidor de desarrollo en http://localhost:4321

---

### 4. Construye para producción
```bash
npm run build
```

### 5. Revisa el sitio de producción localmente
```bash
npm run preview
```

## 🔐 Autenticación

Este frontend interactúa con el backend a través de una API REST autenticada con JWT. 
Las credenciales de los usuarios se almacenan y gestionan utilizando tokens Access y Refresh.
