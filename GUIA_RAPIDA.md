# 🚀 GUÍA RÁPIDA - MediaHub

## Estructura de Carpetas a Crear

```
proyecto-multimedia/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Vacío
│   │   └── main.py             # (El código que te pasé)
│   ├── requirements.txt         # (El archivo que te pasé)
│   ├── Dockerfile              # (El archivo que te pasé)
│   └── .env                    # (Copia de .env.example)
├── frontend/
│   ├── index.html              # (El archivo HTML que te pasé)
│   └── README.md               # Puedes dejar vacío por ahora
├── docker-compose.yml          # (El archivo que te pasé)
├── nginx.conf                  # (El archivo que te pasé)
├── init-db.js                  # (El archivo que te pasé)
├── .env.example                # (El archivo que te pasé)
├── .gitignore                  # (El archivo que te pasé)
└── README.md                   # (El archivo que te pasé)
```

---

## OPCIÓN 1: Con Docker (RECOMENDADO) ✅

### Requisitos
- Docker instalado: https://www.docker.com/

### Pasos

1. **Crear estructura de carpetas:**
```bash
mkdir proyecto-multimedia
cd proyecto-multimedia
mkdir backend
mkdir backend/app
mkdir frontend
```

2. **Copiar los archivos en sus respectivas carpetas** (como se muestra arriba)

3. **Iniciar los servicios:**
```bash
docker-compose up
```

4. **Acceder a:**
   - 🌐 **Frontend**: http://localhost (o puerto 80)
   - 📚 **API**: http://localhost:8000
   - 📖 **Documentación API**: http://localhost:8000/docs
   - 🗄️ **MongoDB**: mongodb://admin:password@localhost:27017

5. **Para detener:**
```bash
docker-compose down
```

---

## OPCIÓN 2: Sin Docker (MANUAL)

### Requisitos
- Python 3.9+: https://www.python.org/
- MongoDB: https://www.mongodb.com/try/download/community
- O MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Backend Setup

```bash
# 1. Navegar a la carpeta del backend
cd backend

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Crear archivo .env
cp .env.example .env

# 6. Ejecutar servidor
python -m uvicorn app.main:app --reload
```

El servidor estará en: **http://localhost:8000**

### Frontend Setup

```bash
# 1. Navegar a frontend
cd frontend

# 2. Opción A: Abrir directamente
open index.html

# 2. Opción B: Usar Python como servidor
python -m http.server 8001

# Acceder a: http://localhost:8001
```

### MongoDB Setup

**Opción A: Local**
```bash
# Descargar desde:
# https://www.mongodb.com/try/download/community

# Iniciar MongoDB (cambia la ruta según tu instalación)
mongod --dbpath /path/to/data
```

**Opción B: MongoDB Atlas (Cloud) - RECOMENDADO**
1. Crea cuenta en https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito
3. Obtén tu connection string
4. Actualiza .env con tu URL

---

## Verificar que Todo Funciona

### Con Docker:
```bash
# Verificar servicios
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Ejecutar comando en contenedor
docker-compose exec backend python -m app.main
```

### Sin Docker:
1. Abre http://localhost:8000/health → Debe retornar `{"status":"ok"}`
2. Abre http://localhost:8000/docs → Debe mostrar Swagger UI
3. Abre http://localhost:8001 → Debe mostrar interfaz

---

## Primeros Pasos con Git

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: MediaHub project setup"

# Agregar origen remoto
git remote add origin https://github.com/tuusuario/proyecto-multimedia.git

# Push
git push -u origin main
```

---

## Estructura de Trabajo en Equipo

### Para cada integrante:

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/proyecto-multimedia.git
cd proyecto-multimedia

# OPCIÓN 1: Con Docker (1 línea)
docker-compose up

# OPCIÓN 2: Sin Docker (seguir pasos de manual setup)
```

**Cada persona puede trabajar en su rama:**
```bash
git checkout -b feature/mi-feature
# ... hacer cambios ...
git commit -m "Descripción del cambio"
git push origin feature/mi-feature
# Abrir Pull Request en GitHub
```

---

## Estructura del Backend (próximos pasos)

Después de que todo esté funcionando, expandirás:

```python
# app/models.py - Modelos Pydantic para validación
class Medio(BaseModel):
    titulo: str
    autor: str
    tipo: str
    # ... más campos

# app/routes/medios.py - CRUD completo
@app.post("/api/medios") 
async def crear_medio(medio: Medio):
    # ...

# app/routes/busqueda.py - Búsquedas avanzadas
@app.get("/api/buscar/avanzado")
async def busqueda_avanzada(...):
    # ...
```

---

## Datos de Ejemplo

La BD viene precargada con 8 medios de ejemplo (libros, audiolibros, videos, música).

Para agregar más, puedes:
1. Editar `init-db.js` antes de iniciar Docker
2. O hacer llamadas POST a `/api/medios` (cuando implementes el endpoint)

---

## Solucionar Problemas

### Puerto ya en uso
```bash
# Encontrar qué proceso usa el puerto
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Cambiar puerto en docker-compose.yml
# "8001:8000" en lugar de "8000:8000"
```

### Conexión a MongoDB fallando
- Verificar que MongoDB esté corriendo
- En .env, revisar `MONGODB_URL`
- Si usas Atlas, asegúrate que tu IP esté en whitelist

### Frontend no ve la API
- Revisar que `API_URL` en JavaScript sea correcto
- CORS está habilitado en FastAPI
- Verificar que backend esté corriendo

---

## Recursos Útiles

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Docker Docs**: https://docs.docker.com/
- **Git Guide**: https://git-scm.com/book/es/v2

---

## ¡Listo! 🎉

Ya tienes todo para:
- ✅ Colaborar en equipo con Git
- ✅ Ambiente reproducible con Docker
- ✅ API funcional con FastAPI
- ✅ BD Multimedia con MongoDB
- ✅ Frontend profesional

**¿Dudas? Consulta el README.md completo**
