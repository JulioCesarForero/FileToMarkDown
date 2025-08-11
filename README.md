# FileToMarkdown - Conversor de Archivos a Markdown

Una aplicación web completa para convertir diversos tipos de archivos a formato Markdown utilizando la API de LlamaCloud.

## 🚀 Características

- **Interfaz Web Moderna**: Aplicación React con diseño responsive y UX intuitiva
- **Carga de Archivos**: Drag & drop para subir archivos a procesar
- **Procesamiento en Tiempo Real**: Monitoreo del estado del procesamiento con barra de progreso
- **Múltiples Formatos**: Soporta PDF, DOCX, DOC, TXT, PPTX, XLSX, EPUB
- **Descarga Directa**: Descarga de archivos procesados desde la interfaz web
- **Consolidación**: Opción para consolidar todos los archivos markdown en uno solo
- **API REST**: Backend Flask con endpoints bien documentados

## 🏗️ Arquitectura

### Backend (Flask)
- **API REST**: Endpoints para gestión de archivos y procesamiento
- **Procesamiento Asíncrono**: Manejo de archivos en segundo plano
- **Validación**: Verificación de tipos de archivo y tamaños
- **Estado en Tiempo Real**: Monitoreo del progreso del procesamiento

### Frontend (React + Vite)
- **SPA**: Single Page Application con navegación fluida
- **Vite**: Build tool moderno para desarrollo rápido
- **React 18.3.1**: Versión más reciente con mejoras de rendimiento
- **Componentes Modulares**: Arquitectura limpia y reutilizable (.jsx)
- **Estado Reactivo**: Gestión eficiente del estado de la aplicación
- **Diseño Responsive**: Adaptable a diferentes tamaños de pantalla
- **ESLint 9.17**: Linting moderno con flat config
- **Tailwind CSS 3.4**: Framework CSS utilitario

## 📋 Requisitos

- Python 3.8+
- Node.js 18+ (recomendado v22.17.0)
- npm 10+ o Yarn 1.22+
- API Key de LlamaCloud

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd FileToMarkDown
```

### 2. Configurar el entorno Python
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env_example.txt .env

# Editar .env con tus credenciales
LLAMA_CLOUD_API_KEY=tu-api-key-aqui
INPUT_DIR=./InputFiles
OUTPUT_DIR=./OutputFiles
CONSOLIDATED_DIR=./Consolidated
```

### 4. Configurar el frontend
```bash
cd frontend

# Instalar dependencias (recomendado: usar Yarn)
yarn install
# o con npm
npm install

# Construir para producción (opcional)
yarn build
# o con npm
npm run build
```

## 🚀 Uso

### Iniciar el Backend
```bash
# Desde el directorio raíz
python app.py
```

El servidor Flask estará disponible en `http://localhost:5000`

### Iniciar el Frontend
```bash
cd frontend

# Modo desarrollo (recomendado: usar Yarn)
yarn dev
# o con npm
npm run dev
```

La aplicación React estará disponible en `http://localhost:5173`

### 🚀 Inicio Rápido (Ambos Servicios)
```bash
# Desde el directorio raíz
python start_app.py
```

Este script iniciará automáticamente tanto el backend como el frontend.

## 📁 Estructura del Proyecto

```
FileToMarkDown/
├── app.py                 # Servidor Flask principal
├── file_to_md.py         # Lógica de procesamiento de archivos
├── consolidar_md.py      # Lógica de consolidación
├── requirements.txt      # Dependencias de Python
├── .env                 # Variables de entorno (crear desde env_example.txt)
├── InputFiles/          # Directorio de archivos a procesar
├── OutputFiles/         # Directorio de archivos procesados
├── frontend/            # Aplicación React + Vite
│   ├── src/
│   │   ├── components/  # Componentes React (.jsx)
│   │   ├── services/    # Servicios de API
│   │   ├── App.jsx      # Componente principal
│   │   └── main.jsx     # Punto de entrada
│   ├── index.html       # Template HTML principal
│   ├── vite.config.js   # Configuración de Vite
│   ├── eslint.config.js # Configuración ESLint moderna
│   ├── tailwind.config.js # Configuración Tailwind CSS
│   └── package.json     # Dependencias de Node.js
└── README.md            # Este archivo
```

## 🔌 API Endpoints

### Archivos
- `GET /api/files/list` - Listar archivos de entrada y salida
- `POST /api/files/upload` - Subir archivo para procesar
- `DELETE /api/files/delete/{filename}` - Eliminar archivo de entrada
- `GET /api/files/download/{filename}` - Descargar archivo procesado

### Procesamiento
- `POST /api/process/start` - Iniciar procesamiento de archivos
- `GET /api/process/status` - Obtener estado del procesamiento
- `POST /api/process/consolidate` - Consolidar archivos markdown

### Sistema
- `GET /api/health` - Verificar estado del API

## 🎯 Flujo de Trabajo

1. **Subir Archivos**: Arrastra y suelta archivos en la interfaz web
2. **Procesar**: Haz clic en "Iniciar Procesamiento" para convertir los archivos
3. **Monitorear**: Observa el progreso en tiempo real
4. **Descargar**: Descarga los archivos markdown procesados
5. **Consolidar**: Opcionalmente, consolida todos los archivos en uno solo

## 🎨 Características de la UI

- **Drag & Drop**: Interfaz intuitiva para carga de archivos
- **Barra de Progreso**: Visualización del estado del procesamiento
- **Notificaciones**: Alertas de éxito y error
- **Diseño Responsive**: Funciona en dispositivos móviles y de escritorio
- **Temas de Color**: Indicadores visuales para diferentes estados
- **Iconos Intuitivos**: Uso de Lucide React para mejor UX

## 🔧 Configuración Avanzada

### Variables de Entorno Adicionales
```bash
# Tamaño máximo de archivo (por defecto: 100MB)
MAX_FILE_SIZE=104857600

# Puerto del servidor Flask (por defecto: 5000)
FLASK_PORT=5000

# Modo debug (por defecto: true en desarrollo)
FLASK_DEBUG=true
```

### Personalización del Frontend
```bash
# Cambiar puerto del frontend
echo "PORT=3001" > frontend/.env

# Configurar proxy para diferentes backends
echo "REACT_APP_API_URL=http://localhost:5001/api" > frontend/.env
```

## 🐛 Solución de Problemas

### Error de Conexión al API
- Verifica que el servidor Flask esté ejecutándose
- Confirma que las variables de entorno estén configuradas correctamente
- Revisa los logs del servidor para errores específicos

### Problemas de Procesamiento
- Asegúrate de que tu API key de LlamaCloud sea válida
- Verifica que los archivos no excedan el tamaño máximo
- Revisa que los formatos de archivo sean soportados

### Problemas del Frontend
- Limpia la caché del navegador
- Verifica que todas las dependencias estén instaladas
- Revisa la consola del navegador para errores JavaScript

## 🔧 Tecnologías Modernas Utilizadas

### Frontend
- **React 18.3.1**: Framework de JavaScript con las últimas mejoras de rendimiento
- **Vite 6.3.5**: Build tool ultra-rápido para desarrollo y producción
- **ESLint 9.17.0**: Linter moderno con configuración flat config
- **Tailwind CSS 3.4.17**: Framework CSS utilitario para diseño rápido
- **Axios 1.7.9**: Cliente HTTP moderno para peticiones API
- **Lucide React 0.468.0**: Iconos SVG optimizados para React

### Backend
- **Flask 3.0.0**: Framework web Python minimalista y potente
- **Flask-CORS 4.0.0**: Manejo de CORS para APIs
- **LlamaCloud API**: Servicio de IA para procesamiento de documentos

### Herramientas de Desarrollo
- **Node.js v22.17.0**: Runtime de JavaScript de última generación
- **Yarn 1.22.22**: Gestor de paquetes rápido y confiable
- **Hot Module Replacement**: Recarga en caliente para desarrollo
- **Tree Shaking**: Optimización automática del bundle
- **Code Splitting**: Carga perezosa de componentes

### Optimizaciones
- **Proxy de desarrollo**: Configuración automática para desarrollo local
- **Sourcemaps**: Debugging mejorado en producción
- **Manual Chunks**: Optimización del tamaño de bundle
- **JSX Automático**: Sintaxis JSX moderna sin imports explícitos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [LlamaCloud](https://cloud.llamaindex.ai/) por la API de procesamiento de documentos
- [React](https://reactjs.org/) por el framework de frontend
- [Flask](https://flask.palletsprojects.com/) por el framework de backend
- [Tailwind CSS](https://tailwindcss.com/) por el framework de CSS
- [Lucide React](https://lucide.dev/) por los iconos

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**Desarrollado con ❤️ para simplificar la conversión de archivos a Markdown**
Este proyecto surge justamente de la necesidad de procesar archivos para que modelos de LLM y IAG puedan tener una interpretacion más eficiente del contexto que se les entrega. 
En mi experiencia ha sido de gran utilidad y ha mejorado mucho la experiencia de documentar en la WIKI de proyectos y de brindar contexto y generar nuevas ideas y productos combinando distintas herramientas y soluciones. 
Espero te sea tan util como lo ha sido para mi. :) 