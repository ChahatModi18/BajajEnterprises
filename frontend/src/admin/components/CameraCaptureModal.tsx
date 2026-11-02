import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Image as ImageIcon, FlipHorizontal } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Take Bicycle Photograph",
  subtitle = "Align bicycle within frame and tap Capture to attach photograph instantly."
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Start Camera
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setErrorMsg(null);
    setCapturedDataUrl(null);
    setCapturedBlob(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this device/browser. Please use manual upload.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setErrorMsg(err.message || "Unable to access device camera. Please check camera permissions or use direct file upload.");
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setCapturedDataUrl(null);
      setCapturedBlob(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        const url = URL.createObjectURL(blob);
        setCapturedDataUrl(url);
        stopCamera();
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    if (capturedDataUrl) {
      URL.revokeObjectURL(capturedDataUrl);
    }
    setCapturedDataUrl(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `bicycle_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    onCapture(file);
    onClose();
  };

  const handleManualFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center overflow-y-auto">
          {errorMsg ? (
            <div className="w-full p-6 text-center space-y-4 bg-slate-800/40 border border-rose-500/20 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">Camera Access Notice</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{errorMsg}</p>
              </div>
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-900/30 transition">
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose from Gallery / Files</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleManualFileInput}
                  />
                </label>
              </div>
            </div>
          ) : capturedDataUrl ? (
            /* Captured Snapshot Preview */
            <div className="w-full space-y-4">
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-emerald-500/30 shadow-inner">
                <img
                  src={capturedDataUrl}
                  alt="Captured bicycle snapshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/90 text-slate-950 font-bold text-[11px] rounded-full shadow flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Snapshot Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Attach & Save Photo</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder */
            <div className="w-full space-y-4 flex flex-col items-center">
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Viewfinder Overlay Guides */}
                <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-widest text-white/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    Align Bicycle Profile
                  </span>
                </div>

                {/* Flip camera button */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-md border border-white/10 shadow transition"
                  title="Switch Front/Rear Camera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Shutter Button Controls */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <label className="text-slate-400 hover:text-white text-xs flex flex-col items-center gap-1 cursor-pointer transition">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px]">Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleManualFileInput}
                  />
                </label>

                {/* Big Shutter Button */}
                <button
                  type="button"
                  onClick={handleSnap}
                  disabled={!cameraActive || isCapturing}
                  className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-white hover:bg-emerald-100 flex items-center justify-center shadow-xl shadow-emerald-900/40 active:scale-95 transition"
                  title="Snap Photograph"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500" />
                </button>

                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="text-slate-400 hover:text-white text-xs flex flex-col items-center gap-1 transition"
                  title="Restart Camera"
                >
                  <RefreshCw className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px]">Restart</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

