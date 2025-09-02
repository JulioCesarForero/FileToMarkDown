Write-Host "🚀 Desplegando FileToMarkdown con Docker..." -ForegroundColor Green

# Detener contenedores existentes
Write-Host "📦 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Construir y levantar servicios
Write-Host "🔨 Construyendo y levantando servicios..." -ForegroundColor Yellow
docker-compose up --build -d

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar estado de los servicios
Write-Host "🔍 Verificando estado de los servicios..." -ForegroundColor Yellow
docker-compose ps

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host "🌐 Frontend disponible en: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend disponible en: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📊 API Health Check: http://localhost:5000/api/health" -ForegroundColor Cyan
