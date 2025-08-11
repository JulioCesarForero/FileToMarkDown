import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import FileUpload from './components/FileUpload.jsx';
import FileList from './components/FileList.jsx';
import ProcessingStatus from './components/ProcessingStatus.jsx';
import { fileAPI, healthAPI } from './services/api';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

function App() {
  const [files, setFiles] = useState({ input_files: [], output_files: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
    checkHealth();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await fileAPI.list();
      setFiles(fileList);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Error al cargar los archivos');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const health = await healthAPI.check();
      setHealthStatus(health);
    } catch (err) {
      console.error('Health check failed:', err);
      setHealthStatus({ status: 'unhealthy', message: 'API no disponible' });
    }
  };

  const handleFileUploaded = (result) => {
    // Refresh file list after upload
    fetchFiles();
  };

  const handleFileDeleted = (filename) => {
    // Update local state immediately for better UX
    setFiles(prev => ({
      ...prev,
      input_files: prev.input_files.filter(f => f.name !== filename)
    }));
  };

  const handleProcessingComplete = (status) => {
    // Refresh file list after processing
    fetchFiles();
  };

  const handleError = (error) => {
    console.error('Upload error:', error);
    setError('Error al subir el archivo');
  };

  if (loading && files.input_files.length === 0 && files.output_files.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Status */}
        {healthStatus && (
          <div className={`mb-6 p-4 rounded-lg border ${
            healthStatus.status === 'healthy' 
              ? 'bg-success-50 border-success-200' 
              : 'bg-error-50 border-error-200'
          }`}>
            <div className="flex items-center space-x-3">
              {healthStatus.status === 'healthy' ? (
                <CheckCircle className="w-5 h-5 text-success-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-error-600" />
              )}
              <div>
                <p className={`font-medium ${
                  healthStatus.status === 'healthy' ? 'text-success-800' : 'text-error-800'
                }`}>
                  Estado del API: {healthStatus.status === 'healthy' ? 'Conectado' : 'Desconectado'}
                </p>
                <p className={`text-sm ${
                  healthStatus.status === 'healthy' ? 'text-success-700' : 'text-error-700'
                }`}>
                  {healthStatus.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-error-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-error-800">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-error-400 hover:text-error-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload and Processing */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload Section */}
            <section id="upload" className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Subir Archivos
                </h2>
                <button
                  onClick={fetchFiles}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Actualizar lista de archivos"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <FileUpload
                onFileUploaded={handleFileUploaded}
                onError={handleError}
              />
            </section>

            {/* Processing Status Section */}
            <section id="process" className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Procesamiento
              </h2>
              
              <ProcessingStatus
                onProcessingComplete={handleProcessingComplete}
              />
            </section>
          </div>

          {/* Right Column - File Lists */}
          <div className="space-y-8">
            {/* Input Files */}
            <section id="files" className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Archivos para Procesar
                </h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {files.input_files?.length || 0}
                </span>
              </div>
              
              <FileList
                files={files.input_files}
                type="input"
                onFileDeleted={handleFileDeleted}
                onRefresh={fetchFiles}
              />
            </section>

            {/* Output Files */}
            <section className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Archivos Procesados
                </h2>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                  {files.output_files?.length || 0}
                </span>
              </div>
              
              <FileList
                files={files.output_files}
                type="output"
                onRefresh={fetchFiles}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
