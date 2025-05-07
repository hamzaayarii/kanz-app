import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rag';

const DocumentUploader = () => {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [documentCount, setDocumentCount] = useState(null);
  const fileInputRef = useRef(null);

  // Récupérer le nombre de documents indexés au chargement
  React.useEffect(() => {
    fetchDocumentStats();
  }, []);

  // Récupérer les statistiques des documents
  const fetchDocumentStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      if (response.data.success) {
        setDocumentCount(response.data.count);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
    }
  };

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Vérifier le type de fichier
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Format de fichier non supporté. Veuillez sélectionner un fichier PDF ou TXT.');
      }
    }
  };

  // Gérer le changement de catégorie
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Gérer le téléchargement de fichier
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier à télécharger.');
      return;
    }
    
    try {
      setUploading(true);
      setMessage(null);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      if (category) {
        formData.append('category', category);
      }
      
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setMessage(`Document "${response.data.fileName}" téléchargé et indexé avec succès.`);
        setFile(null);
        setCategory('');
        // Réinitialiser l'input de fichier
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Mettre à jour les statistiques
        fetchDocumentStats();
      } else {
        setError(response.data.message || 'Erreur lors du téléchargement du document.');
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Une erreur est survenue lors du téléchargement. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  // Réinitialiser l'index des documents
  const handleResetIndex = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réinitialiser l\'index de documents ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setUploading(true);
      
      const response = await axios.post(`${API_URL}/reset`);
      
      if (response.data.success) {
        setMessage('L\'index de documents a été réinitialisé avec succès.');
        setDocumentCount(0);
      } else {
        setError('Erreur lors de la réinitialisation de l\'index.');
      }
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      setError('Une erreur est survenue lors de la réinitialisation de l\'index.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Gestion des documents</h2>
      
      {documentCount !== null && (
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-blue-800">
            <span className="font-medium">{documentCount}</span> chunks de documents indexés dans la base de connaissances
          </p>
        </div>
      )}
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Document (PDF ou TXT)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept=".pdf,.txt,application/pdf,text/plain"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={uploading}
          />
          {file && (
            <p className="text-sm text-gray-500 mt-1">
              Fichier sélectionné: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Catégorie (optionnel)
          </label>
          <input
            type="text"
            value={category}
            onChange={handleCategoryChange}
            placeholder="Ex: comptabilité, fiscalité, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={uploading}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={uploading || !file}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              uploading || !file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Téléchargement...' : 'Télécharger et indexer'}
          </button>
          
          <button
            type="button"
            onClick={handleResetIndex}
            disabled={uploading || documentCount === 0}
            className={`px-4 py-2 bg-red-600 text-white rounded-md ${
              uploading || documentCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
          >
            Réinitialiser l'index
          </button>
        </div>
      </form>
      
      {message && (
        <div className="mt-4 p-3 bg-green-50 text-green-800 rounded border border-green-200">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-800 rounded border border-red-200">
          {error}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Instructions</h3>
        <ol className="list-decimal pl-5 space-y-1 text-gray-600">
          <li>Téléchargez des fichiers PDF ou TXT contenant vos données comptables.</li>
          <li>Optionnellement, assignez une catégorie pour mieux organiser vos documents.</li>
          <li>Les documents seront automatiquement découpés en chunks et indexés.</li>
          <li>Vous pouvez poser des questions sur vos documents dans le chat.</li>
          <li>Pour vider la base de connaissances, utilisez le bouton "Réinitialiser l'index".</li>
        </ol>
      </div>
    </div>
  );
};

export default DocumentUploader;