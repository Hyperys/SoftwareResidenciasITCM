import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "../componentes/compartidos/Icono";
import { Modal } from "../componentes/compartidos/Modal";
import { useNotification } from "../contexto/ContextoNotificaciones";

// ══════════════════════════════════════════════════════════════
// PÁGINA: CARRERAS — Catálogo de carreras y especialidades
// ══════════════════════════════════════════════════════════════

export function Carreras() {
    const { notify } = useNotification();
    const [carreras, setCarreras] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [editando, setEditando] = useState(null);   // carrera obj o null
    const [showSpec, setShowSpec] = useState(null);   // carrera obj
    const [especialidades, setEspecialidades] = useState([]);
    const [search, setSearch] = useState("");
    const [formNombre, setFormNombre] = useState("");
    const [formHabilitada, setFormHabilitada] = useState(true);
    const [_formEsp, setFormEsp] = useState("");     // nueva especialidad
    const [loading, setLoading] = useState(false);

    const cargarCarreras = () => {
        fetch('/api/carreras/habilitadas')
            .then(r => r.json())
            .then(data => setCarreras(Array.isArray(data) ? data : []))
            .catch(() => setCarreras([]));
    };

    useEffect(() => { cargarCarreras(); }, []);

    const cargarEspecialidades = (carreraId) => {
        fetch(`/api/especialidades/${carreraId}`)
            .then(r => r.json())
            .then(data => setEspecialidades(Array.isArray(data) ? data : []))
            .catch(() => setEspecialidades([]));
    };

    const abrirNueva = () => {
        setEditando(null);
        setFormNombre("");
        setFormHabilitada(true);
        setShowAdd(true);
    };

    const abrirEditar = (c) => {
        setEditando(c);
        setFormNombre(c.nombre);
        setFormHabilitada(c.habilitada !== false);
        setShowAdd(true);
    };

    const guardarCarrera = () => {
        if (!formNombre.trim()) return;
        setLoading(true);
        // Para v1.0 solo muestra confirmación — endpoint POST/PUT de carreras
        // puede agregarse al backend si se requiere crear desde UI
        notify(`Carrera "${formNombre}" guardada (requiere endpoint POST /api/carreras)`, 'info');
        setLoading(false);
        setShowAdd(false);
        cargarCarreras();
    };

    const filtered = useMemo(() => {
        if (!search) return carreras;
        const s = search.toLowerCase();
        return carreras.filter(c => c.nombre.toLowerCase().includes(s));
    }, [search, carreras]);

    return (
        <div>
            <div className="page-header">
                <h1>Carreras y especialidades</h1>
                <p>Catálogo de carreras habilitadas en el sistema</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon"><span className="material-symbols-rounded" style={{fontSize:26,color:'#2f4d80'}}>school</span></div>
                    <div className="stat-label">Total de carreras</div>
                    <div className="stat-value">{carreras.length}</div>
                    <div className="stat-sub">Registradas en el sistema</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><span className="material-symbols-rounded" style={{fontSize:26,color:'#2f4d80'}}>list_alt</span></div>
                    <div className="stat-label">Especialidades totales</div>
                    <div className="stat-value">{especialidades.length || "—"}</div>
                    <div className="stat-sub">Selecciona una carrera para ver</div>
                </div>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar carrera..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="topbar-btn btn-primary" onClick={abrirNueva}>
                        <Icon n="plus" /> Añadir carrera
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Habilitada</th>
                            <th>Fecha de registro</th>
                            <th>Última modificación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                No hay carreras registradas
                            </td></tr>
                        ) : filtered.map(c => (
                            <tr key={c.id}>
                                <td className="td-name" title={c.nombre}>{c.nombre}</td>
                                <td>
                                    <span className={`badge ${c.habilitada ? "badge-green" : "badge-red"}`}>
                                        {c.habilitada ? "Habilitada" : "Deshabilitada"}
                                    </span>
                                </td>
                                <td style={{ fontSize: 11 }}>
                                    {c.fecha_registro
                                        ? new Date(c.fecha_registro).toLocaleDateString('es-MX')
                                        : "—"}
                                </td>
                                <td style={{ fontSize: 11 }}>
                                    {c.fecha_modificacion
                                        ? new Date(c.fecha_modificacion).toLocaleDateString('es-MX')
                                        : "—"}
                                </td>
                                <td>
                                    <div className="inline-actions">
                                        <button className="action-btn ab-edit"
                                            onClick={() => abrirEditar(c)}>Editar</button>
                                        <button className="action-btn ab-view"
                                            onClick={() => { setShowSpec(c); cargarEspecialidades(c.id); }}>
                                            Ver especialidades
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="table-footer">
                    <span>Número de registros: {filtered.length}</span>
                </div>
            </div>

            {/* Modal nueva/editar carrera */}
            <Modal show={showAdd} onClose={() => setShowAdd(false)}
                title={editando ? "Editar carrera" : "Nueva carrera"} size="sm"
                footer={<>
                    <button className="topbar-btn btn-ghost" onClick={() => setShowAdd(false)}>
                        Cancelar
                    </button>
                    <button className="topbar-btn btn-primary" onClick={guardarCarrera} disabled={loading}>
                        <Icon n="check" /> {loading ? "Guardando..." : "Guardar"}
                    </button>
                </>}>
                <div className="form-grid" style={{ gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">
                            Nombre de la carrera <span className="req">*</span>
                        </label>
                        <input className="form-input"
                            placeholder="Ej. Ingeniería en Sistemas Computacionales"
                            value={formNombre}
                            onChange={e => setFormNombre(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-row">
                            <input type="checkbox" checked={formHabilitada}
                                onChange={e => setFormHabilitada(e.target.checked)} />
                            <span>Habilitada</span>
                        </label>
                    </div>
                </div>
            </Modal>

            {/* Modal especialidades */}
            <Modal show={!!showSpec} onClose={() => { setShowSpec(null); setEspecialidades([]); }}
                title="Especialidades" sub={showSpec?.nombre} size="sm"
                footer={<button className="topbar-btn btn-ghost"
                    onClick={() => { setShowSpec(null); setEspecialidades([]); }}>
                    Cerrar
                </button>}>
                <div>
                    {especialidades.length === 0
                        ? <p style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: 16 }}>
                            No hay especialidades registradas
                        </p>
                        : especialidades.map(esp => (
                            <div className="doc-item" key={esp.id}>
                                <span className="material-symbols-rounded" style={{fontSize:16,color:'#065F46'}}>check_circle</span>
                                <span className="doc-name">{esp.nombre}</span>
                            </div>
                        ))
                    }
                    <button className="doc-add" style={{ marginTop: 8 }}>
                        <Icon n="plus" /> Añadir especialidad
                    </button>
                </div>
            </Modal>
        </div>
    );
}
