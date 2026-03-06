import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Please upload an Excel or CSV file.');
      return;
    }

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        onDataLoaded(jsonData);
      } catch (err) {
        console.error("Error parsing file:", err);
        setError('Failed to parse the file. Please ensure it is a valid Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const clearFile = () => {
    setFileName(null);
    setError(null);
    onDataLoaded([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {!fileName ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50",
            error ? "border-red-300 bg-red-50" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Excel files (XLSX, XLS) or CSV
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-xs text-green-600 font-medium">Ready to analyze</p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
    </div>
  );
}
