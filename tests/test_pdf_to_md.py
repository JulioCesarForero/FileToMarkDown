import unittest
import os
from src.pdf_to_md import pdf_to_markdown

class TestPdfToMarkdown(unittest.TestCase):

    def test_pdf_to_markdown(self):
        pdf_path = 'tests/test_files/sample.pdf'
        output_path = 'tests/output'
        if not os.path.exists(output_path):
            os.makedirs(output_path)
        pdf_to_markdown(pdf_path, output_path)
        md_file = os.path.join(output_path, 'sample.md')
        self.assertTrue(os.path.exists(md_file))

if __name__ == '__main__':
    unittest.main()
