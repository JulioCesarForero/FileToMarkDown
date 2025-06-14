import nest_asyncio
import os
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

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

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

print(f"Archivos encontrados para procesar: {len(input_files)}")
for file in input_files:
    print(f"  - {file}")

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

# Process each file
for input_file in input_files:
    print(f"\n{'='*60}")
    print(f"Procesando: {input_file}")
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
        for i, doc in enumerate(documents):
            if i > 0:
                markdown_content += "\n\n---\n\n"  # Page separator
            markdown_content += doc.text
        
        # Write markdown content to output file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"✅ Archivo generado exitosamente: {output_filename}")
        
    except Exception as e:
        print(f"❌ Error procesando {input_file}: {str(e)}")
        continue

print(f"\n{'='*60}")
print("🎉 Procesamiento completado!")
print(f"{'='*60}")