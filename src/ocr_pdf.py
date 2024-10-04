import pytesseract
from PIL import Image
import pdf2image

# Ruta del archivo PDF
pdf_path = "docs/1032380.pdf"

# Convertir PDF a imágenes
pages = pdf2image.convert_from_path(pdf_path)

# Inicializar la variable para almacenar el texto extraído
ocr_text = ""

# Procesar cada página con OCR
for i, page in enumerate(pages):
    # Convertir cada página a texto usando OCR
    page_text = pytesseract.image_to_string(page, lang='spa')
    ocr_text += f"### Página {i+1}\n\n{page_text}\n\n"

# Guardar el texto consolidado en un archivo Markdown
with open("1032380_ocr.md", "w") as ocr_mdf_file:
    ocr_mdf_file.write(ocr_text)
