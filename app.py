import os
import json
import threading
import time
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import file_to_md
import consolidar_md
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = os.getenv("INPUT_DIR", "InputFiles")
app.config['OUTPUT_FOLDER'] = os.getenv("OUTPUT_DIR", "OutputFiles")

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Global state for processing status
processing_status = {
    'is_processing': False,
    'current_file': None,
    'progress': 0,
    'total_files': 0,
    'processed_files': 0,
    'errors': [],
    'start_time': None,
    'end_time': None
}

# Supported file extensions
SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt', '.pptx', '.xlsx', '.epub'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in [ext[1:] for ext in SUPPORTED_EXTENSIONS]

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'FileToMarkdown API is running'})

@app.route('/api/files/upload', methods=['POST'])
def upload_file():
    """Upload file to InputFiles directory"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'File type not supported',
                'supported_types': list(SUPPORTED_EXTENSIONS)
            }), 400
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Check if file already exists
        if os.path.exists(file_path):
            return jsonify({'error': 'File already exists'}), 409
        
        file.save(file_path)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'size': os.path.getsize(file_path)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/list', methods=['GET'])
def list_files():
    """List all files in InputFiles and OutputFiles directories"""
    try:
        input_files = []
        output_files = []
        
        # List input files
        if os.path.exists(app.config['UPLOAD_FOLDER']):
            for filename in os.listdir(app.config['UPLOAD_FOLDER']):
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.isfile(file_path):
                    input_files.append({
                        'name': filename,
                        'size': os.path.getsize(file_path),
                        'modified': os.path.getmtime(file_path)
                    })
        
        # List output files
        if os.path.exists(app.config['OUTPUT_FOLDER']):
            for filename in os.listdir(app.config['OUTPUT_FOLDER']):
                if filename.endswith('.md'):
                    file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
                    if os.path.isfile(file_path):
                        output_files.append({
                            'name': filename,
                            'size': os.path.getsize(file_path),
                            'modified': os.path.getmtime(file_path)
                        })
        
        return jsonify({
            'input_files': sorted(input_files, key=lambda x: x['modified'], reverse=True),
            'output_files': sorted(output_files, key=lambda x: x['modified'], reverse=True)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete file from InputFiles directory"""
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        os.remove(file_path)
        
        return jsonify({'message': 'File deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process/start', methods=['POST'])
def start_processing():
    """Start processing files"""
    global processing_status
    
    if processing_status['is_processing']:
        return jsonify({'error': 'Processing already in progress'}), 409
    
    try:
        # Get list of files to process
        input_files = []
        if os.path.exists(app.config['UPLOAD_FOLDER']):
            for filename in os.listdir(app.config['UPLOAD_FOLDER']):
                if allowed_file(filename):
                    input_files.append(filename)
        
        if not input_files:
            return jsonify({'error': 'No files to process'}), 400
        
        # Start processing in background thread
        processing_status.update({
            'is_processing': True,
            'current_file': None,
            'progress': 0,
            'total_files': len(input_files),
            'processed_files': 0,
            'errors': [],
            'start_time': time.time(),
            'end_time': None
        })
        
        thread = threading.Thread(target=process_files_background, args=(input_files,))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'message': 'Processing started',
            'total_files': len(input_files)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process/status', methods=['GET'])
def get_processing_status():
    """Get current processing status"""
    return jsonify(processing_status)

@app.route('/api/process/consolidate', methods=['POST'])
def consolidate_files():
    """Consolidate all markdown files"""
    try:
        if processing_status['is_processing']:
            return jsonify({'error': 'Cannot consolidate while processing'}), 409
        
        # Run consolidation
        success = consolidar_md.consolidar_markdowns(
            app.config['OUTPUT_FOLDER'],
            os.path.join(app.config['OUTPUT_FOLDER'], 'Consolidated.md')
        )
        
        if success:
            return jsonify({'message': 'Files consolidated successfully'})
        else:
            return jsonify({'error': 'Consolidation failed'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download file from OutputFiles directory"""
    try:
        file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_files_background(input_files):
    """Process files in background thread"""
    global processing_status
    
    try:
        for i, filename in enumerate(input_files):
            if not processing_status['is_processing']:
                break
                
            processing_status['current_file'] = filename
            processing_status['progress'] = (i / len(input_files)) * 100
            
            try:
                # Process single file using file_to_md logic
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                # Import and run the processing logic
                documents = file_to_md.LlamaParse(
                    result_type="markdown",
                    auto_mode=True,
                    auto_mode_trigger_on_image_in_page=True,
                    auto_mode_trigger_on_table_in_page=True,
                ).load_data(file_path)
                
                # Generate output file path
                input_filename = os.path.splitext(filename)[0]
                output_filename = f"{input_filename}.md"
                output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
                
                # Combine all document content into markdown format
                markdown_content = ""
                for j, doc in enumerate(documents):
                    if j > 0:
                        markdown_content += "\n\n---\n\n"
                    markdown_content += doc.text
                
                # Write markdown content to output file
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(markdown_content)
                
                processing_status['processed_files'] += 1
                
            except Exception as e:
                processing_status['errors'].append({
                    'file': filename,
                    'error': str(e)
                })
            
            # Small delay to prevent overwhelming the system
            time.sleep(0.1)
        
        # Processing complete
        processing_status.update({
            'is_processing': False,
            'current_file': None,
            'progress': 100,
            'end_time': time.time()
        })
        
    except Exception as e:
        processing_status.update({
            'is_processing': False,
            'current_file': None,
            'errors': processing_status['errors'] + [{'file': 'system', 'error': str(e)}],
            'end_time': time.time()
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
