// init-db.js
db = db.getSiblingDB('biblioteca_multimedia');

// --- Colección: usuarios ---
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "email", "password_hash", "rol", "fecha_registro"],
      properties: {
        nombre: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$" },
        password_hash: { bsonType: "string" },
        rol: { enum: ["administrador", "bibliotecario", "usuario"] },
        fecha_registro: { bsonType: "date" }
      }
    }
  }
});

// --- Colección: medios (La joya de la corona) ---
db.createCollection("medios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tipo", "titulo", "autor", "año_publicacion", "disponible", "metadatos"],
      properties: {
        tipo: { enum: ["libro", "audiolibro", "video", "musica"] },
        titulo: { bsonType: "string" },
        autor: { bsonType: "array", items: { bsonType: "string" } },
        genero: { bsonType: "array", items: { bsonType: "string" } },
        año_publicacion: { bsonType: "int", minimum: 1000 },
        descripcion: { bsonType: "string" },
        etiquetas: { bsonType: "array", items: { bsonType: "string" } },
        disponible: { bsonType: "bool" },
        // Aquí permitimos que metadatos sea un objeto flexible según el tipo
        metadatos: { 
          bsonType: "object",
          description: "Debe contener info específica (ej. resolucion para video, paginas para libro)"
        }
      }
    }
  }
});

// --- Índices ---
db.medios.createIndex(
  { titulo: "text", descripcion: "text", etiquetas: "text" },
  { weights: { titulo: 10, etiquetas: 5 } }
);
db.usuarios.createIndex({ email: 1 }, { unique: true });

// --- Datos de Ejemplo (Seed) ---
db.medios.insertMany([
  {
    tipo: "video",
    titulo: "Intro to Machine Learning",
    autor: ["Stanford University"],
    genero: ["Educativo"],
    año_publicacion: 2023,
    descripcion: "Curso fundamental",
    etiquetas: ["ai", "python"],
    disponible: true,
    metadatos: {
      resolucion: "1080p",
      formato: "MP4",
      duracion_segundos: 43200,
      url_stream: "/cdn/videos/ml-01.mp4"
    }
  },
  {
    tipo: "libro",
    titulo: "Cien años de soledad",
    autor: ["Gabriel García Márquez"],
    genero: ["Realismo Mágico"],
    año_publicacion: 1967,
    descripcion: "Saga familiar",
    etiquetas: ["latino", "clásico"],
    disponible: true,
    metadatos: {
      paginas: 417,
      isbn: "978-0307474728",
      idioma: "español"
    }
  }
]);