# database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

class MongoManager:
    """Gestor de operaciones con MongoDB"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.url = os.getenv("MONGODB_URL", "mongodb://admin:password@localhost:27017")
        self.db_name = os.getenv("DB_NAME", "biblioteca_multimedia")

    async def connect(self):
        """Conectar a MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.url)
            self.db = self.client[self.db_name]
            await self.db.command("ping")
            print(f"✅ Conectado a MongoDB: {self.db_name}")
        except Exception as e:
            print(f"❌ Error conectando a MongoDB: {e}")
            raise

    async def close(self):
        """Cerrar conexión con MongoDB"""
        if self.client:
            self.client.close()
            print("✅ Conexión a MongoDB cerrada")

    # ==================== LECTURA ====================

    async def get_all_medios(self, skip: int = 0, limit: int = 10):
        """Obtener todos los medios (paginado)"""
        try:
            cursor = self.db.medios.find().skip(skip).limit(limit)
            medios = await cursor.to_list(length=limit)
            return self._convertir_ids(medios)
        except Exception as e:
            print(f"❌ Error obteniendo medios: {e}")
            return []

    async def get_medio_by_id(self, medio_id: str):
        """Obtener un medio por ID"""
        try:
            medio = await self.db.medios.find_one({"_id": ObjectId(medio_id)})
            if medio:
                medio["_id"] = str(medio["_id"])
            return medio
        except Exception as e:
            print(f"❌ Error obteniendo medio: {e}")
            return None

    async def count_medios(self):
        """Contar total de medios"""
        try:
            return await self.db.medios.count_documents({})
        except Exception as e:
            print(f"❌ Error contando medios: {e}")
            return 0

    # ==================== BÚSQUEDA ====================

    async def search_medios(self, query: str = "", tipo: str = "", genero: str = ""):
        """Búsqueda avanzada de medios"""
        try:
            filtro = {}
            
            # Filtro por búsqueda de texto
            if query:
                filtro["$or"] = [
                    {"titulo": {"$regex": query, "$options": "i"}},
                    {"autor": {"$regex": query, "$options": "i"}},
                    {"genero": {"$regex": query, "$options": "i"}},
                    {"descripcion": {"$regex": query, "$options": "i"}},
                    {"tags": {"$regex": query, "$options": "i"}}
                ]
            
            # Filtro por tipo
            if tipo:
                filtro["tipo"] = tipo.lower()
            
            # Filtro por género
            if genero:
                filtro["genero"] = genero
            
            # Ejecutar búsqueda
            cursor = self.db.medios.find(filtro).limit(100)
            resultados = await cursor.to_list(length=100)
            
            return self._convertir_ids(resultados)
        except Exception as e:
            print(f"❌ Error en búsqueda: {e}")
            return []

    async def get_tipos(self):
        """Obtener todos los tipos únicos"""
        try:
            tipos = await self.db.medios.distinct("tipo")
            return tipos
        except Exception as e:
            print(f"❌ Error obteniendo tipos: {e}")
            return []

    async def get_generos(self):
        """Obtener todos los géneros únicos"""
        try:
            generos = await self.db.medios.distinct("genero")
            return generos
        except Exception as e:
            print(f"❌ Error obteniendo géneros: {e}")
            return []

    # ==================== CREACIÓN ====================

    async def insert_medio(self, data: dict):
        """Insertar un nuevo medio"""
        try:
            result = await self.db.medios.insert_one(data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"❌ Error insertando medio: {e}")
            raise

    # ==================== ACTUALIZACIÓN ====================

    async def update_medio(self, medio_id: str, data: dict):
        """Actualizar un medio existente"""
        try:
            result = await self.db.medios.update_one(
                {"_id": ObjectId(medio_id)},
                {"$set": data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error actualizando medio: {e}")
            return False

    # ==================== ELIMINACIÓN ====================

    async def delete_medio(self, medio_id: str):
        """Eliminar un medio"""
        try:
            result = await self.db.medios.delete_one({"_id": ObjectId(medio_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"❌ Error eliminando medio: {e}")
            return False

    # ==================== UTILIDADES ====================

    def _convertir_ids(self, documentos: list):
        """Convertir ObjectId a string en una lista de documentos"""
        for doc in documentos:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        return documentos

    async def get_estadisticas(self):
        """Obtener estadísticas de la BD"""
        try:
            return {
                "total_medios": await self.count_medios(),
                "tipos": await self.get_tipos(),
                "generos": await self.get_generos()
            }
        except Exception as e:
            print(f"❌ Error obteniendo estadísticas: {e}")
            return {}

# Instancia global para usar en main.py
db_manager = MongoManager()
