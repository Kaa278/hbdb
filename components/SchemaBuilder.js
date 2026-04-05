import { useState } from 'react';
import { Plus, Trash2, Database } from 'lucide-react';

export default function SchemaBuilder({ activeDb, onSubmit, onCancel, isLoading }) {
    const [tableName, setTableName] = useState('');

    // Default first column is usually an ID
    const [columns, setColumns] = useState([
        { id: Date.now(), name: 'id', type: 'INT', length: '11', primaryKey: true, autoIncrement: true, nullable: false }
    ]);

    const addColumn = () => {
        setColumns([...columns, { id: Date.now(), name: '', type: 'VARCHAR', length: '255', primaryKey: false, autoIncrement: false, nullable: true }]);
    };

    const removeColumn = (id) => {
        if (columns.length === 1) return; // Prevent deleting the last column
        setColumns(columns.filter(col => col.id !== id));
    };

    const updateColumn = (id, field, value) => {
        setColumns(columns.map(col => {
            if (col.id === id) {
                // If checking auto_increment, force INT and primaryKey (simplified rule for MariaDB)
                if (field === 'autoIncrement' && value === true) {
                    return { ...col, [field]: value, type: 'INT', primaryKey: true };
                }
                return { ...col, [field]: value };
            }
            return col;
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tableName) return alert('Table name is required');
        if (columns.some(c => !c.name)) return alert('All columns must have a name');

        onSubmit({ db: activeDb, tableName, columns });
    };

    const commonTypes = ['INT', 'VARCHAR', 'TEXT', 'DATE', 'DATETIME', 'BOOLEAN', 'DECIMAL', 'LONGTEXT'];

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-2">
                        Table Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. products"
                        required
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all text-sm font-bold text-gray-900 shadow-inner"
                    />
                </div>
                <div className="hidden sm:block">
                    <div className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-black uppercase tracking-widest">
                        {columns.length} Columns
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest">Columns Configuration</label>
                    <div className="hidden md:flex items-center gap-3 flex-1 ml-10 pr-12">
                        <div className="w-3/12 text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Name</div>
                        <div className="w-2/12 text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Type</div>
                        <div className="w-2/12 text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Length</div>
                        <div className="flex-1 text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Options</div>
                    </div>
                </div>

                {columns.map((col, index) => (
                    <div key={col.id} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-all group">
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-50 text-[10px] font-bold text-gray-400">
                            {index + 1}
                        </div>

                        <input
                            type="text"
                            placeholder="Name"
                            required
                            value={col.name}
                            onChange={(e) => updateColumn(col.id, 'name', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                            className="w-full md:w-3/12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-gray-900 outline-none"
                        />

                        <select
                            value={col.type}
                            onChange={(e) => updateColumn(col.id, 'type', e.target.value)}
                            className="w-full md:w-2/12 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none"
                        >
                            {commonTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <input
                            type="text"
                            placeholder="Length/Values"
                            title="Length/Values (e.g. 255 for VARCHAR)"
                            value={col.length}
                            onChange={(e) => updateColumn(col.id, 'length', e.target.value)}
                            className="w-full md:w-2/12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none placeholder:text-xs"
                        />

                        <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-start flex-1 px-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={!col.nullable}
                                    onChange={(e) => updateColumn(col.id, 'nullable', !e.target.checked)}
                                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                                Not Null
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-blue-500 hover:text-blue-700">
                                <input
                                    type="checkbox"
                                    checked={col.primaryKey}
                                    onChange={(e) => updateColumn(col.id, 'primaryKey', e.target.checked)}
                                    className="rounded border-blue-400 text-blue-600 focus:ring-blue-600"
                                />
                                Primary
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-orange-500 hover:text-orange-700" title="Auto Increment">
                                <input
                                    type="checkbox"
                                    checked={col.autoIncrement}
                                    onChange={(e) => updateColumn(col.id, 'autoIncrement', e.target.checked)}
                                    className="rounded border-orange-400 text-orange-600 focus:ring-orange-600"
                                />
                                A_I
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeColumn(col.id)}
                            disabled={columns.length === 1}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-all md:opacity-0 md:group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="pt-2">
                <button
                    type="button"
                    onClick={addColumn}
                    className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Column
                </button>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all"
                >
                    <Database className="w-4 h-4 mr-2" />
                    {isLoading ? 'Creating...' : 'Create Table'}
                </button>
            </div>
        </form>
    );
}
