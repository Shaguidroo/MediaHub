// admin-app.js - Lógica principal del Admin Panel

class AdminApp {
    constructor() {
        this.currentView = 'dashboard';
        this.medioscache = [];
        this.estadisticas = {};

        this.setupDOM();
        this.setupEventListeners();
        this.cargarDatos();
    }

    setupDOM() {
        this.sidebarNav = document.querySelectorAll('.nav-item');
        this.views = document.querySelectorAll('.view');
        this.mediostbody = document.getElementById('medios-tbody');
        this.formCrear = document.getElementById('form-crear');
        this.formEditar = document.getElementById('form-editar');
        this.editModal = document.getElementById('edit-modal');
    }

    setupEventListeners() {
        // Navegación sidebar
        this.sidebarNav.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.cambiarVista(view);
            });
        });

        // Cerrar modal
        document.querySelector('.btn-close')?.addEventListener('click', () => {
            this.cerrarModal();
        });

        document.querySelector('.btn-cancel')?.addEventListener('click', () => {
            this.cerrarModal();
        });

        // Crear medio
        this.formCrear.addEventListener('submit', (e) => this.onCrearMedio(e));

        // Editar medio
        this.formEditar.addEventListener('submit', (e) => this.onEditarMedio(e));

        // Búsqueda de medios
        document.getElementById('medios-search')?.addEventListener('keyup', (e) => {
            this.buscarMedios(e.target.value);
        });

        // Botón refresh
        document.getElementById('btn-refresh')?.addEventListener('click', () => {
            this.cargarMedios();
        });

        // Exportar
        document.getElementById('btn-export')?.addEventListener('click', () => {
            this.exportarDatos();
        });

        // Limpiar cache
        document.getElementById('btn-clear-cache')?.addEventListener('click', () => {
            this.limpiarCache();
        });

        // Cerrar modal al hacer click afuera
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.cerrarModal();
            }
        });
    }

    // ==================== VISTAS ====================

    cambiarVista(nombreVista) {
        // Actualizar sidebar
        this.sidebarNav.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === nombreVista) {
                item.classList.add('active');
            }
        });

        // Mostrar vista
        this.views.forEach(view => {
            view.classList.remove('active');
        });

        const vista = document.getElementById(`${nombreVista}-view`);
        if (vista) {
            vista.classList.add('active');
        }

        this.currentView = nombreVista;

        // Cargar datos según la vista
        if (nombreVista === 'medios') {
            this.cargarMedios();
        } else if (nombreVista === 'reportes') {
            this.cargarReportes();
        } else if (nombreVista === 'configuracion') {
            this.verificarAPI();
        }
    }

    // ==================== DASHBOARD ====================

    async cargarDatos() {
        try {
            await this.cargarMedios();
            this.actualizarDashboard();
        } catch (error) {
            console.error('Error cargando datos:', error);
            AdminUtils.mostrarToast('Error al cargar datos', 'error');
        }
    }

    async cargarMedios() {
        try {
            const respuesta = await AdminUtils.obtenerMedios(0, 1000);
            this.medioscache = respuesta.medios || [];
            this.actualizarTabla();
            this.actualizarDashboard();
        } catch (error) {
            console.error('Error cargando medios:', error);
            AdminUtils.mostrarToast('Error al cargar medios', 'error');
        }
    }

    actualizarDashboard() {
        // Contar por tipo
        const stats = {
            total: this.medioscache.length,
            libro: this.medioscache.filter(m => m.tipo === 'libro').length,
            audiolibro: this.medioscache.filter(m => m.tipo === 'audiolibro').length,
            video: this.medioscache.filter(m => m.tipo === 'video').length,
            musica: this.medioscache.filter(m => m.tipo === 'musica').length,
            generos: new Set(this.medioscache.map(m => m.genero)).size
        };

        this.estadisticas = stats;

        // Actualizar cards
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-libros').textContent = stats.libro;
        document.getElementById('stat-audios').textContent = stats.audiolibro;
        document.getElementById('stat-videos').textContent = stats.video;
        document.getElementById('stat-musica').textContent = stats.musica;
        document.getElementById('stat-generos').textContent = stats.generos;

        // Gráfico
        this.actualizarGrafico();

        // Últimos medios
        this.actualizarRecientes();
    }

    actualizarGrafico() {
        const chartDiv = document.getElementById('tipo-chart');
        const stats = this.estadisticas;
        const max = Math.max(stats.libro, stats.audiolibro, stats.video, stats.musica);

        const html = `
            <div class="chart-item">
                <span class="chart-label">Libros</span>
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="width: ${(stats.libro / max) * 100}%"></div>
                </div>
                <span class="chart-value">${stats.libro}</span>
            </div>
            <div class="chart-item">
                <span class="chart-label">Audiolibros</span>
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="width: ${(stats.audiolibro / max) * 100}%"></div>
                </div>
                <span class="chart-value">${stats.audiolibro}</span>
            </div>
            <div class="chart-item">
                <span class="chart-label">Videos</span>
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="width: ${(stats.video / max) * 100}%"></div>
                </div>
                <span class="chart-value">${stats.video}</span>
            </div>
            <div class="chart-item">
                <span class="chart-label">Música</span>
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="width: ${(stats.musica / max) * 100}%"></div>
                </div>
                <span class="chart-value">${stats.musica}</span>
            </div>
        `;

        chartDiv.innerHTML = html;
    }

    actualizarRecientes() {
        const recentDiv = document.getElementById('recent-list');
        const recientes = this.medioscache.slice(0, 5);

        const html = recientes.map(m => `
            <div class="recent-item">
                <div class="recent-item-title">${AdminUtils.escaparHTML(m.titulo)}</div>
                <div class="recent-item-meta">${m.autor} • ${m.tipo}</div>
            </div>
        `).join('');

        recentDiv.innerHTML = html || '<p style="color: var(--text-secondary);">Sin medios aún</p>';
    }

    // ==================== TABLA DE MEDIOS ====================

    actualizarTabla() {
        const html = this.medioscache.map(m => `
            <tr>
                <td>${AdminUtils.escaparHTML(m._id.substring(0, 8))}</td>
                <td>${AdminUtils.truncar(m.titulo, 30)}</td>
                <td>${AdminUtils.truncar(m.autor, 20)}</td>
                <td><span class="tipo-badge">${m.tipo}</span></td>
                <td>${AdminUtils.escaparHTML(m.genero)}</td>
                <td>${m.año}</td>
                <td>${AdminUtils.formatearFecha(m.creado_en)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="admin.abrirEditModal('${m._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="admin.eliminarMedioConfirmacion('${m._id}', '${AdminUtils.escaparHTML(m.titulo)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.mediostbody.innerHTML = html || '<tr><td colspan="8">Sin medios</td></tr>';
    }

    buscarMedios(query) {
        if (!query) {
            this.actualizarTabla();
            return;
        }

        const resultados = this.medioscache.filter(m =>
            m.titulo.toLowerCase().includes(query.toLowerCase()) ||
            m.autor.toLowerCase().includes(query.toLowerCase()) ||
            m.genero.toLowerCase().includes(query.toLowerCase())
        );

        const html = resultados.map(m => `
            <tr>
                <td>${AdminUtils.escaparHTML(m._id.substring(0, 8))}</td>
                <td>${AdminUtils.truncar(m.titulo, 30)}</td>
                <td>${AdminUtils.truncar(m.autor, 20)}</td>
                <td><span class="tipo-badge">${m.tipo}</span></td>
                <td>${AdminUtils.escaparHTML(m.genero)}</td>
                <td>${m.año}</td>
                <td>${AdminUtils.formatearFecha(m.creado_en)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="admin.abrirEditModal('${m._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="admin.eliminarMedioConfirmacion('${m._id}', '${AdminUtils.escaparHTML(m.titulo)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.mediostbody.innerHTML = html || '<tr><td colspan="8">Sin resultados</td></tr>';
    }

    // ==================== FORMULARIOS ====================

    async onCrearMedio(e) {
        e.preventDefault();

        const formData = new FormData(this.formCrear);
        const datos = {
            titulo: formData.get('titulo'),
            autor: formData.get('autor'),
            tipo: formData.get('tipo'),
            genero: formData.get('genero') || 'General',
            año: parseInt(formData.get('año')) || new Date().getFullYear(),
            duracion: formData.get('duracion') || 'N/A',
            descripcion: formData.get('descripcion'),
            tags: formData.get('tags')
        };

        try {
            await AdminUtils.crearMedio(datos);
            AdminUtils.mostrarToast('Medio creado correctamente', 'success');
            this.formCrear.reset();
            await this.cargarMedios();
            this.cambiarVista('medios');
        } catch (error) {
            AdminUtils.mostrarToast('Error al crear medio', 'error');
            console.error(error);
        }
    }

    abrirEditModal(id) {
        const medio = this.medioscache.find(m => m._id === id);
        if (!medio) return;

        // Llenar form
        document.querySelector('input[name="_id"]').value = medio._id;
        document.querySelector('input[name="titulo"]').value = medio.titulo;
        document.querySelector('input[name="autor"]').value = medio.autor;
        document.querySelector('select[name="tipo"]').value = medio.tipo;
        document.querySelector('input[name="genero"]').value = medio.genero;
        document.querySelector('input[name="año"]').value = medio.año;
        document.querySelector('input[name="duracion"]').value = medio.duracion;
        document.querySelector('textarea[name="descripcion"]').value = medio.descripcion;
        document.querySelector('input[name="tags"]').value = Array.isArray(medio.tags) ? medio.tags.join(', ') : '';

        AdminUtils.abrirModal('edit-modal');
    }

    async onEditarMedio(e) {
        e.preventDefault();

        const id = document.querySelector('input[name="_id"]').value;
        const formData = new FormData(this.formEditar);

        const datos = {
            titulo: formData.get('titulo'),
            autor: formData.get('autor'),
            tipo: formData.get('tipo'),
            genero: formData.get('genero'),
            año: parseInt(formData.get('año')),
            duracion: formData.get('duracion'),
            descripcion: formData.get('descripcion'),
            tags: formData.get('tags')
        };

        try {
            await AdminUtils.actualizarMedio(id, datos);
            AdminUtils.mostrarToast('Medio actualizado correctamente', 'success');
            this.cerrarModal();
            await this.cargarMedios();
        } catch (error) {
            AdminUtils.mostrarToast('Error al actualizar medio', 'error');
            console.error(error);
        }
    }

    cerrarModal() {
        AdminUtils.cerrarModal('edit-modal');
        this.formEditar.reset();
    }

    async eliminarMedioConfirmacion(id, titulo) {
        if (!confirm(`¿Eliminar "${titulo}"?`)) return;

        try {
            await AdminUtils.eliminarMedio(id);
            AdminUtils.mostrarToast('Medio eliminado correctamente', 'success');
            await this.cargarMedios();
        } catch (error) {
            AdminUtils.mostrarToast('Error al eliminar medio', 'error');
            console.error(error);
        }
    }

    // ==================== REPORTES ====================

    async cargarReportes() {
        try {
            // Estadísticas
            const statsDetail = document.getElementById('stats-detail');
            statsDetail.innerHTML = `
                <p><strong>Total de Medios:</strong> ${this.estadisticas.total}</p>
                <p><strong>Géneros Únicos:</strong> ${this.estadisticas.generos}</p>
                <p><strong>Última Actualización:</strong> ${new Date().toLocaleString()}</p>
            `;

            // Géneros
            const generosSet = new Set(this.medioscache.map(m => m.genero));
            const generosDetail = document.getElementById('generos-detail');
            generosDetail.innerHTML = Array.from(generosSet)
                .map(g => {
                    const count = this.medioscache.filter(m => m.genero === g).length;
                    return `<p>${g}: <strong>${count}</strong> medios</p>`;
                })
                .join('');
        } catch (error) {
            console.error('Error en reportes:', error);
        }
    }

    // ==================== CONFIGURACIÓN ====================

    verificarAPI() {
        const statusDiv = document.getElementById('api-status');
        AdminUtils.fetchAPI('/health')
            .then(() => {
                statusDiv.innerHTML = '<p style="color: var(--success);">✅ Estado: Conectado</p>';
            })
            .catch(() => {
                statusDiv.innerHTML = '<p style="color: var(--danger);">❌ Estado: Desconectado</p>';
            });
    }

    exportarDatos() {
        AdminUtils.exportarJSON(this.medioscache, 'medios');
        AdminUtils.mostrarToast('Datos exportados correctamente', 'success');
    }

    limpiarCache() {
        localStorage.clear();
        AdminUtils.mostrarToast('Cache limpiado', 'success');
    }
}

// Inicializar
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminApp();
});
