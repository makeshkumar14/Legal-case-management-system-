import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';

export function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={clsx('fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full mx-4', sizes[size])}
          >
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {(title || showClose) && (
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                  {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
                  {showClose && (
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  )}
                </div>
              )}
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-500',
    warning: 'bg-amber-600 hover:bg-amber-500',
    success: 'bg-emerald-600 hover:bg-emerald-500',
    primary: 'bg-indigo-600 hover:bg-indigo-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors">{cancelText}</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={clsx('px-4 py-2.5 rounded-xl text-white font-medium transition-colors', variants[variant])}>{confirmText}</button>
      </div>
    </Modal>
  );
}
