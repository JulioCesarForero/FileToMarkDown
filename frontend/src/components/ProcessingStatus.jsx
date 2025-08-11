import React, { useEffect, useState } from 'react';
import { Play, Pause, CheckCircle, AlertCircle, Clock, FileText, Zap } from 'lucide-react';
import { processingAPI } from '../services/api';

const ProcessingStatus = ({ onProcessingComplete }) => {
  const [status, setStatus] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    let interval;
    
    if (isPolling) {
      interval = setInterval(fetchStatus, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPolling]);

  const fetchStatus = async () => {
    try {
      const currentStatus = await processingAPI.getStatus();
      setStatus(currentStatus);
      
      if (!currentStatus.is_processing && isPolling) {
        setIsPolling(false);
        if (onProcessingComplete) {
          onProcessingComplete(currentStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const startProcessing = async () => {
    try {
      await processingAPI.start();
      setIsPolling(true);
      setStatus(prev => ({ ...prev, is_processing: true }));
    } catch (error) {
      console.error('Error starting processing:', error);
      alert('Error al iniciar el procesamiento');
    }
  };

  const consolidateFiles = async () => {
    try {
      await processingAPI.consolidate();
      alert('Archivos consolidados exitosamente');
      // Refresh status
      fetchStatus();
    } catch (error) {
      console.error('Error consolidating files:', error);
      alert('Error al consolidar los archivos');
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return '--';
    
    const end = endTime || Date.now() / 1000;
    const duration = Math.floor(end - startTime);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!status) {
    return (
      <div className="card">
        <div className="text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Estado del Procesamiento
          </h3>
          <p className="text-gray-500 mb-4">
            No hay procesamiento activo
          </p>
          <button
            onClick={startProcessing}
            className="btn-primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar Procesamiento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Estado del Procesamiento
        </h3>
        
        <div className="flex items-center space-x-2">
          {status.is_processing ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-pulse-slow">
                <Pause className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Completado</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progreso: {Math.round(status.progress)}%
          </span>
          <span className="text-sm text-gray-500">
            {status.processed_files} / {status.total_files} archivos
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(status.progress)}`}
            style={{ width: `${status.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current File */}
      {status.current_file && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Procesando archivo actual:
              </p>
              <p className="text-sm text-blue-700 font-mono">
                {status.current_file}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {status.total_files}
          </div>
          <div className="text-sm text-gray-500">Total de archivos</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {status.processed_files}
          </div>
          <div className="text-sm text-gray-500">Procesados</div>
        </div>
      </div>

      {/* Duration */}
      {status.start_time && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
          <Clock className="w-4 h-4" />
          <span>
            Duración: {formatDuration(status.start_time, status.end_time)}
          </span>
        </div>
      )}

      {/* Errors */}
      {status.errors && status.errors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-error-500" />
            Errores ({status.errors.length})
          </h4>
          <div className="space-y-2">
            {status.errors.map((error, index) => (
              <div key={index} className="p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm font-medium text-error-800">
                  {error.file === 'system' ? 'Error del sistema' : `Archivo: ${error.file}`}
                </p>
                <p className="text-xs text-error-600 mt-1">
                  {error.error}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col space-y-3">
        {!status.is_processing && (
          <>
            <button
              onClick={startProcessing}
              className="btn-primary w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Procesar Archivos
            </button>
            
            {status.processed_files > 0 && (
              <button
                onClick={consolidateFiles}
                className="btn-secondary w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Consolidar Archivos
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessingStatus;
