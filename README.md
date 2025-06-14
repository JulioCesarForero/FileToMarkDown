# Conversor de Archivos a Markdown

Este proyecto permite convertir múltiples tipos de archivos a formato Markdown (.md) y consolidarlos en un archivo único. Utiliza **LlamaParse** de LlamaIndex para extraer y convertir el contenido de los documentos con alta precisión.

## 🚀 Características

- **Conversión multi-formato**: Soporta PDF, DOCX, DOC, TXT, PPTX, XLSX y EPUB
- **Procesamiento inteligente**: Usa LlamaParse con modo automático para detectar imágenes y tablas
- **Consolidación automática**: Combina todos los archivos .md generados en un archivo único
- **Configuración flexible**: Uso de variables de entorno para personalizar directorios
- **Manejo robusto de errores**: Continúa procesando aunque algunos archivos fallen

## 📋 Requisitos

- Python 3.8 o superior
- Cuenta en [LlamaCloud](https://cloud.llamaindex.ai/) para obtener API key
- Entorno virtual (recomendado)

## 🛠️ Instalación

1. **Clona el repositorio**:
   ```bash
   git clone git@github.com:JulioCesarForero/FileToMarkDown.git
   cd FileToMarkDown
   ```

2. **Crea y activa un entorno virtual**:
   ```bash
   # Crear entorno virtual
   python -m venv venv
   
   # Activar entorno virtual
   # En Windows:
   venv\Scripts\activate
   
   # En Linux/macOS:
   source venv/bin/activate
   ```

3. **Instala las dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configura las variables de entorno**:
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   # API Key obligatoria para LlamaParse
   LLAMA_CLOUD_API_KEY=llx-tu-api-key-aqui
   
   # Opcional: API Key de OpenAI (si planeas usar embeddings/LLMs)
   OPENAI_API_KEY=sk-proj-tu-api-key-aqui
   
   # Directorios personalizados (opcional)
   INPUT_DIR=InputFiles
   OUTPUT_DIR=OutputFiles
   CONSOLIDATED_DIR=Consolidated.md
   ```

## 📁 Estructura del Proyecto

```
FileToMarkDown/
├── InputFiles/          # Archivos de entrada (PDF, DOCX, etc.)
├── OutputFiles/         # Archivos .md generados
├── file_to_md.py       # Programa principal de conversión
├── consolidar_md.py    # Programa de consolidación
├── requirements.txt    # Dependencias del proyecto
├── .env               # Variables de entorno (crear)
└── README.md          # Este archivo
```

## 🔧 Uso

### Paso 1: Conversión de archivos

1. **Coloca tus archivos** en la carpeta `InputFiles/`
   - Formatos soportados: `.pdf`, `.docx`, `.doc`, `.txt`, `.pptx`, `.xlsx`, `.epub`

2. **Ejecuta la conversión**:
   ```bash
   python file_to_md.py
   ```

   El programa:
   - Buscará automáticamente todos los archivos soportados en `InputFiles/`
   - Convertirá cada archivo a formato Markdown
   - Guardará los resultados en `OutputFiles/`

### Paso 2: Consolidación (opcional)

Si quieres combinar todos los archivos .md en uno solo:

```bash
python consolidar_md.py
```

Esto creará un archivo `Consolidated.md` con todos los archivos markdown combinados.

## ⚙️ Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `LLAMA_CLOUD_API_KEY` | API Key de LlamaCloud (obligatoria) | `llx-xxx` |
| `OPENAI_API_KEY` | API Key de OpenAI (opcional) | `sk-proj-xxx` |
| `INPUT_DIR` | Directorio de archivos de entrada | `InputFiles` |
| `OUTPUT_DIR` | Directorio de archivos de salida | `OutputFiles` |
| `CONSOLIDATED_DIR` | Archivo consolidado de salida | `Consolidated.md` |

### Ejemplo con directorios personalizados:

```bash
# Windows
set INPUT_DIR=MisDocumentos
set OUTPUT_DIR=ResultadosMarkdown python file_to_md.py

# Linux/macOS
INPUT_DIR=MisDocumentos OUTPUT_DIR=ResultadosMarkdown python file_to_md.py
```

## 🔍 Funcionalidades Técnicas

Todo basado en la documentacion oficial de:  
https://docs.cloud.llamaindex.ai/llamaparse/presets_and_modes/auto_mode

### LlamaParse - Modo Automático
- **Detección automática**: Identifica imágenes y tablas en los documentos
- **Conversión inteligente**: Mantiene la estructura y formato original
- **Múltiples formatos**: Soporte nativo para diversos tipos de archivo

### Procesamiento por Páginas
- Cada documento se divide en nodos por página
- Separadores personalizables (`\n---\n`)
- Preservación de metadatos

## 🚨 Solución de Problemas

### Error: "API Key no válida"
- Verifica que tu `LLAMA_CLOUD_API_KEY` esté correctamente configurada
- Asegúrate de que la API key sea válida en [LlamaCloud](https://cloud.llamaindex.ai/)

### Error: "Directorio no encontrado"
- Crea la carpeta `InputFiles/` si no existe
- Verifica que los archivos estén en el directorio correcto

### Archivos no procesados
- Confirma que el formato del archivo esté en la lista de soportados
- Revisa que el archivo no esté corrupto o protegido

## 📦 Generar requirements.txt

Si necesitas regenerar el archivo de dependencias:

```bash
# Instalar pipreqs
pip install pipreqs

# Generar requirements.txt
pipreqs . --force
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [LlamaIndex](https://www.llamaindex.ai/) por la excelente librería de procesamiento de documentos
- [LlamaParse](https://docs.cloud.llamaindex.ai/llamaparse) por el servicio de parsing inteligente