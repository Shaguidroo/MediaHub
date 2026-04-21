# main.py
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from datetime import datetime
from .database import db_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestor del ciclo de vida de la aplicación"""
    await db_manager.connect()
    yield
    await db_manager.close()

app = FastAPI(
    title="MediaHub API",
    description="API para gestión de biblioteca multimedia",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - Permitir que el frontend acceda a la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: especificar dominios
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos multimedia (carpeta /media)
# Uso: /content/videos/archivo.mp4 → media/videos/archivo.mp4
try:
    app.mount("/content", StaticFiles(directory="media"), name="media")
except Exception as e:
    print(f"⚠️  Advertencia: No se pudo montar carpeta /media: {e}")

# ==================== ENDPOINTS ====================

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz con info de la API"""
    return {
        "nombre": "MediaHub API",
        "version": "1.0.0",
        "descripcion": "API para gestión de biblioteca multimedia",
        "endpoints": {
            "medios": "/api/medios",
            "buscar": "/api/buscar",
            "crear": "/api/medios (POST)",
            "eliminar": "/api/medios/{id} (DELETE)"
        },
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Verificar estado de la API y BD"""
    try:
        # Intentar ping a MongoDB
        await db_manager.db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = "disconnected"
        print(f"❌ Error de BD: {e}")
    
    return {
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }

# ==================== LECTURA ====================

@app.get("/api/medios", tags=["Medios"])
async def listar_medios(skip: int = 0, limit: int = 20):
    """
    Obtener lista de medios (paginado)
    
    - **skip**: Número de registros a saltar
    - **limit**: Número máximo de registros
    """
    try:
        medios = await db_manager.get_all_medios(skip, limit)
        total = await db_manager.count_medios()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "medios": medios
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/medios/{medio_id}", tags=["Medios"])
async def obtener_medio(medio_id: str):
    """
    Obtener un medio específico por ID
    
    - **medio_id**: ObjectId de MongoDB
    """
    try:
        medio = await db_manager.get_medio_by_id(medio_id)
        
        if not medio:
            raise HTTPException(status_code=404, detail="Medio no encontrado")
        
        return {"data": medio}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID inválido: {str(e)}")

@app.get("/api/buscar", tags=["Búsqueda"])
async def buscar_medios(q: str = "", tipo: str = "", genero: str = ""):
    """
    Búsqueda avanzada de medios
    
    - **q**: Término de búsqueda
    - **tipo**: Filtrar por tipo (libro, audiolibro, video, musica)
    - **genero**: Filtrar por género
    """
    try:
        resultados = await db_manager.search_medios(
            query=q,
            tipo=tipo,
            genero=genero
        )
        
        return {
            "total": len(resultados),
            "query": q,
            "filtros": {
                "tipo": tipo if tipo else None,
                "genero": genero if genero else None
            },
            "medios": resultados
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tipos", tags=["Metadata"])
async def obtener_tipos():
    """Obtener todos los tipos de medios disponibles"""
    try:
        tipos = await db_manager.get_tipos()
        return {"tipos": sorted(tipos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/generos", tags=["Metadata"])
async def obtener_generos():
    """Obtener todos los géneros disponibles"""
    try:
        generos = await db_manager.get_generos()
        return {"generos": sorted(generos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CREACIÓN ====================

@app.post("/api/medios", tags=["Medios"])
async def crear_medio(medio: dict = Body(...)):
    """
    Crear un nuevo medio
    
    Campos requeridos mínimos:
    - titulo (str)
    - autor (str)
    - tipo (str): libro, audiolibro, video, musica
    
    Campos opcionales:
    - genero (str)
    - año (int)
    - duracion (str)
    - descripcion (str)
    - tags (list)
    - metadatos (dict)
    """
    try:
        # Validar campos requeridos
        if not medio.get("titulo"):
            raise HTTPException(status_code=400, detail="Título es requerido")
        if not medio.get("autor"):
            raise HTTPException(status_code=400, detail="Autor es requerido")
        if not medio.get("tipo"):
            raise HTTPException(status_code=400, detail="Tipo es requerido")
        
        # Construir documento
        nuevo_medio = {
            "titulo": medio.get("titulo", "").strip(),
            "autor": medio.get("autor", "").strip(),
            "tipo": medio.get("tipo", "").lower(),
            "genero": medio.get("genero", "General").strip(),
            "año": medio.get("año", datetime.now().year),
            "duracion": medio.get("duracion", "N/A"),
            "descripcion": medio.get("descripcion", "").strip(),
            "tags": [tag.strip() for tag in medio.get("tags", []) if isinstance(tag, str)],
            "metadatos": medio.get("metadatos", {}),
            "creado_en": datetime.now(),
            "actualizado_en": datetime.now()
        }
        
        # Insertar en BD
        medio_id = await db_manager.insert_medio(nuevo_medio)
        
        return {
            "id": medio_id,
            "status": "success",
            "message": "Medio creado correctamente"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear medio: {str(e)}")

# ==================== ACTUALIZACIÓN ====================

@app.put("/api/medios/{medio_id}", tags=["Medios"])
async def actualizar_medio(medio_id: str, medio: dict = Body(...)):
    """
    Actualizar un medio existente
    
    - **medio_id**: ObjectId de MongoDB
    - **medio**: Campos a actualizar
    """
    try:
        # Preparar datos actualizados
        datos_actualizacion = {
            key: value for key, value in medio.items()
            if key not in ["_id", "creado_en"]  # No permitir cambiar estos
        }
        
        datos_actualizacion["actualizado_en"] = datetime.now()
        
        # Actualizar en BD
        exito = await db_manager.update_medio(medio_id, datos_actualizacion)
        
        if not exito:
            raise HTTPException(status_code=404, detail="Medio no encontrado")
        
        return {
            "id": medio_id,
            "status": "success",
            "message": "Medio actualizado correctamente"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar: {str(e)}")

# ==================== ELIMINACIÓN ====================

@app.delete("/api/medios/{medio_id}", tags=["Medios"])
async def borrar_medio(medio_id: str):
    """
    Eliminar un medio
    
    - **medio_id**: ObjectId de MongoDB
    """
    try:
        exito = await db_manager.delete_medio(medio_id)
        
        if not exito:
            raise HTTPException(status_code=404, detail="Medio no encontrado")
        
        return {
            "status": "success",
            "message": "Medio eliminado correctamente"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar: {str(e)}")

# ==================== EVENTOS ====================

@app.on_event("startup")
async def startup():
    """Ejecutarse al iniciar la API"""
    print("🚀 MediaHub API iniciada")

@app.on_event("shutdown")
async def shutdown():
    """Ejecutarse al cerrar la API"""
    print("🛑 MediaHub API cerrada")
