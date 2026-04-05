import { useState, useEffect } from 'react';

export default function RecordForm({ columns, initialData = null, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData });
        } else {
            const defaultData = {};
            columns.forEach(col => {
                // If it's auto_increment or has a function default like current_timestamp(), 
                // we leave it empty so the DB handles it.
                const isFunctionDefault = col.Default && col.Default.toLowerCase().includes('(');
                if (col.Extra !== 'auto_increment' && !isFunctionDefault) {
                    defaultData[col.Field] = col.Default || '';
                } else if (isFunctionDefault) {
                    defaultData[col.Field] = ''; // Clear it so browser/user can override or DB handles it
                }
            });
            setFormData(defaultData);
        }
    }, [initialData, columns]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clean up data: remove empty strings so DB defaults kick in
        const cleanData = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] !== '' && formData[key] !== undefined && formData[key] !== null) {
                cleanData[key] = formData[key];
            }
        });

        onSubmit(cleanData);
    };

    // Filter out auto-increment fields from the form
    const editableColumns = columns.filter(col => col.Extra !== 'auto_increment');

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editableColumns.map((col) => (
                    <div key={col.Field} className={editableColumns.length === 1 ? 'col-span-2' : ''}>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">
                            {col.Field}
                            {col.Null === 'NO' && <span className="text-red-400 ml-0.5">*</span>}
                        </label>

                        {col.Type.includes('text') || col.Type.includes('long') ? (
                            <textarea
                                name={col.Field}
                                value={formData[col.Field] || ''}
                                onChange={handleChange}
                                required={col.Null === 'NO'}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all text-sm text-gray-900"
                                rows={3}
                            />
                        ) : (
                            <input
                                type={col.Type.includes('int') ? 'number' : 'text'}
                                name={col.Field}
                                value={formData[col.Field] || ''}
                                onChange={handleChange}
                                required={col.Null === 'NO'}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all text-sm text-gray-900"
                            />
                        )}
                        <p className="text-[10px] text-gray-400 mt-1 px-1">{col.Type}</p>
                    </div>
                ))}
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200"
                >
                    {isLoading ? 'Processing...' : (initialData ? 'Update Record' : 'Create Record')}
                </button>
            </div>
        </form>
    );
}
