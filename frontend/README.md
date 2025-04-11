# BetTracker - Frontend

Frontend del proyecto **BetTracker**, una plataforma profesional para registrar y analizar tus apuestas deportivas. Está desarrollado utilizando **Astro**, con componentes en **React** y estilos en **TailwindCSS**.

---

## ✨ Tecnologías utilizadas

- **Astro**: Framework para crear sitios rápidos y optimizados.
- **React + TypeScript**: Para construir los componentes interactivos con tipado estático.
- **TailwindCSS**: Para los estilos responsivos y personalizados.
- **JWT (manejo de sesión)**: El frontend gestiona los tokens emitidos por el backend para mantener la autenticación del usuario.
- **React-Select**: Para la selección de ligas con banderas.

---

## ✅ Requisitos previos

- Tener **Node.js** instalado (preferiblemente la versión LTS).
- Tener **npm** (gestor de paquetes de Node.js) instalado en el sistema.

---

## ⚙️ Pasos para levantar el frontend (modo desarrollo)

### 1. Clona el repositorio
```bash
git clone https://github.com/denis9diaz/Analisis.git
cd frontend
```

### 2. Instala las dependencias
```bash
npm install
```

### 3. Crea el archivo `.env`
Dentro de la carpeta `frontend`, crea un archivo llamado `.env` y define las siguientes variables:
```bash
"datos del .env"
```

### 4. Ejecuta el servidor de desarrollo
```bash
npm run dev
```

### 5. Construye para producción
```bash
npm run build
```

### 6. Revisa el sitio de producción localmente
```bash
npm run preview
```

## 🔐 Autenticación

Este frontend interactúa con el backend a través de una API REST autenticada con JWT. 
Las credenciales de los usuarios se almacenan y gestionan utilizando tokens Access y Refresh.
