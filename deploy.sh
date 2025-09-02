#!/bin/bash

echo "🚀 Desplegando FileToMarkdown con Docker..."

# Detener contenedores existentes
echo "📦 Deteniendo contenedores existentes..."
docker-compose down

# Construir y levantar servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

echo "✅ Despliegue completado!"
echo "🌐 Frontend disponible en: http://localhost:3000"
echo "🔧 Backend disponible en: http://localhost:5000"
echo "📊 API Health Check: http://localhost:5000/api/health"
