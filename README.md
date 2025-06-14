# Conversor de PDF a Markdown

Este proyecto permite convertir archivos PDF a formato Markdown (.md) utilizando Python y la librería PyMuPDF.

## Requisitos

- Python 3.6 o superior
- Entorno virtual (recomendado)
- Dependencias listadas en `requirements.txt`

## Instalación

1. Clona el repositorio:

    ```bash
    git clone git@github.com:JulioCesarForero/FileToMarkDown.git
    ```
2. Navega al directorio del proyecto:

    ```bash
    cd tu_proyecto
    ```
3. Crea y activa un entorno virtual:

    Crea el entorno virtual 

    ```bash
    python -m venv venv
    ```
    
    Activar el virtual environment
    ```bash
    venv\Scripts\activate  # En Windows
    ```

    ```bash
    source venv/bin/activate  # En Linux/WSL
    ```

4. Instala las dependencias:

    ```bash
    pip install -r requirements.txt
    ```

5. Se deben guardar los archivos a convertir en la carpeta *InputFiles*

6. Ejecutar el programa 


---

### Instalas pipreqs

```bash
pip install pipreqs
```
Luego ejecutas:
```bash
pipreqs /ruta/a/tu/proyecto --force
```
Esto genera un requirements.txt basado en las importaciones reales encontradas en tus archivos .py.