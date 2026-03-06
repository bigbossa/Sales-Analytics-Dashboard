import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ParsedFile {
  name: string;
  rows: any[];
}

interface FileUploadProps {
  onDataLoaded: (data: any[], files: ParsedFile[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const parseOneFile = (file: File): Promise<ParsedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          resolve({ name: file.name, rows: jsonData });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.name.match(/\.(xlsx|xls|csv)$/)) {
        newFiles.push(f);
      }
    }
    if (newFiles.length === 0) {
      setError('กรุณาอัพโหลดไฟล์ Excel หรือ CSV เท่านั้น');
      return;
    }
    setError(null);

    try {
      const parsed = await Promise.all(newFiles.map(parseOneFile));
      setFiles(prev => {
        const updated = [...prev, ...parsed];
        const allRows = updated.flatMap(f => f.rows);
        onDataLoaded(allRows, updated);
        return updated;
      });
    } catch (err) {
      console.error('Error parsing files:', err);
      setError('ไม่สามารถอ่านไฟล์บางไฟล์ได้ กรุณาตรวจสอบไฟล์');
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      const allRows = updated.flatMap(f => f.rows);
      onDataLoaded(allRows, updated);
      return updated;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setError(null);
    onDataLoaded([], []);
  };

  const totalRows = files.reduce((sum, f) => sum + f.rows.length, 0);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Drop zone - always visible */}
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
          multiple
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={cn(
            "p-4 rounded-full",
            files.length > 0 ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
          )}>
            {files.length > 0 ? <Plus size={32} /> : <Upload size={32} />}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {files.length > 0 ? 'คลิกเพื่อเพิ่มไฟล์' : 'คลิกเพื่ออัพโหลด หรือลากไฟล์มาวาง'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              รองรับหลายไฟล์พร้อมกัน — Excel (XLSX, XLS) หรือ CSV
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">
              {files.length} ไฟล์ · {totalRows.toLocaleString()} รายการ
            </p>
            <button
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              ลบทั้งหมด
            </button>
          </div>
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-green-600 font-medium">{file.rows.length.toLocaleString()} รายการ</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ))}
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
