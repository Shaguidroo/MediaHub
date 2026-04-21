// app.js - Lógica principal de la aplicación

class MediaHub {
    constructor() {
        this.currentFilter = "todos";
        this.currentSort = "reciente";
        this.allResults = [];
        this.isLoading = false;

        this.setupDOM();
        this.setupEventListeners();
        this.loadData();
    }

    // Obtener referencias a elementos del DOM
    setupDOM() {
        this.searchInput = document.getElementById("searchInput");
        this.resultsContainer = document.getElementById("resultados");
        this.filterContainer = document.getElementById("filterContainer");
    }

    // Configurar listeners de eventos
    setupEventListeners() {
        // Búsqueda
        this.searchInput.addEventListener("keyup", (e) => this.onSearch(e.target.value));
        this.searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.onSearch(e.target.value);
        });

        // Filtros
        this.filterContainer.querySelectorAll(".filter-tag").forEach(btn => {
            btn.addEventListener("click", (e) => this.onFilterChange(e.target));
        });

        // Ordenamiento
        document.querySelectorAll(".sort-btn").forEach(btn => {
            btn.addEventListener("click", (e) => this.onSortChange(e.target));
        });
    }

    // Cargar datos iniciales
    async loadData() {
        try {
            Utils.mostrarCargando(this.resultsContainer);
            const data = await Utils.fetchAPI(API_CONFIG.ENDPOINTS.MEDIOS);
            this.allResults = data.medios || [];
            this.mostrarResultados(this.allResults);
        } catch (error) {
            Utils.mostrarError(this.resultsContainer, "No se pudieron cargar los datos");
            console.error(error);
        }
    }

    // Evento: búsqueda
    onSearch(query) {
        this.filtrarYMostrar(query);
    }

    // Evento: cambio de filtro
    onFilterChange(elemento) {
        document.querySelectorAll(".filter-tag").forEach(e => e.classList.remove("active"));
        elemento.classList.add("active");
        this.currentFilter = elemento.dataset.filter;
        this.filtrarYMostrar();
    }

    // Evento: cambio de ordenamiento
    onSortChange(elemento) {
        document.querySelectorAll(".sort-btn").forEach(e => e.classList.remove("active"));
        elemento.classList.add("active");
        this.currentSort = elemento.dataset.sort;
        this.filtrarYMostrar();
    }

    // Filtrar y mostrar resultados
    filtrarYMostrar(query = "") {
        let resultados = [...this.allResults];

        // Filtrar por tipo
        if (this.currentFilter !== "todos") {
            resultados = resultados.filter(item => item.tipo === this.currentFilter);
        }

        // Filtrar por búsqueda
        if (query) {
            resultados = resultados.filter(item =>
                this.coincide(item.titulo, query) ||
                this.coincide(item.autor, query) ||
                this.coincide(item.genero, query) ||
                (Array.isArray(item.tags) && item.tags.some(tag => this.coincide(tag, query)))
            );
        }

        // Ordenar
        resultados = this.ordenar(resultados);

        this.mostrarResultados(resultados);
    }

    // Verificar si una cadena coincide con la búsqueda (case-insensitive)
    coincide(texto, query) {
        if (!texto) return false;
        return texto.toString().toLowerCase().includes(query.toLowerCase());
    }

    // Ordenar resultados
    ordenar(resultados) {
        const copia = [...resultados];

        switch (this.currentSort) {
            case "titulo":
                return copia.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
            case "autor":
                return copia.sort((a, b) => (a.autor || "").localeCompare(b.autor || ""));
            case "reciente":
            default:
                return copia.sort((a, b) => (b.año || 0) - (a.año || 0));
        }
    }

    // Mostrar resultados en la página
    mostrarResultados(resultados) {
        if (resultados.length === 0) {
            Utils.mostrarVacio(this.resultsContainer);
            return;
        }

        this.resultsContainer.innerHTML = resultados
            .map((item, index) => Utils.crearTarjetaHTML(item, index))
            .join("");
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    new MediaHub();
});
