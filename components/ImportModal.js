import { useState } from 'react';
import { UploadCloud, Code, FileText } from 'lucide-react';
import Modal from './Modal';

export default function ImportModal({ isOpen, onClose, activeDb, onSuccess }) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setQuery(event.target.result);
        };
        reader.readAsText(file);
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!query) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/manage/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ db: activeDb, query })
            });
            const d = await res.json();
            if (res.ok) {
                alert('Import successful!');
                setQuery('');
                onSuccess();
                onClose();
            } else {
                alert(`Import Error: ${d.message}\n${d.error}`);
            }
        } catch (err) {
            alert('Import failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isLoading && onClose()} title="Import Data / Run SQL">
            <form onSubmit={handleImport} className="space-y-6">
                <p className="text-xs font-bold text-gray-500">
                    Target Database: <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{activeDb || 'None'}</span>
                </p>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:bg-gray-50 transition-colors text-center relative cursor-pointer group overflow-hidden">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">Upload SQL file</p>
                        <p className="text-xs text-gray-500 mt-1">.sql files up to 10MB</p>
                    </div>
                    <input
                        type="file"
                        accept=".sql,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-100"></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">OR PASTE SQL</p>
                    <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Code className="w-3.5 h-3.5" />
                            Raw SQL Query
                        </label>
                        <button
                            type="button"
                            onClick={() => setQuery(prev => prev + `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`)}
                            className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded transition-colors"
                        >
                            + Timestamp
                        </button>
                    </div>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="INSERT INTO users (name) VALUES ('John');"
                        className="w-full h-40 px-4 py-3 bg-gray-900 border border-gray-800 text-gray-100 font-mono text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
                        spellCheck="false"
                    ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || !query}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FileText className="w-4 h-4" />}
                        {isLoading ? 'Executing...' : 'Run Import'}
                    </button>
                </div>
            </form>
        </Modal >
    );
}
