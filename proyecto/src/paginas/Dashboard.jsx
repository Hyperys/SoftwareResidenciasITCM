import React, { useState, useEffect } from "react";
import { Modal } from "../componentes/compartidos/Modal";
import { Icon } from "../componentes/compartidos/Icono";

// ══════════════════════════════════════════════════════════════
// PÁGINA: DASHBOARD / PANEL DE ADMINISTRACIÓN
// Props: setPage (función para navegar a otras páginas)
// ══════════════════════════════════════════════════════════════

export function Dashboard({ setPage }) {
    const [showBackup, setShowBackup] = useState(false);
    const [backupDone, setBackupDone] = useState(false);
    const [backupMsg, setBackupMsg] = useState('');
    const [backupErrs, setBackupErrs] = useState([]);
    const [backupLoading, setBackupLoading] = useState(false);
    const [stats, setStats] = useState({ total: '—', cerrados: '—', activos: '—', empresas: '—' });
    const [recientes, setRecientes] = useState([]);

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(r => r.json())
            .then(d => setStats({
                total: d.total_residentes ?? '—',
                cerrados: d.cerrados ?? '—',
                activos: d.activos ?? '—',
                empresas: d.total_empresas ?? '—'
            }))
            .catch(() => { });
        fetch('/api/residentes')
            .then(r => r.json())
            .then(d => setRecientes(Array.isArray(d) ? d.slice(0, 5) : []))
            .catch(() => { });
    }, []);

    const doBackup = async () => {
        setBackupLoading(true); setBackupErrs([]);
        try {
            const res = await fetch('/api/backup', { method: 'POST' });
            const data = await res.json();
            setBackupMsg(data.ruta || ''); setBackupErrs(data.errores || []); setBackupDone(true);
        } catch (e) {
            setBackupErrs(['Error de conexión']); setBackupDone(true);
        } finally { setBackupLoading(false); }
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="page-header" style={{ marginBottom: 0 }}><h1>Panel de administración</h1><p>Archivo de residencias · TECNM Ciudad Madero</p></div>
                <button className="topbar-btn btn-secondary" onClick={() => { setShowBackup(true); setBackupDone(false); }}><Icon n="backup" /> Copia de seguridad</button>
            </div>
            <div className="stat-grid">
                {[
                    { icon: "person", label: "Total residentes", val: stats.total, sub: "Registrados en el sistema" },
                    { icon: "task_alt", label: "Expedientes cerrados", val: stats.cerrados, sub: "Completados" },
                    { icon: "pending", label: "En proceso", val: stats.activos, sub: "Activos actualmente" },
                    { icon: "business", label: "Empresas", val: stats.empresas, sub: "En catálogo" }
                ].map((s, i) => (
                    <div className="stat-card" key={i}><div className="stat-icon"><span className="material-symbols-rounded" style={{fontSize:26,color:'#2f4d80'}}>{s.icon}</span></div><div className="stat-label">{s.label}</div><div className="stat-value">{s.val}</div><div className="stat-sub">{s.sub}</div></div>
                ))}
            </div>
            <div className="grid-2-1">
                <div className="card">
                    <div className="card-header"><span className="card-title">Modificados recientemente</span>
                        <button className="topbar-btn btn-primary" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => setPage("residents")}><Icon n="plus" /> Nuevo expediente</button>
                    </div>
                    <div className="recent-list">
                        {recientes.length === 0
                            ? <div style={{ padding: "20px 16px", color: "#94A3B8", fontSize: 13, textAlign: "center" }}>No hay expedientes registrados</div>
                            : recientes.map((r, i) => (
                                <div className="recent-item" key={i} onClick={() => setPage("residents")}>
                                    <div className="recent-avatar">{(r.nombres || '?').charAt(0)}{(r.apellidos || '?').charAt(0)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div className="recent-name">{r.nombre_completo}</div>
                                        <div className="recent-meta">{r.empresa || '—'} · {r.semestre}</div>
                                    </div>
                                    <div className="recent-ctrl">[{r.num_control}]</div>
                                    <span className={`badge badge-status ${r.estado === 'cerrado' ? 'badge-green' : 'badge-yellow'}`}>
                                        {r.estado === 'cerrado' ? 'Cerrado' : 'Activo'}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="table-footer"><span>Mostrando {recientes.length} registros recientes</span><button className="action-btn ab-view" onClick={() => setPage("residents")}>Ver todos →</button></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
                    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}><div className="card-header"><span className="card-title">Catálogo de empresas</span></div><div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1, justifyContent: "center" }}><button className="topbar-btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setPage("companies")}>Ver empresas</button></div></div>
                    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}><div className="card-header"><span className="card-title">Carreras</span></div><div style={{ padding: "12px 16px", flex: 1, display: "flex", alignItems: "center" }}><button className="topbar-btn btn-secondary" style={{ width: "100%", justifyContent: "center", border: "1.5px solid #D1DAE8" }} onClick={() => setPage("careers")}>Ver carreras</button></div></div>
                    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}><div className="card-header"><span className="card-title">Informes y reportes</span></div><div style={{ padding: "12px 16px", flex: 1, display: "flex", alignItems: "center" }}><button className="topbar-btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setPage("reports")}>Panel de reportes</button></div></div>
                </div>
            </div>
            <Modal show={showBackup} onClose={() => { setShowBackup(false); setBackupDone(false); }}
                title="Copia de seguridad" size="sm"
                footer={<>
                    <button className="topbar-btn btn-ghost" onClick={() => { setShowBackup(false); setBackupDone(false); }}>
                        {backupDone ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!backupDone && (
                        <button className="topbar-btn btn-primary" onClick={doBackup} disabled={backupLoading}>
                            <Icon n="backup" /> {backupLoading ? 'Creando respaldo...' : 'Iniciar respaldo'}
                        </button>
                    )}
                </>}>
                {!backupDone ? (
                    <div>
                        <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "12px 14px", marginBottom: 14, border: "1px solid #BFDBFE", fontSize: 13, color: "#1E40AF" }}>
                            <strong>El respaldo incluye:</strong>
                            <ul style={{ margin: "8px 0 0 16px", padding: 0, fontSize: 12 }}>
                                <li>Dump completo de la base de datos MySQL</li>
                                <li>Copia de todos los PDFs en expedientespdf/</li>
                            </ul>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>
                            Se guardará en: <code style={{ color: "#2563eb" }}>backup/backup_YYYY-MM-DD_HH-MM/</code>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>{backupErrs.filter(e => !e.includes('omite')).length === 0
                            ? <span className="material-symbols-rounded" style={{fontSize:48,color:'#10B981'}}>check_circle</span>
                            : <span className="material-symbols-rounded" style={{fontSize:48,color:'#F59E0B'}}>warning</span>}</div>
                        <div style={{ fontWeight: 700, color: "#065F46", fontSize: 15, marginBottom: 6 }}>Respaldo completado</div>
                        <div style={{ fontSize: 11, color: "#64748B", wordBreak: "break-all", marginBottom: 8 }}>{backupMsg}</div>
                        {backupErrs.length > 0 && (
                            <div style={{ background: "#FEF3C7", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#92400E", textAlign: "left" }}>
                                {backupErrs.map((e, i) => <div key={i}>⚠ {e}</div>)}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
