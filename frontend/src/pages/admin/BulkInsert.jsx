import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';

// Required columns that MUST exist in the file (case-insensitive match)
const REQUIRED_COLS = ['stb_number', 'name', 'mobile', 'village'];
const ALL_COLS = ['stb_number', 'name', 'mobile', 'village', 'street', 'has_amplifier', 'alternate_mobile', 'full_address', 'status'];

const BulkInsert = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [dragging, setDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [rows, setRows] = useState([]);       // parsed preview rows
    const [colErrors, setColErrors] = useState([]); // missing required columns
    const [parseError, setParseError] = useState('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // API response

    // ── Parse the selected file ──────────────────────────────────────────────
    const parseFile = (file) => {
        setResult(null);
        setParseError('');
        setColErrors([]);
        setRows([]);
        setFileName(file.name);

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            setParseError('❌ Unsupported file type. Please upload .xlsx, .xls, or .csv');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (json.length === 0) {
                    setParseError('❌ The file is empty or has no data rows.');
                    return;
                }

                // Normalize header keys to lowercase with underscores
                const normalized = json.map((row) => {
                    const clean = {};
                    Object.keys(row).forEach((k) => {
                        const normKey = k.trim().toLowerCase().replace(/\s+/g, '_');
                        clean[normKey] = row[k];
                    });
                    return clean;
                });

                // Check required columns
                const firstRow = normalized[0];
                const missing = REQUIRED_COLS.filter((c) => !(c in firstRow));
                if (missing.length > 0) {
                    setColErrors(missing);
                    setRows(normalized.slice(0, 5)); // preview anyway
                    return;
                }

                setRows(normalized);
            } catch (err) {
                setParseError('❌ Failed to parse file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) parseFile(file);
    };

    // Drag-and-drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) parseFile(file);
    }, []);

    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);

    // ── Submit to backend ────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!rows.length || colErrors.length) return;
        setLoading(true);
        setResult(null);
        try {
            const { data } = await api.post('/api/customers/bulk', { rows });
            setResult({ type: 'success', ...data });
        } catch (err) {
            setResult({ type: 'error', message: err.response?.data?.error || 'Bulk upload failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Download sample template ─────────────────────────────────────────────
    const downloadSample = () => {
        const sample = [
            { stb_number: 'STB001', name: 'Ravi Kumar', mobile: '9876543210', village: 'Hosur', street: 'Main St', has_amplifier: 'NO', alternate_mobile: '', full_address: '', status: 'active' },
            { stb_number: 'STB002', name: 'Priya Devi', mobile: '9123456789', village: 'Krishnagiri', street: '', has_amplifier: 'YES', alternate_mobile: '9000000001', full_address: 'Door 5, Lake Road', status: 'active' },
        ];
        const ws = XLSX.utils.json_to_sheet(sample);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Customers');
        XLSX.writeFile(wb, 'bulk_stb_template.xlsx');
    };

    const previewRows = rows.slice(0, 10);
    const hasValidData = rows.length > 0 && colErrors.length === 0 && !parseError;

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">

                {/* Header */}
                <div className="page-header d-flex align-items-center justify-content-between">
                    <div>
                        <h2>📦 Bulk STB Import</h2>
                        <p>Upload an Excel (.xlsx/.xls) or CSV file to insert multiple customers at once.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button onClick={downloadSample} className="btn" style={{ color: '#f5a623', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, fontSize: '0.85rem' }}>
                            ⬇ Sample Template
                        </button>
                        <button onClick={() => navigate('/admin/customers/new')} className="btn" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>
                            ← Single Insert
                        </button>
                    </div>
                </div>

                {/* Column guide */}
                <div className="glass-card p-3 mb-4 fade-in-up" style={{ borderRadius: 12 }}>
                    <p style={{ color: '#8890a6', fontSize: '0.82rem', marginBottom: 8, fontWeight: 600 }}>📋 REQUIRED COLUMNS (exact header names):</p>
                    <div className="d-flex flex-wrap gap-2">
                        {ALL_COLS.map((c) => (
                            <span key={c} style={{
                                fontSize: '0.78rem', padding: '3px 10px', borderRadius: 6, fontFamily: 'monospace',
                                background: REQUIRED_COLS.includes(c) ? 'rgba(233,69,96,0.15)' : 'rgba(136,144,166,0.1)',
                                color: REQUIRED_COLS.includes(c) ? '#e94560' : '#8890a6',
                                border: `1px solid ${REQUIRED_COLS.includes(c) ? 'rgba(233,69,96,0.3)' : 'rgba(136,144,166,0.2)'}`,
                            }}>
                                {c}{REQUIRED_COLS.includes(c) ? ' *' : ''}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Drop zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-card fade-in-up"
                    style={{
                        borderRadius: 16,
                        border: dragging ? '2px dashed #e94560' : '2px dashed rgba(30,45,80,0.8)',
                        background: dragging ? 'rgba(233,69,96,0.05)' : 'rgba(22,33,62,0.4)',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '1.5rem',
                    }}>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileChange} />
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                    <p style={{ color: '#e8e8f0', fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>
                        {fileName ? `📄 ${fileName}` : 'Drag & drop your Excel / CSV file here'}
                    </p>
                    <p style={{ color: '#8890a6', fontSize: '0.85rem', margin: 0 }}>
                        {fileName ? 'Click to replace file' : 'or click to browse — supports .xlsx, .xls, .csv'}
                    </p>
                </div>

                {/* Parse errors */}
                {parseError && (
                    <div className="glass-card p-3 mb-4 fade-in-up" style={{ border: '1px solid rgba(233,69,96,0.3)', background: 'rgba(233,69,96,0.05)', borderRadius: 12 }}>
                        <p style={{ color: '#e94560', margin: 0 }}>{parseError}</p>
                    </div>
                )}

                {/* Missing columns warning */}
                {colErrors.length > 0 && (
                    <div className="glass-card p-3 mb-4 fade-in-up" style={{ border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.05)', borderRadius: 12 }}>
                        <p style={{ color: '#f5a623', fontWeight: 600, marginBottom: 6 }}>⚠️ Missing required columns in your file:</p>
                        <div className="d-flex gap-2 flex-wrap">
                            {colErrors.map((c) => (
                                <span key={c} style={{ fontFamily: 'monospace', background: 'rgba(245,166,35,0.2)', color: '#f5a623', padding: '2px 10px', borderRadius: 6, fontSize: '0.85rem' }}>{c}</span>
                            ))}
                        </div>
                        <p style={{ color: '#8890a6', fontSize: '0.82rem', marginTop: 8, marginBottom: 0 }}>
                            Download the sample template above to see the correct column names.
                        </p>
                    </div>
                )}

                {/* Data preview */}
                {previewRows.length > 0 && (
                    <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <p style={{ margin: 0, fontWeight: 600, color: '#e8e8f0' }}>
                                👁 Preview — {rows.length} row{rows.length !== 1 ? 's' : ''} detected
                                {rows.length > 10 && <span style={{ color: '#8890a6', fontWeight: 400 }}> (showing first 10)</span>}
                            </p>
                            {hasValidData && (
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="btn-primary-custom d-flex align-items-center gap-2"
                                    style={{ fontSize: '0.9rem' }}>
                                    {loading
                                        ? <><span className="spinner-border spinner-border-sm" /> Uploading {rows.length} rows...</>
                                        : <>📤 Upload {rows.length} Rows to Database</>}
                                </button>
                            )}
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className="table-dark-custom" style={{ minWidth: 700, fontSize: '0.82rem' }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        {REQUIRED_COLS.map((c) => <th key={c} style={{ color: '#e94560' }}>{c} *</th>)}
                                        {['street', 'has_amplifier', 'status'].map((c) => <th key={c}>{c}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.map((row, i) => {
                                        const isValid = REQUIRED_COLS.every((c) => row[c]?.toString().trim());
                                        return (
                                            <tr key={i} style={{ background: isValid ? 'transparent' : 'rgba(233,69,96,0.05)' }}>
                                                <td style={{ color: '#8890a6' }}>{i + 1}</td>
                                                {REQUIRED_COLS.map((c) => (
                                                    <td key={c} style={{ color: row[c] ? '#e8e8f0' : '#e94560' }}>
                                                        {row[c]?.toString() || <span style={{ color: '#e94560', fontSize: '0.75rem' }}>MISSING</span>}
                                                    </td>
                                                ))}
                                                {['street', 'has_amplifier', 'status'].map((c) => (
                                                    <td key={c} style={{ color: '#8890a6' }}>{row[c]?.toString() || '—'}</td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="glass-card p-4 fade-in-up" style={{
                        borderRadius: 16,
                        border: result.type === 'success' ? '1px solid rgba(40,224,126,0.3)' : '1px solid rgba(233,69,96,0.3)',
                        background: result.type === 'success' ? 'rgba(40,224,126,0.05)' : 'rgba(233,69,96,0.05)',
                    }}>
                        {result.type === 'success' ? (
                            <>
                                <h5 style={{ color: '#28e07e', fontWeight: 700, marginBottom: 12 }}>✅ Upload Complete</h5>
                                <div className="d-flex gap-4 flex-wrap mb-3">
                                    <div className="text-center">
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#28e07e' }}>{result.inserted}</div>
                                        <div style={{ color: '#8890a6', fontSize: '0.8rem' }}>Inserted / Updated</div>
                                    </div>
                                    <div className="text-center">
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e94560' }}>{result.skipped}</div>
                                        <div style={{ color: '#8890a6', fontSize: '0.8rem' }}>Skipped</div>
                                    </div>
                                </div>
                                {result.errors?.length > 0 && (
                                    <>
                                        <p style={{ color: '#f5a623', fontWeight: 600, marginBottom: 6 }}>⚠️ Rows with errors:</p>
                                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                            {result.errors.map((e, i) => (
                                                <div key={i} style={{ fontSize: '0.8rem', color: '#8890a6', padding: '3px 0', borderBottom: '1px solid rgba(30,45,80,0.4)' }}>
                                                    Row {e.row} — STB: <code style={{ color: '#f5a623' }}>{e.stb}</code> — {e.reason}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <div className="d-flex gap-3 mt-3">
                                    <button onClick={() => navigate('/admin/customers')} className="btn-primary-custom">
                                        View Customers →
                                    </button>
                                    <button onClick={() => { setResult(null); setRows([]); setFileName(''); }} className="btn" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>
                                        Upload Another File
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#e94560', margin: 0 }}>❌ {result.message}</p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default BulkInsert;
