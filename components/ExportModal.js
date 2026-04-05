import { useState } from 'react';
import { Database, Table, Download } from 'lucide-react';
import Modal from './Modal';

export default function ExportModal({ isOpen, onClose, activeDb, activeTable }) {
    const [exportTarget, setExportTarget] = useState('table'); // 'table' or 'database'

    const handleExport = (e) => {
        e.preventDefault();
        if (!activeDb) return alert('No active database selected');

        const targetTable = exportTarget === 'database' ? 'all' : activeTable;
        if (!targetTable) return alert('No active table selected');

        window.open(`/api/manage/export?db=${activeDb}&table=${targetTable}`, '_blank');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export SQL Dump">
            <form onSubmit={handleExport} className="space-y-6">
                <p className="text-xs font-bold text-gray-500">
                    SQL Dumps let you backup and restore your properties easily. Target Database: <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{activeDb || 'None'}</span>
                </p>

                <div className="space-y-3">
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Select Export Scope</label>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            disabled={!activeTable}
                            onClick={() => setExportTarget('table')}
                            className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center disabled:opacity-50
                  ${exportTarget === 'table' ? 'border-gray-900 bg-gray-900/5' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                        >
                            <Table className={`w-8 h-8 ${exportTarget === 'table' ? 'text-gray-900' : 'text-gray-400'}`} />
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-tight">Current Table</p>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mt-1">{activeTable || 'N/A'}</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setExportTarget('database')}
                            className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center 
                  ${exportTarget === 'database' ? 'border-gray-900 bg-gray-900/5' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                        >
                            <Database className={`w-8 h-8 ${exportTarget === 'database' ? 'text-gray-900' : 'text-gray-400'}`} />
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-tight">Entire Database</p>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mt-1">{activeDb || 'N/A'}</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gray-900/20 transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download .sql
                    </button>
                </div>
            </form>
        </Modal>
    );
}
