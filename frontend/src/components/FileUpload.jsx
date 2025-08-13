import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { fileAPI } from '../services/api';

const FileUpload = ({ onFileUploaded, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      addFiles(filesArray);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      addFiles(filesArray);
    }
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const supportedFormats = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.xlsx', '.epub'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      return supportedFormats.includes(fileExtension) && file.size <= 100 * 1024 * 1024; // 100MB max
    });

    setSelectedFiles(prev => {
      const existing = prev.map(f => f.name);
      const filtered = validFiles.filter(file => !existing.includes(file.name));
      return [...prev, ...filtered.map(file => ({
        file,
        name: file.name,
        size: file.size,
        id: Date.now() + Math.random()
      }))];
    });

    if (validFiles.length !== newFiles.length) {
      setUploadStatus({
        type: 'error',
        message: 'Algunos archivos fueron filtrados (formato no soportado o tamaño mayor a 100MB)',
      });
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadSingleFile = async (fileItem) => {
    try {
      setUploadProgress(prev => ({ ...prev, [fileItem.id]: 'uploading' }));
      const result = await fileAPI.upload(fileItem.file);
      
      setUploadProgress(prev => ({ ...prev, [fileItem.id]: 'success' }));
      
      if (onFileUploaded) {
        onFileUploaded(result);
      }
      
      return { success: true, result, fileName: fileItem.name };
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, [fileItem.id]: 'error' }));
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al subir el archivo',
        fileName: fileItem.name 
      };
    }
  };

  const uploadAllFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadStatus(null);
    
    const results = [];
    
    for (const fileItem of selectedFiles) {
      const result = await uploadSingleFile(fileItem);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    if (errorCount === 0) {
      setUploadStatus({
        type: 'success',
        message: `${successCount} archivo(s) subido(s) exitosamente`,
      });
      setSelectedFiles([]);
    } else if (successCount === 0) {
      setUploadStatus({
        type: 'error',
        message: `Error al subir todos los archivos`,
      });
    } else {
      setUploadStatus({
        type: 'warning',
        message: `${successCount} archivo(s) subido(s), ${errorCount} fallaron`,
      });
    }
    
    setUploading(false);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear status after 5 seconds
    setTimeout(() => {
      setUploadStatus(null);
      setUploadProgress({});
    }, 5000);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const supportedFormats = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.xlsx', '.epub'];

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept={supportedFormats.join(',')}
          multiple
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full ${
              dragActive ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 ${
                dragActive ? 'text-primary-600' : 'text-gray-600'
              }`} />
            </div>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragActive ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              o{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-primary-600 hover:text-primary-700 font-medium underline"
              >
                selecciona archivos
              </button>
            </p>
          </div>
          
          <div className="text-xs text-gray-400">
            <p>Formatos soportados: {supportedFormats.join(', ')}</p>
            <p>Tamaño máximo por archivo: 100MB</p>
            <p>Puedes seleccionar múltiples archivos</p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Archivos seleccionados ({selectedFiles.length})
            </h3>
            <div className="space-x-2">
              <button
                onClick={clearAllFiles}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar todo</span>
              </button>
            </div>
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-1">
            {selectedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{fileItem.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadProgress[fileItem.id] === 'uploading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  {uploadProgress[fileItem.id] === 'success' && (
                    <CheckCircle className="w-4 h-4 text-success-600" />
                  )}
                  {uploadProgress[fileItem.id] === 'error' && (
                    <AlertCircle className="w-4 h-4 text-error-600" />
                  )}
                  
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={uploadAllFiles}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full mt-3 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Subiendo archivos...' : `Subir ${selectedFiles.length} archivo(s)`}
          </button>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
          uploadStatus.type === 'success' 
            ? 'bg-success-50 border border-success-200' 
            : uploadStatus.type === 'warning'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-error-50 border border-error-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-success-600" />
          ) : uploadStatus.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-error-600" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              uploadStatus.type === 'success' 
                ? 'text-success-800' 
                : uploadStatus.type === 'warning'
                ? 'text-yellow-800'
                : 'text-error-800'
            }`}>
              {uploadStatus.message}
            </p>
          </div>
          <button
            onClick={() => setUploadStatus(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;