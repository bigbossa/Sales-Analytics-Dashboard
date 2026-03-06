import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { LayoutDashboard, Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [files, setFiles] = useState<{ name: string; rows: any[] }[]>([]);
  const [dbStatus, setDbStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dbMessage, setDbMessage] = useState('');

  const handleDataLoaded = (allData: any[], parsedFiles: { name: string; rows: any[] }[]) => {
    setData(allData);
    setFiles(parsedFiles);
    setDbStatus('idle');
    setDbMessage('');
  };

  const uploadToDatabase = async () => {
    if (data.length === 0) return;
    setDbStatus('uploading');
    setDbMessage('');

    try {
      const res = await fetch('/api/upload-to-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: data }),
      });
      const result = await res.json();
      if (res.ok) {
        setDbStatus('success');
        setDbMessage(`อัพโหลดสำเร็จ ${result.inserted} รายการ เข้า Database แล้ว`);
      } else {
        setDbStatus('error');
        setDbMessage(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err: any) {
      setDbStatus('error');
      setDbMessage(err.message || 'ไม่สามารถเชื่อมต่อ API Server ได้');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Sales Analytics Dashboard
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            {data.length > 0 ? `${files.length} ไฟล์ · ${data.length.toLocaleString()} รายการ` : 'ยังไม่มีข้อมูล'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Data</h2>
          <p className="text-gray-600 mb-6">
            อัพโหลดไฟล์ Excel รายงานยอดขาย รองรับหลายไฟล์พร้อมกัน
          </p>
          <FileUpload onDataLoaded={handleDataLoaded} />

          {/* Upload to Database Button */}
          {data.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={uploadToDatabase}
                disabled={dbStatus === 'uploading'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {dbStatus === 'uploading' ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Database size={20} />
                )}
                {dbStatus === 'uploading' ? 'กำลังอัพโหลด...' : 'อัพโหลดเข้า Database'}
              </button>

              {dbStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 size={18} />
                  {dbMessage}
                </div>
              )}
              {dbStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                  <AlertCircle size={18} />
                  {dbMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {data.length > 0 ? (
          <Dashboard data={data} />
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for Data</h3>
              <p className="text-gray-500">
                Upload an Excel file above to see your sales dashboard. 
                Supported formats: .xlsx, .xls, .csv
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
