'use client';

import { useState, useRef, useEffect } from 'react';

const PhotoCapture = ({ 
  onCapture, 
  onRetake, 
  isCaptured, 
  isLoading,
  photoType 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!isCaptured && !capturedPhoto) {
      startCamera();
    }
  }, [isCaptured, capturedPhoto, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError('');

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);

      requestAnimationFrame(() => {
        if (!videoRef.current) return;

        videoRef.current.srcObject = mediaStream;

        videoRef.current.onloadedmetadata = () => {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Ignore AbortError
            });
          }
        };
      });

    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Unable to access camera.'
      );
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    // Submits immediately via the parent
    onCapture(dataUrl);
  };

  const retakePhoto = async () => {
    setCapturedPhoto(null);
    onRetake();
    await startCamera();
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const actionLabel = photoType === 'clock_in' ? 'Clock In' : 'Clock Out';
  const actionColor = photoType === 'clock_in' ? 'from-blue-600 to-blue-700' : 'from-indigo-600 to-indigo-700';

  if (isCaptured) return null;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Camera View Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {!capturedPhoto ? (
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {cameraError ? (
              <div className="w-full h-96 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Access Required</h3>
                <p className="text-gray-600 text-sm max-w-sm">{cameraError}</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    style={{ aspectRatio: '4/4', objectFit: 'cover' }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                    <div className="relative w-full max-w-xs aspect-[3/4]">
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            <img 
              src={capturedPhoto} 
              alt="Captured verification photo" 
              className="w-full"
              style={{ aspectRatio: '4/4', objectFit: 'cover' }}
            />
            
            <div className={`absolute inset-0 bg-gradient-to-t ${isLoading ? 'from-blue-500/20' : 'from-green-500/20'} to-transparent pointer-events-none`}></div>
            
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${isLoading ? 'bg-blue-600' : 'bg-green-500'} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2`}>
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-semibold">Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">Photo Captured</span>
                </>
              )}
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button
              type="button"
                onClick={retakePhoto}
                disabled={isLoading}
                className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-xl transition-all border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retake Photo
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {!capturedPhoto && !cameraError && (
          <button
          type="button"
            onClick={capturePhoto}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r ${actionColor} hover:shadow-2xl text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group`}
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-lg">Capture & Submit {actionLabel}</span>
          </button>
        )}

        {cameraError && (
          <button
            onClick={startCamera}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Camera Access
          </button>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoCapture;