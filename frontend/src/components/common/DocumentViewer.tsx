'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType = 'application/pdf',
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const isPDF = documentType === 'application/pdf' || documentName.toLowerCase().endsWith('.pdf');
  const isImage = documentType.startsWith('image/');
  const isText = documentType === 'text/plain' || documentName.toLowerCase().endsWith('.txt');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {/* Modal Container */}
      <div className="relative w-full h-full max-w-6xl max-h-screen flex flex-col bg-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{documentName}</h2>
              <p className="text-sm text-gray-500">{documentType}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700 w-12 text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              title="Download document"
              aria-label="Download document"
            >
              <Download size={20} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              title="Close viewer"
              aria-label="Close viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {error ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="text-red-500">
                <FileText size={48} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Display Document</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download Instead
                </button>
              </div>
            </div>
          ) : isPDF ? (
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                src={`${documentUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none"
                title={documentName}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Failed to load PDF. Please try downloading instead.');
                  setIsLoading(false);
                }}
              />
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center p-4">
              <img
                src={documentUrl}
                alt={documentName}
                style={{ maxWidth: `${zoom}%`, maxHeight: '100%' }}
                className="object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Failed to load image.');
                  setIsLoading(false);
                }}
              />
            </div>
          ) : isText ? (
            <div className="w-full h-full p-6 bg-white overflow-auto">
              <iframe
                src={documentUrl}
                className="w-full h-full border-none"
                title={documentName}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Failed to load text file.');
                  setIsLoading(false);
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <FileText size={48} className="text-gray-400" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Type Not Supported</h3>
                <p className="text-gray-600 mb-4">This document type cannot be previewed in the browser.</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download Document
                </button>
              </div>
            </div>
          )}

          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Page Navigation (for PDF) */}
        {isPDF && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              title="Previous page"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              title="Next page"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
