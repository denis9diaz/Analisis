# BetTracker - Backend

Este es el backend del proyecto **BetTracker**, una plataforma profesional para registrar y analizar tus apuestas deportivas. Está desarrollado en **Django** y expone una API REST autenticada con **JWT**.

---

## ✨ Tecnologías utilizadas

- Python 3.13.2
- Django
- Django REST Framework
- SimpleJWT (autenticación)
- SQLite (modo local)

---

## ✅ Requisitos previos

- Tener Python 3.13 instalado.
- Tener `pip` disponible en el sistema.

---

## ⚙️ Pasos para levantar el backend (modo desarrollo)

### 1. Clona el repositorio
```bash
git clone https://github.com/denis9diaz/bettracker.git
cd bettracker/backend
```

### 2. Crea y activa el entorno virtual
```bash
py -3.13 -m venv venv
venv\Scripts\activate  # En Windows
```

### 3. Instala las dependencias
```bash
pip install -r requirements.txt
```

### 4. Crea el archivo `.env`
Dentro de la carpeta `backend`, crea un archivo llamado `.env` y define las siguientes variables:

```
datos del .env
```

### 5. Aplica migraciones
```bash
python manage.py migrate
```

### 6. (Opcional) Crea un superusuario para acceder al admin
```bash
python manage.py createsuperuser
```

### 7. Ejecuta el servidor de desarrollo
```bash
python manage.py runserver
```

### 8. (Opcional) Crea un método y ejecuta comandos para poblar la base de datos desde management/commands/...

---

## 📂 Estructura del proyecto

- `auth/`: gestión de usuarios, JWT, recuperación y verificación de cuentas
- `general/`: métodos de análisis, ligas, partidos y estadísticas
- `config/`: configuración global del proyecto (settings, urls, etc.)
- `templates/email/`: plantillas HTML para correos

---

## 🔐 Acceso a administración y documentación

- Accede al panel de administración en: http://localhost:8000/admin/
