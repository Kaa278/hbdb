import { Database, Table, ChevronRight, Layers, Trash2 } from 'lucide-react';

export default function Sidebar({
    databases,
    activeDb,
    onDbSelect,
    tables,
    activeTable,
    onTableSelect,
    onDropDb,
    onDropTable
}) {
    return (
        <aside className="w-64 min-h-screen bg-gray-50 border-r border-gray-200 flex flex-col shadow-inner">
            {/* Brand Header */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-200">
                        <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gray-900 tracking-tighter uppercase italic">KATHLYN</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">DB Manager</p>
                    </div>
                </div>
            </div>

            {/* Database Selector */}
            <div className="px-4 mb-6">
                <div className="relative group mb-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                        Active Database
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                            <select
                                value={activeDb}
                                onChange={(e) => onDbSelect(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all text-sm font-bold text-gray-700 appearance-none shadow-sm cursor-pointer hover:border-gray-300"
                            >
                                <option value="" disabled>Select Database</option>
                                {databases.map(db => (
                                    <option key={db} value={db}>{db}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 rotate-90 pointer-events-none" />
                        </div>
                        {activeDb && (
                            <button
                                onClick={() => onDropDb(activeDb)}
                                className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all shadow-sm group/drop"
                                title={`Drop Database ${activeDb}`}
                            >
                                <Trash2 className="w-4 h-4 group-hover/drop:scale-110 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openDbModal'))}
                    className="w-full py-2 bg-gray-900/5 border border-gray-900/10 text-gray-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all text-center border-dashed"
                >
                    + New Database
                </button>
            </div>

            {/* Table List */}
            <div className="flex-1 px-4 overflow-y-auto pb-6 custom-scrollbar">
                <p className="px-1 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                    Tables in {activeDb || '...'}
                </p>

                {!activeDb ? (
                    <div className="p-4 bg-gray-100 rounded-xl border border-dashed border-gray-200 text-center">
                        <p className="text-[11px] text-gray-400 font-medium">Select a database above to see tables</p>
                    </div>
                ) : tables.length === 0 ? (
                    <div className="p-4 bg-gray-100 rounded-xl border border-dashed border-gray-200 text-center">
                        <p className="text-[11px] text-gray-400 font-medium">No tables found</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {tables.map((table) => (
                            <div key={table} className="group flex items-center gap-1">
                                <button
                                    onClick={() => onTableSelect(table)}
                                    className={`flex-1 flex items-center justify-between px-3 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${activeTable === table
                                        ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 border border-gray-100 ring-1 ring-gray-900/5'
                                        : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Table className={`w-4 h-4 transition-colors ${activeTable === table ? 'text-gray-900' : 'text-gray-400'}`} />
                                        <span className="truncate">{table}</span>
                                    </div>
                                    {activeTable === table && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDropTable(activeDb, table);
                                    }}
                                    className="p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title={`Drop Table ${table}`}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Connection Info */}
            <div className="mt-auto p-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg shrink-0">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                        <p className="text-[11px] font-bold text-gray-700 truncate">Authenticated Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
