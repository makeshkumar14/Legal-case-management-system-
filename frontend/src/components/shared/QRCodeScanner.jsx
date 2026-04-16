import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Camera, AlertCircle } from 'lucide-react';

export function QRCodeScanner({ isOpen, onClose, onScan }) {
  const [error, setError] = useState(null);

  const handleScan = (result) => {
    if (result && result[0]?.rawValue) {
      onScan(result[0].rawValue);
      onClose();
    }
  };

  const handleError = (err) => {
    setError(err?.message || 'Camera access denied or not available');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-white dark:bg-[#232338] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#e5e4df] dark:border-[#2d2d45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#b4f461]/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#2d6a25]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a2e] dark:text-white">Scan QR Code</h3>
                <p className="text-xs text-[#6b6b80]">Position the QR code within the frame</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e] text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner Area */}
          <div className="relative aspect-square bg-black">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#1a1a2e]">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-white font-medium mb-2">Camera Error</p>
                <p className="text-sm text-[#6b6b80]">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 px-4 py-2 bg-[#b4f461] text-[#1a1a2e] font-medium rounded-xl hover:bg-[#a3e350] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  constraints={{ facingMode: 'environment' }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: { width: '100%', height: '100%', objectFit: 'cover' }
                  }}
                />
                {/* Scan overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-[60px] border-black/50" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#b4f461] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#b4f461] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#b4f461] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#b4f461] rounded-br-lg" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#f7f6f3] dark:bg-[#1a1a2e] text-center">
            <p className="text-sm text-[#6b6b80]">
              Scan a case QR code to quickly search
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
