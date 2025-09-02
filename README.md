# FileToMarkdown

Una aplicación web para convertir archivos a formato Markdown utilizando inteligencia artificial.

## 🏗️ Estructura del Proyecto

El proyecto está organizado en dos servicios principales:

```
FileToMarkDown/
├── backend/          # API de Flask (Python)
├── frontend/         # Aplicación React (JavaScript)
├── InputFiles/       # Archivos de entrada
├── OutputFiles/      # Archivos procesados
└── docker-compose.yml
```

## 🚀 Despliegue con Docker

### Requisitos Previos
- Docker
- Docker Compose

### Despliegue Rápido

#### En Windows (PowerShell):
```powershell
.\deploy.ps1
```

#### En Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Despliegue Manual:
```bash
# Construir y levantar servicios
docker-compose up --build -d

# Ver estado de los servicios
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Acceso a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔧 Desarrollo Local

### Backend (Python/Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend (React/Vite)
```bash
cd frontend
yarn install
yarn dev
```

## 📁 Servicios

### Backend (`/backend`)
- **app.py**: API principal de Flask
- **file_to_md.py**: Lógica de conversión de archivos
- **consolidar_md.py**: Funcionalidad de consolidación
- **requirements.txt**: Dependencias de Python

### Frontend (`/frontend`)
- **src/**: Código fuente de React
- **package.json**: Dependencias de Node.js
- **vite.config.js**: Configuración de Vite
- **tailwind.config.js**: Configuración de Tailwind CSS

## 🐳 Docker

### Backend Container
- **Puerto**: 5000
- **Base**: Python 3.11-slim
- **Framework**: Flask

### Frontend Container
- **Puerto**: 3000
- **Base**: Nginx + Node.js 18
- **Framework**: React + Vite

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
INPUT_DIR=InputFiles
OUTPUT_DIR=OutputFiles
FLASK_ENV=production
FLASK_APP=app.py
```

## 🛠️ Comandos Útiles

```bash
# Detener servicios
docker-compose down

# Reconstruir servicios
docker-compose up --build

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar comandos en contenedores
docker-compose exec backend python -c "print('Hello from backend')"
docker-compose exec frontend ls -la
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Puertos ocupados**: Cambia los puertos en `docker-compose.yml`
2. **Permisos de archivos**: Asegúrate de que las carpetas `InputFiles` y `OutputFiles` tengan permisos de escritura
3. **Dependencias**: Si hay problemas con las dependencias, ejecuta `docker-compose build --no-cache`

### Logs y Debugging
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Acceder al shell de un contenedor
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 📚 Tecnologías Utilizadas

- **Backend**: Python, Flask, LlamaIndex
- **Frontend**: React, Vite, Tailwind CSS
- **Contenedores**: Docker, Docker Compose
- **Servidor Web**: Nginx
- **Gestión de Estado**: React Hooks
- **HTTP Client**: Axios

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles. 