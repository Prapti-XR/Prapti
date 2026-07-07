/**
 * QR Code Modal Component
 * Displays QR code for AR viewing on mobile devices
 */

'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
    siteId: string;
    siteName: string;
    isOpen: boolean;
    onClose?: () => void;
}

export function QRCodeModal({
    siteId,
    siteName,
    isOpen,
    onClose
}: QRCodeModalProps) {
    const [baseUrl, setBaseUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, []);

    const arUrl = `${baseUrl}/ar?site=${siteId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(arUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
                await navigator.share({
                    title: `${siteName} - AR Experience`,
                    text: `View ${siteName} in Augmented Reality`,
                    url: arUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            handleCopy();
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${siteName}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .container {
                text-align: center;
              }
              h1 {
                color: #333;
                margin-bottom: 10px;
              }
              .subtitle {
                color: #666;
                margin-bottom: 30px;
              }
              .qr-container {
                background: white;
                padding: 20px;
                border: 4px solid #e5e5e5;
                border-radius: 10px;
                display: inline-block;
                margin-bottom: 20px;
              }
              .url {
                color: #666;
                font-size: 12px;
                word-break: break-all;
                max-width: 400px;
                margin: 0 auto;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${siteName}</h1>
              <p class="subtitle">Scan to view in Augmented Reality</p>
              <div class="qr-container">
                ${document.querySelector('#qr-code-svg')?.outerHTML || ''}
              </div>
              <p class="url">${arUrl}</p>
            </div>
          </body>
        </html>
      `);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    if (!isOpen) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={`QR code for ${siteName}`}
        >
            <div
                className="w-full max-w-md p-6 transition-all transform bg-white shadow-2xl rounded-2xl md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="mb-1 font-serif text-2xl font-bold text-heritage-dark">
                            📱 View in AR
                        </h2>
                        <p className="text-sm text-heritage-dark/70">
                            Scan with your mobile device
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex items-center justify-center w-11 h-11 text-heritage-dark/40 transition-colors rounded-lg hover:text-heritage-dark hover:bg-heritage-light/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white border-4 border-heritage-light/60 shadow-sm rounded-xl">
                        <div id="qr-code-svg">
                            <QRCodeSVG
                                value={arUrl}
                                size={200}
                                level="M"
                                includeMargin={false}
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>

                {/* Site Info */}
                <div className="p-4 mb-6 border bg-gradient-to-br from-heritage-primary/10 to-heritage-primary/20 rounded-xl border-heritage-primary/30">
                    <p className="mb-2 text-sm font-medium text-heritage-dark">
                        {siteName}
                    </p>
                    <p className="p-2 font-mono text-xs text-heritage-dark/70 break-all rounded bg-white/50">
                        {arUrl}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-heritage-dark transition-all bg-heritage-primary rounded-lg shadow-sm hover:bg-heritage-primary/90 hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>

                    {typeof navigator !== 'undefined' && 'share' in navigator ? (
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white transition-all bg-heritage-secondary rounded-lg shadow-sm hover:bg-heritage-secondary/90 hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                        </button>
                    ) : (
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white transition-all bg-heritage-accent rounded-lg shadow-sm hover:bg-heritage-accent/90 hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                    )}
                </div>

                {/* Instructions */}
                <div className="p-4 border border-heritage-accent/40 bg-heritage-accent/10 rounded-xl">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-heritage-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-medium text-heritage-dark">
                                How to use:
                            </p>
                            <p className="text-xs text-heritage-dark/70">
                                Open your smartphone camera and point it at the QR code. Tap the notification to open the AR experience directly in your browser.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
