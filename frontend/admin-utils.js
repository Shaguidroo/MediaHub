// admin-utils.js - Utilidades para Admin Panel

const ADMIN_CONFIG = {
    API_URL: "http://localhost:8000",
    CACHE_TIME: 5 * 60 * 1000 // 5 minutos
};

class AdminUtils {
    // Llamadas a API
    static async fetchAPI(endpoint, options = {}) {
        try {
            const url = `${ADMIN_CONFIG.API_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en ${endpoint}:`, error);
            throw error;
        }
    }

    // POST - Crear medio
    static async crearMedio(datos) {
        // Procesar tags
        if (typeof datos.tags === 'string') {
            datos.tags = datos.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
        }

        return await this.fetchAPI('/api/medios', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    }

    // PUT - Actualizar medio
    static async actualizarMedio(id, datos) {
        if (typeof datos.tags === 'string') {
            datos.tags = datos.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
        }

        return await this.fetchAPI(`/api/medios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
    }

    // DELETE - Eliminar medio
    static async eliminarMedio(id) {
        return await this.fetchAPI(`/api/medios/${id}`, {
            method: 'DELETE'
        });
    }

    // GET - Obtener medios
    static async obtenerMedios(skip = 0, limit = 100) {
        return await this.fetchAPI(`/api/medios?skip=${skip}&limit=${limit}`);
    }

    // GET - Buscar
    static async buscar(q = '', tipo = '', genero = '') {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (tipo) params.append('tipo', tipo);
        if (genero) params.append('genero', genero);

        return await this.fetchAPI(`/api/buscar?${params}`);
    }

    // GET - Tipos
    static async obtenerTipos() {
        return await this.fetchAPI('/api/tipos');
    }

    // GET - Géneros
    static async obtenerGeneros() {
        return await this.fetchAPI('/api/generos');
    }

    // Toast notifications
    static mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duracion);
    }

    // Modal
    static abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    static cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Formatear fecha
    static formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // Exportar a JSON
    static exportarJSON(datos, nombre = 'export') {
        const json = JSON.stringify(datos, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombre}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Escapar HTML
    static escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    // Truncar texto
    static truncar(texto, longitud = 50) {
        if (!texto) return 'N/A';
        return texto.length > longitud 
            ? texto.substring(0, longitud) + '...' 
            : texto;
    }
}
