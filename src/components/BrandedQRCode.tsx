import { forwardRef, useImperativeHandle, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles } from 'lucide-react';

interface BrandedQRCodeProps {
  value: string;
  eventName: string;
  currencySymbol: string;
  currencyName: string;
  size?: number;
}

export interface BrandedQRCodeRef {
  downloadQR: () => void;
}

const BrandedQRCode = forwardRef<BrandedQRCodeRef, BrandedQRCodeProps>(
  ({ value, eventName, currencySymbol, currencyName, size = 160 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      downloadQR: () => {
        // Create a canvas with the full branded design
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = 400;
        const height = 520;
        const qrSize = 280;
        
        canvas.width = width;
        canvas.height = height;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f0f11');
        gradient.addColorStop(1, '#1a1a1f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add decorative elements
        ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
        ctx.beginPath();
        ctx.arc(width * 0.9, height * 0.1, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.1, height * 0.9, 80, 0, Math.PI * 2);
        ctx.fill();

        // Header with logo
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.roundRect(20, 20, 36, 36, 8);
        ctx.fill();

        // Mintly text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.fillText('Mintly', 66, 46);

        // Event name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(eventName, width / 2, 100);

        // Currency info
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '16px Outfit, sans-serif';
        ctx.fillText(`${currencySymbol} ${currencyName}`, width / 2, 130);

        // QR Code white background
        const qrX = (width - qrSize - 40) / 2;
        const qrY = 150;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(qrX, qrY, qrSize + 40, qrSize + 40, 16);
        ctx.fill();

        // Get QR SVG and draw it
        const svg = containerRef.current?.querySelector('svg');
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, qrX + 20, qrY + 20, qrSize, qrSize);
            
            // Scan instruction
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '14px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Scan to join event', width / 2, height - 50);

            // Footer accent line
            const footerGradient = ctx.createLinearGradient(40, height - 20, width - 40, height - 20);
            footerGradient.addColorStop(0, 'transparent');
            footerGradient.addColorStop(0.5, '#f97316');
            footerGradient.addColorStop(1, 'transparent');
            ctx.strokeStyle = footerGradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(40, height - 25);
            ctx.lineTo(width - 40, height - 25);
            ctx.stroke();

            // Download
            const link = document.createElement('a');
            link.download = `${eventName.replace(/\s+/g, '-')}-qr-code.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
      },
    }));

    return (
      <div ref={containerRef} className="p-4 bg-foreground rounded-2xl">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>
    );
  }
);

BrandedQRCode.displayName = 'BrandedQRCode';

export default BrandedQRCode;
