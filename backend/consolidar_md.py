import os
import re

directorio_entrada = os.getenv("OUTPUT_DIR", "OutputFiles")
archivo_salida = os.getenv("CONSOLIDATED_DIR", "Consolidated.md")


def natural_sort_key(text):
    """
    Función para generar una clave de ordenamiento natural que maneja números correctamente
    Convierte '10_archivo.txt' para que se ordene después de '2_archivo.txt'
    """
    def convert(text_part):
        if text_part.isdigit():
            return int(text_part)
        return text_part.lower()
    
    # Divide el texto en partes numéricas y de texto
    return [convert(c) for c in re.split('([0-9]+)', text)]


def consolidar_markdowns(directorio_entrada, archivo_salida):
    # Verificar que el directorio de entrada existe
    if not os.path.exists(directorio_entrada):
        print(f"❌ Error: El directorio '{directorio_entrada}' no existe.")
        return False
    
    # Crear el directorio padre del archivo de salida si no existe
    directorio_salida = os.path.dirname(archivo_salida)
    if directorio_salida and not os.path.exists(directorio_salida):
        os.makedirs(directorio_salida)
    
    # Buscar archivos .md en el directorio y ordenarlos naturalmente
    archivos_md = [
        f for f in os.listdir(directorio_entrada)
        if f.endswith('.md')
    ]
    
    # Aplicar ordenamiento natural para manejar números correctamente
    archivos_md.sort(key=natural_sort_key)
    
    if not archivos_md:
        print(f"⚠️  No se encontraron archivos .md en '{directorio_entrada}'")
        return False

    print(f"📝 Consolidando {len(archivos_md)} archivos .md en orden natural...")
    print("📋 Orden de procesamiento:")
    for i, archivo in enumerate(archivos_md, 1):
        print(f"  {i}. {archivo}")
    
    try:
        with open(archivo_salida, 'w', encoding='utf-8') as salida:
            salida.write("# Archivos Consolidados\n\n")
            salida.write(f"*Consolidación de {len(archivos_md)} archivos markdown*\n\n")
            
            for i, archivo in enumerate(archivos_md, 1):
                ruta_completa = os.path.join(directorio_entrada, archivo)
                try:
                    with open(ruta_completa, 'r', encoding='utf-8') as f:
                        contenido = f.read()
                    
                    print(f"  {i}/{len(archivos_md)}: {archivo}")
                    salida.write(f"\n---\n\n## {archivo}\n\n")
                    salida.write(contenido)
                    if not contenido.endswith('\n'):
                        salida.write('\n')
                    salida.write(f"\n\n*--- Fin de {archivo} ---*\n")
                    
                except Exception as e:
                    print(f"⚠️  Error al leer {archivo}: {e}")
                    continue

        print(f"✅ Consolidación completa. Archivo generado: {archivo_salida}")
        return True
        
    except Exception as e:
        print(f"❌ Error al escribir el archivo de salida: {e}")
        return False


if __name__ == "__main__":
    print("🔄 Iniciando consolidación de archivos Markdown...")
    print(f"📂 Directorio de entrada: {directorio_entrada}")
    print(f"📄 Archivo de salida: {archivo_salida}")
    
    exito = consolidar_markdowns(directorio_entrada, archivo_salida)
    
    if exito:
        print("🎉 Proceso completado exitosamente!")
    else:
        print("❌ El proceso no se completó correctamente.")
        exit(1)

