import fitz  # PyMuPDF
import os
import sys

def pdf_to_markdown(pdf_path, output_path=None):
    # Verificar si el archivo existe
    if not os.path.exists(pdf_path):
        print(f"El archivo {pdf_path} no existe.")
        return

    # Obtener el nombre base del archivo sin la extensión
    file_name = os.path.splitext(os.path.basename(pdf_path))[0]

    # Establecer la ruta de salida
    if output_path:
        markdown_path = os.path.join(output_path, f"{file_name}.md")
    else:
        markdown_path = f"{file_name}.md"

    # Abrir el archivo PDF
    doc = fitz.open(pdf_path)

    # Extraer el contenido del PDF
    with open(markdown_path, 'w', encoding='utf-8') as md_file:
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            md_file.write(f"# Página {page_num + 1}\n\n")
            md_file.write(text)
            md_file.write("\n---\n")

    print(f"Conversión completa. El archivo se guardó como: {markdown_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python pdf_to_md.py ruta/al/archivo.pdf [ruta/de/salida]")
    else:
        pdf_file = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else None
        pdf_to_markdown(pdf_file, output_dir)
