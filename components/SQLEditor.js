import { useState, useEffect } from 'react';
import { Play, Code, Database, X, Terminal, ChevronRight, Clock } from 'lucide-react';

export default function SQLEditor({ isOpen, onClose, activeDb, onSuccess }) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const getFormattedDate = () => {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    };

    const insertTimestamp = () => {
        const timestamp = `'${getFormattedDate()}'`;
        setQuery(prev => prev + timestamp);
    };

    const handleExecute = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const res = await fetch('/api/manage/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ db: activeDb, query })
            });
            const d = await res.json();

            if (res.ok) {
                setResults(d.results || { message: 'Query executed successfully.' });
                if (onSuccess) onSuccess();
            } else {
                setError(d.error || d.message || 'Execution failed');
            }
        } catch (err) {
            setError('Failed to connect to API');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`h-full bg-white border-l border-gray-100 transition-all duration-500 ease-in-out flex flex-col overflow-hidden shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]
            ${isOpen ? 'w-[450px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
        >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                            <Code className="w-4 h-4" />
                        </div>
                        SQL Editor
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-blue-500" />
                        {activeDb || 'System Root'}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Editor Section */}
            <div className="flex-1 flex flex-col min-h-0 p-6 space-y-4 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl relative group">
                    {/* Toolbar */}
                    <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30"></div>
                        </div>
                        <button
                            onClick={insertTimestamp}
                            title="Insert MariaDB Timestamp"
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-[9px] font-black uppercase text-gray-300 transition-colors"
                        >
                            <Clock className="w-3 h-3" />
                            Timestamp
                        </button>
                    </div>

                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="-- Run your SQL queries here...
SELECT * FROM users ORDER BY id DESC LIMIT 5;"
                        className="flex-1 w-full p-6 bg-transparent text-blue-100 font-mono text-xs focus:outline-none resize-none selection:bg-blue-500/30"
                        spellCheck="false"
                    ></textarea>

                    {/* Execute Button */}
                    <div className="absolute right-4 bottom-4">
                        <button
                            onClick={handleExecute}
                            disabled={isLoading || !query.trim()}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
                        >
                            {isLoading ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Play className="w-3.5 h-3.5 fill-current transition-transform" />
                            )}
                            {isLoading ? 'Running...' : 'Run Query'}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="h-[40%] flex flex-col space-y-2">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Console Output</h4>
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] shadow-inner relative group">
                        {!results && !error && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-1 opacity-50">
                                <Terminal className="w-6 h-6" />
                                <p className="font-bold uppercase tracking-widest text-[9px]">Ready</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-blue-400 space-y-2">
                                <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                                <p className="font-bold uppercase tracking-widest text-[9px]">Executing...</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600">
                                <pre className="whitespace-pre-wrap leading-relaxed transition-all">{error}</pre>
                            </div>
                        )}

                        {results && (
                            <div className="text-gray-800">
                                <pre className="whitespace-pre-wrap leading-relaxed text-blue-600 font-bold bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                    {typeof results === 'string' ? results : JSON.stringify(results, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
