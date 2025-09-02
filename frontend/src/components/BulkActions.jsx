import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { fileAPI } from '../services/api';

const BulkActions = ({ onFilesChanged }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      const blob = await fileAPI.downloadAll();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'archivos_procesados.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading all files:', error);
      alert('Error al descargar los archivos: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      await fileAPI.deleteAll();
      setShowDeleteConfirm(false);
      
      // Notify parent component to refresh file list
      if (onFilesChanged) {
        onFilesChanged();
      }
      
      alert('Todos los archivos de entrada han sido borrados');
    } catch (error) {
      console.error('Error deleting all files:', error);
      alert('Error al borrar los archivos: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Acciones Masivas
      </h3>
      
      <div className="flex flex-wrap gap-4">
        {/* Download All Button */}
        <button
          onClick={handleDownloadAll}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={18} />
          {isDownloading ? 'Descargando...' : 'Descargar Todos'}
        </button>

        {/* Delete All Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={18} />
          {isDeleting ? 'Borrando...' : 'Borrar Todos'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h4 className="text-lg font-semibold text-gray-800">
                Confirmar Borrado
              </h4>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres borrar todos los archivos de entrada? 
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Borrando...' : 'Sí, Borrar Todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
