import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { LayoutDashboard } from 'lucide-react';

function App() {
  const [data, setData] = useState<any[]>([]);

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
            {data.length > 0 ? `${data.length} records loaded` : 'No data loaded'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Data</h2>
          <p className="text-gray-600 mb-6">
            Upload your sales report Excel file to generate insights.
          </p>
          <FileUpload onDataLoaded={setData} />
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
