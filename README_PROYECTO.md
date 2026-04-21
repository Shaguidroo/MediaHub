# 📚 MediaHub - Biblioteca Multimedia

## Descripción del Proyecto

Solución integral para la gestión, organización y acceso eficiente a una base de datos multimedia que integra libros, audiolibros, videos educativos y música en una única plataforma centralizada.

### Problema

Una biblioteca de medios enfrenta dificultades para:
- Organizar y gestionar diversos tipos de medios
- Proporcionar búsqueda eficiente y efectiva
- Mantener metadatos detallados de cada recurso
- Ofrecer acceso intuitivo a los usuarios

### Solución

- **Base de Datos Multimedia Centralizada**: MongoDB
- **API RESTful**: FastAPI (Python)
- **Frontend Intuitivo**: HTML5 + CSS3 + JavaScript vanilla
- **Funcionalidades**:
  - Búsqueda avanzada por múltiples criterios
  - Filtrado por tipo de media
  - Visualización de metadatos
  - Interfaz responsiva y moderna

---

## 📦 Estructura del Proyecto

```
proyecto-multimedia/
├── backend/                      # API FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # Punto de entrada
│   │   ├── models.py           # Modelos Pydantic
│   │   ├── database.py         # Conexión MongoDB
│   │   ├── schemas.py          # Esquemas de validación
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── medios.py       # Endpoints de medios
│   │       └── busqueda.py     # Endpoints de búsqueda
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                     # Interfaz Web
│   ├── index.html              # Página principal
│   ├── style.css               # Estilos
│   ├── script.js               # Lógica
│   └── README.md
│
├── docker-compose.yml          # Orquestación
├── .gitignore
└── README.md                   # Este archivo
```

---

## 🚀 Inicio Rápido

### Prerequisitos
- Docker & Docker Compose (recomendado)
- O: Python 3.9+, Node.js, MongoDB

### Con Docker (Recomendado)

```bash
# Clonar repositorio
git clone <repositorio>
cd proyecto-multimedia

# Iniciar servicios
docker-compose up

# Acceder a:
# - Frontend: http://localhost:5173
# - API: http://localhost:8000
# - Docs API: http://localhost:8000/docs
# - MongoDB: mongodb://admin:password@localhost:27017
```

### Sin Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configura .env
cp .env.example .env

python -m uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
# Abre index.html en tu navegador
# O usa Python: python -m http.server 8001
```

**MongoDB:**
```bash
# Instala MongoDB localmente o usa MongoDB Atlas (cloud)
# https://www.mongodb.com/try/download/community
```

---

## 🏗️ Arquitectura

### Backend - FastAPI

Endpoints principales:

```
GET    /api/medios              - Obtener todos los medios
GET    /api/medios/{id}         - Obtener un medio específico
POST   /api/medios              - Crear nuevo medio
PUT    /api/medios/{id}         - Actualizar medio
DELETE /api/medios/{id}         - Eliminar medio

GET    /api/buscar?q=...        - Buscar por término
GET    /api/buscar/tipo/{tipo}  - Filtrar por tipo
GET    /api/buscar/genero/{g}   - Filtrar por género

GET    /docs                    - Documentación interactiva (Swagger)
```

### Base de Datos - MongoDB

Colección: `medios`

```javascript
{
  "_id": ObjectId,
  "titulo": String,
  "autor": String,
  "tipo": "libro|audiolibro|video|musica",
  "genero": String,
  "año": Number,
  "duracion": String,
  "descripcion": String,
  "tags": [String],
  "metadatos": {
    "paginas": Number,        // Para libros
    "url_archivo": String,
    "tamaño_mb": Number,
    "formato": String
  },
  "creado_en": Date,
  "actualizado_en": Date
}
```

### Frontend

Características:
- ✅ Búsqueda en tiempo real
- ✅ Filtrado por tipo de media
- ✅ Ordenamiento múltiple
- ✅ Interfaz responsiva
- ✅ Animaciones suaves
- ✅ Conexión con API REST

---

## 📊 Funcionalidades Principales

### 1. **Gestión de Medios**
- Crear, leer, actualizar y eliminar registros
- Almacenamiento de metadatos detallados
- Soporte para 4 tipos de medios

### 2. **Búsqueda Avanzada**
- Búsqueda por título
- Búsqueda por autor
- Búsqueda por género
- Búsqueda por etiquetas/palabras clave
- Búsqueda combinada

### 3. **Organización**
- Filtrado por tipo de media
- Ordenamiento por fecha, título, autor
- Visualización en grid/lista
- Metadatos asociados

### 4. **Interfaz de Usuario**
- Diseño minimalista y profesional
- Animaciones modernas
- Completamente responsivo
- Búsqueda en tiempo real

---

## 🔧 Desarrollo

### Variables de Entorno (.env)

```
# Backend
MONGODB_URL=mongodb://admin:password@localhost:27017/
DB_NAME=biblioteca_multimedia
ENVIRONMENT=development

# Frontend
VITE_API_URL=http://localhost:8000
```

### Ejecutar Tests

```bash
# Backend
cd backend
pytest

# Frontend
# Tests en JavaScript vanilla (opcional)
```

### Construir para Producción

```bash
# Backend
docker build -t api-multimedia ./backend

# Frontend
# Simplemente deploy index.html a un servidor web
```

---

## 📝 Documentación

- [Backend README](./backend/README.md) - Detalles técnicos del API
- [Frontend README](./frontend/README.md) - Guía de la interfaz
- [Swagger Docs](http://localhost:8000/docs) - Documentación interactiva

---

## 👥 Equipo

| Nombre | Rol | Matrícula |
|--------|-----|-----------|
| [Nombre] | Full Stack | [Matrícula] |
| [Nombre] | Backend | [Matrícula] |
| [Nombre] | Frontend | [Matrícula] |

---

## 📚 Tecnologías

### Backend
- Python 3.9+
- FastAPI
- MongoDB
- Pydantic

### Frontend
- HTML5
- CSS3
- JavaScript (vanilla)
- Fetch API

### Infraestructura
- Docker
- Docker Compose

---

## 📄 Licencia

Proyecto académico - Universidad [Nombre]

---

## 🤝 Contribuciones

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Para dudas técnicas:
- Revisa la documentación en `/docs`
- Consulta el README del backend/frontend
- Abre un issue en el repositorio

---

**Última actualización:** 2024
