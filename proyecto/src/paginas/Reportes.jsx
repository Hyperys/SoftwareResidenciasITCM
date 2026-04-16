import React from "react";
import { NAV_BLUE } from "../estilos/globales";

// ══════════════════════════════════════════════════════════════
// PÁGINA: REPORTES — Panel de generación de informes
// ══════════════════════════════════════════════════════════════

export function Reportes() {
    return (
        <div>
            <div className="page-header"><h1>Panel de reportes</h1><p>Informes y estadísticas del programa de residencias</p></div>
            <div className="grid-2" style={{ marginBottom: 24 }}>
                {[
                    { title: "Residentes por semestre", icon: "bar_chart", desc: "Distribución ENE-JUN / AGO-DIC por año" },
                    { title: "Expedientes por empresa", icon: "business", desc: "Ranking de empresas con más residentes" },
                    { title: "Estado de documentos", icon: "folder_open", desc: "Avance en entrega de documentos por residente" },
                    { title: "Reporte de asesores", icon: "person_search", desc: "Carga de asesoría por docente" }
                ].map((r, i) => (
                    <div className="stat-card" key={i} style={{ cursor: "pointer", display: "flex", gap: 18, alignItems: "center", padding: "22px 24px" }}>
                        <div style={{ flexShrink: 0 }}><span className="material-symbols-rounded" style={{fontSize:38,color:'#2f4d80'}}>{r.icon}</span></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: NAV_BLUE, fontSize: 15 }}>{r.title}</div>
                            <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{r.desc}</div>
                        </div>
                        <button className="topbar-btn btn-primary" style={{ marginLeft: "auto", fontSize: 12, padding: "9px 18px", flexShrink: 0 }}>Generar</button>
                    </div>
                ))}
            </div>
            <div className="card" style={{ width: "100%" }}>
                <div className="card-header"><span className="card-title">Filtros para reporte personalizado</span></div>
                <div style={{ padding: "20px 24px" }}>
                    <div className="form-grid form-grid-3" style={{ marginBottom: 18 }}>
                        <div className="form-group"><label className="form-label">Año</label><input className="form-select" placeholder="Año (ej. 2024)" /></div>
                        <div className="form-group"><label className="form-label">Semestre</label><select className="form-select"><option>Todos</option><option>ENE-JUN</option><option>AGO-DIC</option></select></div>
                        <div className="form-group"><label className="form-label">Carrera</label><select className="form-select"><option>Todas</option><option>Ingeniería en Sistemas Computacionales</option><option>Ingeniería Industrial</option></select></div>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button className="topbar-btn btn-secondary" style={{ border: "1.5px solid #D1DAE8", padding: "10px 20px", fontSize: 13 }}>Vista previa</button>
                        <button className="topbar-btn btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>Exportar PDF</button>
                        <button className="topbar-btn btn-primary" style={{ background: "#16A34A", padding: "10px 20px", fontSize: 13 }}>Exportar Excel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
