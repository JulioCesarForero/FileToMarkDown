import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { fileAPI } from '../services/api';

const FileUpload = ({ onFileUploaded, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setUploading(true);
    setUploadStatus(null);
    
    try {
      const result = await fileAPI.upload(file);
      setUploadStatus({
        type: 'success',
        message: `Archivo ${file.name} subido exitosamente`,
        details: result
      });
      
      if (onFileUploaded) {
        onFileUploaded(result);
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al subir el archivo';
      setUploadStatus({
        type: 'error',
        message: errorMessage,
        details: error
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setUploading(false);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 5000);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
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
              {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta archivos aquí'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              o{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-primary-600 hover:text-primary-700 font-medium underline"
              >
                selecciona un archivo
              </button>
            </p>
          </div>
          
          <div className="text-xs text-gray-400">
            <p>Formatos soportados: {supportedFormats.join(', ')}</p>
            <p>Tamaño máximo: 100MB</p>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
          uploadStatus.type === 'success' 
            ? 'bg-success-50 border border-success-200' 
            : 'bg-error-50 border border-error-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-success-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-error-600" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              uploadStatus.type === 'success' ? 'text-success-800' : 'text-error-800'
            }`}>
              {uploadStatus.message}
            </p>
            {uploadStatus.details?.filename && (
              <p className="text-xs text-gray-600 mt-1">
                Archivo: {uploadStatus.details.filename}
              </p>
            )}
          </div>
          <button
            onClick={() => setUploadStatus(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-800">Subiendo archivo...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
