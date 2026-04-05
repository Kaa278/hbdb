import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';

export default function DataGrid({ columns, data, onEdit, onDelete, isLoading }) {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-500">Loading data...</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full p-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MoreHorizontal className="text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Records Found</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">This table appears to be empty. You can add a new record to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.Field}
                                scope="col"
                                className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                                <div className="flex items-center gap-1.5">
                                    {col.Field}
                                    {col.Key === 'PRI' && <span className="text-[9px] bg-gray-200 px-1 rounded text-gray-600">PK</span>}
                                </div>
                            </th>
                        ))}
                        <th scope="col" className="relative px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                    {data.map((row, idx) => {
                        // Find primary key value
                        const pkField = columns.find(c => c.Key === 'PRI')?.Field || columns[0].Field;
                        const pkValue = row[pkField];

                        return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors duration-150 group">
                                {columns.map((col) => {
                                    const value = row[col.Field]?.toString() || '';
                                    const isLong = value.length > 30;
                                    const displayValue = isLong ? value.substring(0, 30) + '...' : value;

                                    return (
                                        <td key={col.Field} className="px-6 py-4 whitespace-nowrap max-w-[200px] overflow-hidden">
                                            <span
                                                className={`text-sm ${col.Key === 'PRI' ? 'font-mono text-gray-400' : 'text-gray-600'}`}
                                                title={isLong ? value : ''}
                                            >
                                                {value ? displayValue : <span className="text-xs text-gray-300 italic">null</span>}
                                            </span>
                                        </td>
                                    );
                                })}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                            title="Edit record"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(pkField, pkValue)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete record"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
