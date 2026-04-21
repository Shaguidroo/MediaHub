// config.js - Configuración de la API

const API_CONFIG = {
    BASE_URL: "http://localhost:8000",
    ENDPOINTS: {
        MEDIOS: "/api/medios",
        BUSCAR: "/api/buscar",
        TIPOS: "/api/tipos",
        GENEROS: "/api/generos"
    },
    TIMEOUT: 5000
};

// utils.js - Funciones utilitarias

class Utils {
    // Hacer llamadas a la API
    static async fetchAPI(endpoint, params = {}) {
        try {
            const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
            
            // Agregar parámetros query
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== "") {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error en ${endpoint}:`, error);
            throw error;
        }
    }

    // Convertir tipo a icono
    static getTipoIcon(tipo) {
        const iconos = {
            libro: "book",
            audiolibro: "headphones",
            video: "film",
            musica: "music"
        };
        return iconos[tipo] || "file";
    }

    // Convertir tipo a etiqueta legible
    static getTipoLabel(tipo) {
        const labels = {
            libro: "Libro",
            audiolibro: "Audiolibro",
            video: "Video",
            musica: "Música"
        };
        return labels[tipo] || tipo;
    }

    // Formatear duración
    static formatDuracion(duracion) {
        return duracion || "N/A";
    }

    // Obtener primeras etiquetas (máximo 2)
    static getEtiquetas(tags = []) {
        return Array.isArray(tags) ? tags.slice(0, 2) : [];
    }

    // Crear elemento HTML para tarjeta
    static crearTarjetaHTML(medio, index) {
        const etiquetas = this.getEtiquetas(medio.tags);
        const tipo = this.getTipoLabel(medio.tipo);
        const icono = this.getTipoIcon(medio.tipo);

        return `
            <div class="media-card" style="animation-delay: ${index * 0.05}s">
                <div class="media-thumbnail">
                    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-${icono}" style="font-size: 60px; opacity: 0.3;"></i>
                    </div>
                    <span class="media-type">${tipo}</span>
                    <div class="play-icon">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="media-info">
                    <div class="media-title">${this.escaparHTML(medio.titulo)}</div>
                    <div class="media-author">${this.escaparHTML(medio.autor)}</div>
                    <div class="media-meta">
                        <span><i class="fas fa-tag"></i> ${this.escaparHTML(medio.genero)}</span>
                        <span><i class="fas fa-clock"></i> ${this.escaparHTML(medio.duracion)}</span>
                    </div>
                    <div class="media-tags">
                        ${etiquetas.map(tag => `<span class="tag">${this.escaparHTML(tag)}</span>`).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    // Escapar caracteres especiales HTML (seguridad)
    static escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    // Mostrar estado vacío
    static mostrarVacio(elemento) {
        elemento.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Sin resultados</h3>
                <p>Intenta buscar con otros términos o selecciona una categoría diferente</p>
            </div>
        `;
    }

    // Mostrar error
    static mostrarError(elemento, mensaje) {
        elemento.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error</h3>
                <p>${this.escaparHTML(mensaje)}</p>
            </div>
        `;
    }

    // Mostrar cargando
    static mostrarCargando(elemento) {
        elemento.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
    }
}
