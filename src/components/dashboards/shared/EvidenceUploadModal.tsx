import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, X, Upload, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { UserProfile } from '../../../types';
import { getDataProvider } from '../../../data/DataProvider';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  taskCategory?: string;
  user: UserProfile;
  onEvidenceUploaded: () => void;
}

type GeoStatus = 'idle' | 'requesting' | 'acquired' | 'denied';

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskCategory,
  user,
  onEvidenceUploaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request geolocation as soon as modal opens
  useEffect(() => {
    if (!isOpen) return;
    setGeoStatus('requesting');
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        });
        setGeoStatus('acquired');
      },
      () => {
        setGeoStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewUrl(null);
      setGeoCoords(null);
      setGeoStatus('idle');
      setCapturedAt(null);
      setError(null);
      setNotes('');
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setCapturedAt(new Date());
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setIsUploading(true);
    setError(null);
    try {
      const provider = getDataProvider();
      await provider.uploadTaskEvidence(
        user,
        taskId,
        file,
        geoCoords ? { lat: geoCoords.lat, lng: geoCoords.lng } : undefined
      );
      await provider.updateTaskStatus(user, taskId, 'Completed', notes || 'Evidence uploaded with geo-tag');
      onEvidenceUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatCoord = (n: number) => n.toFixed(6);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8E4DB]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#02150c] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
              {taskCategory || 'SOP Evidence'}
            </p>
            <h3 className="font-serif text-base text-white mt-0.5 leading-tight">{taskTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Geo-Tag Status Bar */}
        <div className={`px-6 py-3 flex items-center gap-3 text-sm border-b ${
          geoStatus === 'acquired' ? 'bg-emerald-50 border-emerald-100' :
          geoStatus === 'denied'   ? 'bg-red-50 border-red-100' :
          'bg-amber-50 border-amber-100'
        }`}>
          {geoStatus === 'requesting' && (
            <>
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Acquiring GPS Location…</p>
                <p className="text-[11px] text-amber-600">Please allow location access when prompted</p>
              </div>
            </>
          )}
          {geoStatus === 'acquired' && geoCoords && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-800">Location Acquired ✓</p>
                <p className="text-[11px] text-emerald-700 font-mono truncate">
                  {formatCoord(geoCoords.lat)}, {formatCoord(geoCoords.lng)}
                  <span className="ml-2 text-emerald-600 font-sans">±{geoCoords.accuracy}m</span>
                </p>
              </div>
              <a
                href={`https://maps.google.com/?q=${geoCoords.lat},${geoCoords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg hover:bg-emerald-200 transition-colors shrink-0 cursor-pointer"
              >
                Map ↗
              </a>
            </>
          )}
          {geoStatus === 'denied' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-800">Location Access Denied</p>
                <p className="text-[11px] text-red-600">Evidence will be uploaded without geo-tag</p>
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Photo Capture */}
          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-[#C5A880]/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FAF7F2] transition-colors group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#02150c]/5 flex items-center justify-center mb-4 group-hover:bg-[#02150c]/10 transition-colors">
                <Camera size={32} className="text-[#02150c]/50" />
              </div>
              <p className="text-sm font-semibold text-[#02150c]">Capture Photo Evidence</p>
              <p className="text-xs text-stone-400 mt-1">Tap to open camera or select from gallery</p>
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
              {/* Photo preview */}
              <div className="relative rounded-xl overflow-hidden border-2 border-[#C5A880]/30">
                <img src={previewUrl} alt="Evidence preview" className="w-full h-auto object-cover max-h-56" />
                
                {/* Overlay timestamp + geo badge */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-center gap-2 flex-wrap">
                    {capturedAt && (
                      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
                        <Clock size={11} className="text-white/80" />
                        <span className="text-[11px] text-white font-mono">
                          {capturedAt.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {geoStatus === 'acquired' && geoCoords && (
                      <div className="flex items-center gap-1.5 bg-emerald-600/80 backdrop-blur-sm rounded-lg px-2.5 py-1">
                        <MapPin size={11} className="text-white" />
                        <span className="text-[11px] text-white font-mono">
                          {formatCoord(geoCoords.lat)}, {formatCoord(geoCoords.lng)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => { setFile(null); setPreviewUrl(null); setCapturedAt(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Remarks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Temp checked at 3.2°C, within safe range"
              className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#E8E4DB] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#02150c] transition-colors"
            />
          </div>

          {/* Metadata summary */}
          {file && (
            <div className="bg-[#F7F5F0] rounded-xl p-3 flex flex-wrap gap-4 text-[11px] text-stone-500">
              <div>
                <span className="font-bold uppercase tracking-wider text-stone-400 block text-[9px] mb-0.5">Chef</span>
                <span className="text-stone-700 font-medium">{user.name}</span>
              </div>
              {capturedAt && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-stone-400 block text-[9px] mb-0.5">Captured</span>
                  <span className="text-stone-700 font-medium">{capturedAt.toLocaleTimeString('en-IN')}</span>
                </div>
              )}
              {geoStatus === 'acquired' && geoCoords && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-stone-400 block text-[9px] mb-0.5">Geo-Tag</span>
                  <span className="text-emerald-700 font-medium">Embedded ✓</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E4DB] bg-[#FAF7F2] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="h-10 px-4 bg-white border border-[#E8E4DB] text-sm font-medium text-stone-600 rounded-xl hover:bg-[#F0EDE7] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="h-10 px-6 flex items-center gap-2 bg-[#02150c] text-[#C5A880] text-sm font-semibold rounded-xl hover:bg-[#0a2a18] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Upload size={14} />
                Submit Evidence
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
