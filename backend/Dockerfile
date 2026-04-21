# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /tmp

# Instalar dependencias del sistema necesarias para compilar
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Crear directorio para wheels
RUN pip install --user --no-cache-dir -r requirements.txt


# Stage 2: Runtime (imagen final más pequeña)
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias de sistema necesarias en runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar Python packages desde builder
COPY --from=builder /root/.local /root/.local

# Actualizar PATH
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Copiar aplicación
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
