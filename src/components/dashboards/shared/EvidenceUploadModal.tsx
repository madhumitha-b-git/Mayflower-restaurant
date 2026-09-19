import React, { useState, useRef } from 'react';
import { Camera, MapPin, X, Upload } from 'lucide-react';
import { UserProfile } from '../../../types';
import { getDataProvider } from '../../../data/DataProvider';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  user: UserProfile;
  onEvidenceUploaded: () => void;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  user,
  onEvidenceUploaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGeoCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (err) => {
            console.warn('Geolocation denied or unavailable:', err);
          }
        );
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setIsUploading(true);
    setError(null);
    try {
      const provider = getDataProvider();
      await provider.uploadTaskEvidence(user, taskId, file, geoCoords || undefined);
      await provider.updateTaskStatus(user, taskId, 'Completed', 'Evidence uploaded');
      onEvidenceUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-[#E8E4DB]">
        <div className="p-4 border-b border-[#E8E4DB] flex justify-between items-center bg-[#FAF7F2]">
          <h3 className="font-serif text-lg text-[#1A1A1A]">Upload Evidence</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">Task: <span className="font-semibold">{taskTitle}</span></p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {!previewUrl ? (
            <div 
              className="border-2 border-dashed border-[#E8E4DB] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={48} className="text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 font-medium">Tap to capture or select photo</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-[#E8E4DB]">
                <img src={previewUrl} alt="Evidence preview" className="w-full h-auto object-cover max-h-64" />
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); setGeoCoords(null); }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
              
              {geoCoords && (
                <div className="flex items-center text-xs text-green-700 bg-green-50 p-2 rounded-lg">
                  <MapPin size={14} className="mr-1" /> Location captured
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[#E8E4DB] bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl mr-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex items-center px-4 py-2 bg-[#2D4030] text-white text-sm font-medium rounded-xl hover:bg-[#1F3022] disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : <><Upload size={16} className="mr-2" /> Submit</>}
          </button>
        </div>
      </div>
    </div>
  );
};
