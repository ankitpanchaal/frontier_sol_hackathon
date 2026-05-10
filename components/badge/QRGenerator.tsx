'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { APP_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface QRGeneratorProps {
  campaignId: string;
  campaignTitle: string;
  className?: string;
}

export function QRGenerator({ campaignId, campaignTitle, className }: QRGeneratorProps) {
  const claimUrl = `${APP_URL}/claim/${campaignId}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById(`qr-svg-${campaignId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement('a');
      link.download = `soulstamp-${campaignTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="rounded-2xl bg-white p-4 shadow-lg">
        <QRCodeSVG
          id={`qr-svg-${campaignId}`}
          value={claimUrl}
          size={200}
          level="H"
          includeMargin={false}
          fgColor="#1a0a2e"
          bgColor="#ffffff"
        />
      </div>

      <div className="w-full space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
          <span className="text-xs text-muted-foreground flex-1 truncate font-mono">{claimUrl}</span>
          <button
            id={`copy-claim-link-${campaignId}`}
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity flex-shrink-0"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <button
          id={`download-qr-${campaignId}`}
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-colors"
        >
          <Download size={15} />
          Download QR Code
        </button>
      </div>
    </div>
  );
}
