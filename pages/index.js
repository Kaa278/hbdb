import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, Search, RefreshCw, LayoutTemplate, ShieldAlert, Database as DbIcon, Upload, Download, Code } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import RecordForm from '../components/RecordForm';
import SchemaBuilder from '../components/SchemaBuilder';
import ImportModal from '../components/ImportModal';
import ExportModal from '../components/ExportModal';
import SQLEditor from '../components/SQLEditor';
import { LogOut, User as UserIcon } from 'lucide-react';


export default function Home() {
  const [databases, setDatabases] = useState([]);
  const [activeDb, setActiveDb] = useState('');
  const [tables, setTables] = useState([]);
  const [activeTable, setActiveTable] = useState('');
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false); // Form modal
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSqlEditorOpen, setIsSqlEditorOpen] = useState(false);
  const [newDbName, setNewDbName] = useState('');

  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [user, setUser] = useState(null);


  // Expose DB modal to Sidebar
  useEffect(() => {
    const handleOpenDb = () => setIsDbModalOpen(true);
    window.addEventListener('openDbModal', handleOpenDb);
    return () => window.removeEventListener('openDbModal', handleOpenDb);
  }, []);

  // Initial load: Fetch all databases and user info
  useEffect(() => {
    fetchDatabases();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };


  // When database changes, fetch its tables
  useEffect(() => {
    if (activeDb) {
      fetchTables(activeDb);
    }
  }, [activeDb]);

  // When table changes, fetch its data
  useEffect(() => {
    if (activeDb && activeTable) {
      fetchSchemaAndData(activeDb, activeTable);
    }
  }, [activeDb, activeTable]);

  const fetchDatabases = async () => {
    setErrorInfo(null);
    try {
      const res = await fetch('/api/databases');
      const d = await res.json();
      if (res.ok && d.success) {
        setDatabases(d.databases || []);
        if (d.databases?.length > 0) setActiveDb(d.databases[0]);
      } else {
        setErrorInfo(d);
      }
    } catch (err) {
      console.error('Failed to fetch databases', err);
      setErrorInfo({ message: 'Connection Error', hint: 'Check your .env and STB reachability.' });
    }
  };

  const fetchTables = async (dbName) => {
    setTables([]); // Clear existing
    setActiveTable('');
    try {
      const res = await fetch(`/api/tables?db=${dbName}`);
      const d = await res.json();
      if (res.ok && d.success) {
        setTables(d.tables || []);
        if (d.tables?.length > 0) setActiveTable(d.tables[0]);
      }
    } catch (err) {
      console.error('Failed to fetch tables', err);
    }
  };

  const fetchSchemaAndData = async (dbName, tableName) => {
    setIsFetchingData(true);
    try {
      // 1. Get Schema
      const schemaRes = await fetch(`/api/schema?db=${dbName}&table=${tableName}`);
      const schemaData = await schemaRes.json();

      // 2. Get Data
      const dataRes = await fetch(`/api/data?db=${dbName}&table=${tableName}`);
      const rowData = await dataRes.json();

      if (schemaRes.ok) setColumns(schemaData.columns || []);
      if (dataRes.ok) setData(rowData.data || []);
    } catch (err) {
      console.error('Fetch error', err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleDropDatabase = async (dbName) => {
    if (confirm(`WARING: Are you sure you want to PERMANENTLY DROP database "${dbName}"? All tables and data will be lost.`)) {
      try {
        const res = await fetch('/api/manage/database', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: dbName })
        });
        if (res.ok) {
          fetchDatabases();
          setActiveDb('');
        }
      } catch (err) {
        console.error('Drop DB error', err);
      }
    }
  };

  const handleDropTable = async (dbName, tableName) => {
    if (confirm(`WARNING: Are you sure you want to PERMANENTLY DROP table "${dbName}.${tableName}"? All data will be lost.`)) {
      try {
        const res = await fetch('/api/manage/table', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ db: dbName, tableName })
        });
        if (res.ok) {
          fetchTables(dbName);
        }
      } catch (err) {
        console.error('Drop table error', err);
      }
    }
  };

  const handleDelete = async (pkField, id) => {
    if (confirm(`Delete record with ${pkField}=${id} in ${activeDb}.${activeTable}?`)) {
      try {
        const res = await fetch(`/api/data?db=${activeDb}&table=${activeTable}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pk_field: pkField, id })
        });
        if (res.ok) fetchSchemaAndData(activeDb, activeTable);
      } catch (err) {
        console.error('Delete error', err);
      }
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const isEditing = !!editingRecord;
      const method = isEditing ? 'PUT' : 'POST';
      const pkField = columns.find(c => c.Key === 'PRI')?.Field || columns[0].Field;

      const payload = { ...formData };
      if (isEditing) {
        payload.id = editingRecord[pkField];
        payload.pk_field = pkField;
      }

      const res = await fetch(`/api/data?db=${activeDb}&table=${activeTable}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSchemaAndData(activeDb, activeTable);
      } else {
        const errData = await res.json();
        alert(`${errData.message}: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/manage/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDbName })
      });
      const d = await res.json();
      if (res.ok) {
        setIsDbModalOpen(false);
        setNewDbName('');
        fetchDatabases();
      } else {
        alert(d.message);
      }
    } catch (err) {
      alert('Failed to create database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async (payload) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/manage/table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (res.ok) {
        setIsSchemaModalOpen(false);
        fetchTables(activeDb);
      } else {
        alert(d.message || d.error);
      }
    } catch (err) {
      alert('Failed to create table');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Head>
        <title>GodMode | {activeDb}.{activeTable || 'Dashboard'}</title>
      </Head>

      <Sidebar
        databases={databases}
        activeDb={activeDb}
        onDbSelect={setActiveDb}
        tables={tables}
        activeTable={activeTable}
        onTableSelect={setActiveTable}
        onDropDb={handleDropDatabase}
        onDropTable={handleDropTable}
      />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 bg-gray-900 text-[10px] font-black text-white rounded uppercase tracking-widest">
              Local Connection
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{activeDb}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button
              onClick={() => setIsSqlEditorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 text-xs font-bold text-blue-700 transition-colors shadow-sm shadow-blue-500/5"
            >
              <Code className="w-3.5 h-3.5" /> SQL Editor
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">MariaDB Server</span>
            </div>

            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter leading-none">{user.name}</span>
                  <span className="text-[9px] font-bold text-gray-400 leading-none mt-1">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
          </div>

        </header>

        {/* Main Content + Side Panels Wrapper */}
        <div className="flex-1 flex overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 p-8 overflow-y-auto overflow-x-hidden pt-10">
            <div className="max-w-7xl mx-auto space-y-8">

              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    Table View Mode
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                    {activeTable || 'Select a table'}
                    {activeTable && (
                      <button
                        onClick={() => fetchSchemaAndData(activeDb, activeTable)}
                        className={`p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all text-gray-400 hover:text-gray-900 ${isFetchingData ? 'animate-spin' : ''}`}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    )}
                  </h1>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  {activeTable && (
                    <div className="relative flex-1 md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search in ${activeTable}...`}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-900/[0.03] focus:border-gray-900 transition-all text-sm font-medium shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex break-words">
                    <button
                      onClick={() => setIsSchemaModalOpen(true)}
                      className="inline-flex items-center px-5 py-3 bg-white border border-gray-200 text-gray-900 rounded-l-2xl shadow-sm text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all border-r-0"
                    >
                      <LayoutTemplate className="w-4 h-4 mr-2" />
                      New Table
                    </button>
                    {activeTable && (
                      <button
                        onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}
                        className="inline-flex items-center px-5 py-3 bg-gray-900 text-white rounded-r-2xl shadow-xl shadow-gray-300/50 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Record
                      </button>
                    )}
                    {!activeTable && (
                      <div className="px-5 py-3 bg-gray-100 text-transparent rounded-r-2xl border-l border-white w-3"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error State */}
              {errorInfo && (
                <div className="p-8 bg-white border border-red-100 rounded-[2rem] shadow-2xl shadow-red-100/20">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Connection Problem Detected</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">We couldn't connect to your MariaDB server. This usually happens when the host IP or credentials in your `.env` are incorrect.</p>

                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-6 font-mono text-sm text-red-700">
                        <p className="font-bold mb-1 uppercase text-[10px] tracking-widest text-red-500">Error Message:</p>
                        {errorInfo.message}: {errorInfo.error || "Internal Server Error"}
                      </div>

                      <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-gray-900">
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-2 px-1 italic">Diagnostic Hint:</p>
                        <p className="text-sm font-bold text-gray-700 leading-relaxed underline decoration-gray-200 underline-offset-4">{errorInfo.hint || "Check your .env settings and STB connection."}</p>
                      </div>

                      <button
                        onClick={fetchDatabases}
                        className="mt-8 px-8 py-3.5 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-300 uppercase tracking-widest flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reconnect to Server
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Section */}
              {!errorInfo && (
                <div className="pb-10">
                  <DataGrid
                    columns={columns}
                    data={filteredData}
                    onEdit={(row) => { setEditingRecord(row); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    isLoading={isFetchingData}
                  />

                  {activeTable && (
                    <div className="mt-6 flex justify-between items-center px-4 py-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                        DB SUITE: Accessing `{activeDb}.{activeTable}`
                      </p>
                      <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.1em] px-3 py-1 bg-yellow-400 rounded-full">
                        {filteredData.length} Records Found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inline Side Panel: SQL Editor */}
          <SQLEditor
            isOpen={isSqlEditorOpen}
            onClose={() => setIsSqlEditorOpen(false)}
            activeDb={activeDb}
            onSuccess={() => {
              fetchTables(activeDb);
              if (activeTable) fetchSchemaAndData(activeDb, activeTable);
            }}
          />
        </div>
      </main>

      {/* Record Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
        title={editingRecord ? `Edit row in ${activeTable}` : `Add new row to ${activeTable}`}
      >
        <RecordForm
          columns={columns}
          initialData={editingRecord}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Modal>

      {/* Create Database Modal */}
      <Modal
        isOpen={isDbModalOpen}
        onClose={() => !isLoading && setIsDbModalOpen(false)}
        title="Create New Database"
      >
        <form onSubmit={handleCreateDatabase} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Database Name</label>
            <input
              type="text"
              autoFocus
              required
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              placeholder="e.g. production_db"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all text-sm font-semibold"
            />
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gray-900 text-white text-xs uppercase tracking-widest font-black rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Database'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Schema Builder Modal */}
      {isSchemaModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto w-full h-full bg-gray-900/60 backdrop-blur-sm">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <LayoutTemplate className="w-6 h-6 text-blue-600" />
                    Create New Table
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Configure your schema for the <span className="text-gray-700">{activeDb}</span> database.</p>
                </div>
                <button
                  onClick={() => !isLoading && setIsSchemaModalOpen(false)}
                  className="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 shadow-sm transition-all"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-6 pb-8 bg-white max-h-[75vh] overflow-y-auto">
                <SchemaBuilder
                  activeDb={activeDb}
                  onSubmit={handleCreateTable}
                  onCancel={() => !isLoading && setIsSchemaModalOpen(false)}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import / SQL Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        activeDb={activeDb}
        onSuccess={() => {
          fetchTables(activeDb);
          if (activeTable) fetchSchemaAndData(activeDb, activeTable);
        }}
      />

      {/* Export SQL Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeDb={activeDb}
        activeTable={activeTable}
      />
    </div>
  );
}
