import React, { useState } from 'react';
import { File, Download, Trash2, Eye, Calendar, HardDrive } from 'lucide-react';
import { fileAPI } from '../services/api';

const FileList = ({ files, type = 'input', onFileDeleted, onRefresh }) => {
  const [deleting, setDeleting] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${filename}"?`)) {
      return;
    }

    setDeleting(filename);
    try {
      await fileAPI.delete(filename);
      if (onFileDeleted) {
        onFileDeleted(filename);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error al eliminar el archivo');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (filename) => {
    setDownloading(filename);
    try {
      const blob = await fileAPI.download(filename);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar el archivo');
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconClass = "w-5 h-5";
    
    switch (ext) {
      case 'pdf':
        return <File className={`${iconClass} text-red-500`} />;
      case 'docx':
      case 'doc':
        return <File className={`${iconClass} text-blue-500`} />;
      case 'txt':
        return <File className={`${iconClass} text-gray-500`} />;
      case 'pptx':
        return <File className={`${iconClass} text-orange-500`} />;
      case 'xlsx':
        return <File className={`${iconClass} text-green-500`} />;
      case 'epub':
        return <File className={`${iconClass} text-purple-500`} />;
      case 'md':
        return <File className={`${iconClass} text-blue-600`} />;
      default:
        return <File className={`${iconClass} text-gray-400`} />;
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg font-medium">
          {type === 'input' ? 'No hay archivos para procesar' : 'No hay archivos procesados'}
        </p>
        <p className="text-sm">
          {type === 'input' 
            ? 'Sube archivos para comenzar a procesarlos' 
            : 'Los archivos procesados aparecerán aquí'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.name}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(file.name)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <div className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3" />
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(file.modified)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {type === 'output' && (
                <button
                  onClick={() => handleDownload(file.name)}
                  disabled={downloading === file.name}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Descargar archivo"
                >
                  {downloading === file.name ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {type === 'input' && (
                <button
                  onClick={() => handleDelete(file.name)}
                  disabled={deleting === file.name}
                  className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Eliminar archivo"
                >
                  {deleting === file.name ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-error-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
