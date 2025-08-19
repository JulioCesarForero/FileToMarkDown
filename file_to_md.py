import nest_asyncio
import os
import time
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import VectorStoreIndex
from llama_index.core import Settings
from llama_cloud_services import LlamaParse
from copy import deepcopy
from llama_index.core.schema import TextNode

nest_asyncio.apply()

# Load environment variables
load_dotenv()

# API access to llama-cloud
os.environ["LLAMA_CLOUD_API_KEY"] = os.getenv("LLAMA_CLOUD_API_KEY", "llx-xxx")

# # Using OpenAI API for embeddings/llms
# os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "sk-proj-xxx")


# embed_model = OpenAIEmbedding(model="text-embedding-3-small")
# llm = OpenAI(model="gpt-4o-mini")

# Settings.llm = llm
# Settings.embed_model = embed_model


# Get directories from environment variables
input_dir = os.getenv("INPUT_DIR", "InputFiles")
output_dir = os.getenv("OUTPUT_DIR", "OutputFiles")
delay_between_files = int(os.getenv("DELAY_BETWEEN_FILES", "0"))

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

def get_supported_files(input_dir):
    """Get all supported files from input directory."""
    # Get all files from input directory
    supported_extensions = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.xlsx', '.epub']
    input_files = []

    if os.path.exists(input_dir):
        for filename in os.listdir(input_dir):
            file_path = os.path.join(input_dir, filename)
            if os.path.isfile(file_path):
                # Check if file has supported extension
                _, ext = os.path.splitext(filename)
                if ext.lower() in supported_extensions:
                    input_files.append(filename)
    
    return input_files

def get_page_nodes(docs, separator="\n---\n"):
    """Split each document into page node, by separator."""
    nodes = []
    for doc in docs:
        doc_chunks = doc.text.split(separator)
        for doc_chunk in doc_chunks:
            node = TextNode(
                text=doc_chunk,
                metadata=deepcopy(doc.metadata),
            )
            nodes.append(node)
    return nodes

def cleanup_empty_files(output_dir):
    """Remove files with 0 bytes from output directory."""
    cleaned_files = []
    if os.path.exists(output_dir):
        for filename in os.listdir(output_dir):
            file_path = os.path.join(output_dir, filename)
            if os.path.isfile(file_path) and os.path.getsize(file_path) == 0:
                try:
                    os.remove(file_path)
                    cleaned_files.append(filename)
                except Exception as e:
                    print(f"⚠️  No se pudo eliminar el archivo vacío {filename}: {e}")
    return cleaned_files

def is_rate_limit_error(error):
    """Check if the error is related to rate limiting (429 Too Many Requests)."""
    error_str = str(error).lower()
    return ("429" in error_str or 
            "too many requests" in error_str or 
            "rate limit" in error_str or
            "httperror" in error_str)

def wait_for_rate_limit_reset(wait_time=60):
    """Wait for rate limit to reset with user notification."""
    print(f"⏳ Esperando {wait_time} segundos para que se restablezca el límite de la API...")
    print("💡 Tip: Considera usar una API key diferente o esperar más tiempo entre procesamientos.")
    for i in range(wait_time, 0, -10):
        print(f"   Tiempo restante: {i} segundos...")
        time.sleep(10)
    print("✅ Continuando con el procesamiento...")

def process_files():
    """Main function to process all files in the input directory."""
    input_files = get_supported_files(input_dir)
    
    print(f"Archivos encontrados para procesar: {len(input_files)}")
    for file in input_files:
        print(f"  - {file}")

    if not input_files:
        print("❌ No se encontraron archivos para procesar.")
        return False

    # Process each file
    rate_limit_errors = 0
    max_rate_limit_errors = 3  # Stop after 3 consecutive rate limit errors
    consecutive_errors = 0
    successful_files = 0
    failed_files = []

    for i, input_file in enumerate(input_files, 1):
        print(f"\n{'='*60}")
        print(f"Procesando archivo {i}/{len(input_files)}: {input_file}")
        print(f"{'='*60}")
        
        try:
            file_path = os.path.join(input_dir, input_file)
            
            # Parse the document
            # https://docs.cloud.llamaindex.ai/llamaparse/presets_and_modes/auto_mode
            
            documents = LlamaParse(
                result_type="markdown",
                auto_mode=True,
                auto_mode_trigger_on_image_in_page=True,
                auto_mode_trigger_on_table_in_page=True,
            ).load_data(file_path)
            
            base_documents = LlamaParse(result_type="markdown").load_data(file_path)
            
            # Generate page nodes (if needed for other processing)
            page_nodes = get_page_nodes(documents)
            base_page_nodes = get_page_nodes(base_documents)
            
            # Generate output file path
            input_filename = os.path.splitext(input_file)[0]  # Get filename without extension
            output_filename = f"{input_filename}.md"
            output_path = os.path.join(output_dir, output_filename)
            
            # Combine all document content into markdown format
            markdown_content = ""
            for doc_idx, doc in enumerate(documents):
                if doc_idx > 0:
                    markdown_content += "\n\n---\n\n"  # Page separator
                markdown_content += doc.text
            
            # Write markdown content to output file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            # Verify file was created successfully and has content
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                print(f"✅ Archivo generado exitosamente: {output_filename}")
                successful_files += 1
                consecutive_errors = 0  # Reset consecutive error counter
            else:
                print(f"⚠️  Archivo creado pero está vacío: {output_filename}")
                failed_files.append(input_file)
                consecutive_errors += 1
            
        except Exception as e:
            error_message = str(e)
            print(f"❌ Error procesando {input_file}: {error_message}")
            failed_files.append(input_file)
            consecutive_errors += 1
            
            # Check if it's a rate limit error
            if is_rate_limit_error(e):
                rate_limit_errors += 1
                print(f"🚫 Error de límite de API detectado (Error #{rate_limit_errors})")
                
                if rate_limit_errors >= max_rate_limit_errors:
                    print(f"\n{'='*60}")
                    print("🛑 PROCESO DETENIDO")
                    print(f"{'='*60}")
                    print(f"❌ Se han detectado {rate_limit_errors} errores consecutivos de límite de API.")
                    print("💡 Recomendaciones:")
                    print("   1. Espera algunos minutos antes de volver a procesar")
                    print("   2. Considera usar una API key diferente")
                    print("   3. Reduce la cantidad de archivos a procesar por lote")
                    print("   4. Verifica tu plan de suscripción de Llama Cloud")
                    break
                else:
                    # Wait before continuing with next file
                    wait_for_rate_limit_reset(30)
            
            # Stop if too many consecutive errors
            if consecutive_errors >= 5:
                print(f"\n{'='*60}")
                print("🛑 PROCESO DETENIDO POR ERRORES CONSECUTIVOS")
                print(f"{'='*60}")
                print(f"❌ Se han producido {consecutive_errors} errores consecutivos.")
                print("💡 Revisa los archivos y la configuración antes de continuar.")
                break
            
            continue

        # Add delay between files if configured
        if delay_between_files > 0 and i < len(input_files):  # Don't delay after last file
            print(f"⏳ Esperando {delay_between_files} segundos antes del siguiente archivo...")
            time.sleep(delay_between_files)

    # Clean up empty files
    print(f"\n{'='*60}")
    print("🧹 Limpiando archivos vacíos...")
    print(f"{'='*60}")
    cleaned_files = cleanup_empty_files(output_dir)
    if cleaned_files:
        print(f"🗑️  Archivos vacíos eliminados: {len(cleaned_files)}")
        for file in cleaned_files:
            print(f"   - {file}")
    else:
        print("✅ No se encontraron archivos vacíos")

    print(f"\n{'='*60}")
    print("📊 RESUMEN DEL PROCESAMIENTO")
    print(f"{'='*60}")
    print(f"✅ Archivos procesados exitosamente: {successful_files}")
    print(f"❌ Archivos que fallaron: {len(failed_files)}")
    print(f"🚫 Errores de límite de API: {rate_limit_errors}")

    if failed_files:
        print(f"\n📋 Archivos que no se pudieron procesar:")
        for file in failed_files:
            print(f"   - {file}")

    if rate_limit_errors > 0:
        print(f"\n💡 RECOMENDACIONES:")
        print("   - Espera al menos 15-30 minutos antes del siguiente procesamiento")
        print("   - Considera procesar archivos en lotes más pequeños")
        print("   - Verifica tu plan de suscripción de Llama Cloud API")

    if successful_files > 0:
        print("🎉 Algunos archivos se procesaron exitosamente!")
        return True
    else:
        print("⚠️  No se pudo procesar ningún archivo completamente.")
        return False
        
    print(f"{'='*60}")


# Only execute if run directly, not when imported
if __name__ == "__main__":
    process_files()