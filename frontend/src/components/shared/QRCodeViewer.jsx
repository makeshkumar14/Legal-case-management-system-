import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export function QRCodeViewer({ value, size = 200, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white"
    >
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#1e3a5f"
        level="H"
        includeMargin={true}
      />
      {title && (
        <p className="text-sm text-gray-600 font-medium text-center">{title}</p>
      )}
    </motion.div>
  );
}
