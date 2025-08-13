import React, { useState, useMemo } from 'react';
import { File, Download, Trash2, Eye, Calendar, HardDrive, ArrowUpDown, ArrowUp, ArrowDown, Package } from 'lucide-react';
import { fileAPI, processingAPI } from '../services/api';

const FileList = ({ files, type = 'input', onFileDeleted, onRefresh }) => {
  const [deleting, setDeleting] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [consolidating, setConsolidating] = useState(false);
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', 'desc'

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

  // Memoized sorted files to avoid unnecessary re-sorting
  const sortedFiles = useMemo(() => {
    if (!files || files.length === 0) return [];
    
    const filesCopy = [...files];
    
    if (sortOrder === 'asc') {
      return filesCopy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      return filesCopy.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return filesCopy; // Return original order if no sorting
  }, [files, sortOrder]);

  const toggleSortOrder = () => {
    if (sortOrder === 'none') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('none');
    }
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'asc':
        return <ArrowUp className="w-4 h-4" />;
      case 'desc':
        return <ArrowDown className="w-4 h-4" />;
      default:
        return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  const getSortText = () => {
    switch (sortOrder) {
      case 'asc':
        return 'Ordenado A-Z';
      case 'desc':
        return 'Ordenado Z-A';
      default:
        return 'Sin ordenar';
    }
  };

  const handleConsolidate = async () => {
    if (!window.confirm('¿Deseas consolidar todos los archivos procesados en un único archivo? El orden actual se respetará.')) {
      return;
    }

    setConsolidating(true);
    try {
      const result = await processingAPI.consolidate();
      alert(`Archivo consolidado creado exitosamente: ${result.filename || 'consolidated.md'}`);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error consolidating files:', error);
      alert('Error al consolidar los archivos: ' + (error.response?.data?.error || error.message));
    } finally {
      setConsolidating(false);
    }
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
    <div className="space-y-4">
      {/* Header with controls for output files */}
      {type === 'output' && sortedFiles.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSortOrder}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Cambiar orden alfabético"
            >
              {getSortIcon()}
              <span>{getSortText()}</span>
            </button>
            
            <span className="text-sm text-gray-600">
              {sortedFiles.length} archivo(s) procesado(s)
            </span>
          </div>
          
          <button
            onClick={handleConsolidate}
            disabled={consolidating || sortedFiles.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Consolidar todos los archivos en uno solo"
          >
            {consolidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Consolidando...</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span>Consolidar archivos</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Files list */}
      <div className="space-y-3">
        {sortedFiles.map((file) => (
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
    </div>
  );
};

export default FileList;
