import React, { useState, useEffect } from "react";
import { Icon } from "../componentes/compartidos/Icono";
import { ModalAsesor } from "../componentes/asesores/ModalAsesor";
import { DashboardCarga } from "./DashboardCarga";
import { useNotification } from "../contexto/ContextoNotificaciones";

// ══════════════════════════════════════════════════════════════
// PÁGINA: ASESORES — Catálogo y dashboard de carga
// ══════════════════════════════════════════════════════════════

export function Asesores() {
    const { alert } = useNotification();
    const [asesores, setAsesores] = useState([]);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState("");
    const [tipoF, setTipoF] = useState("");

    const cargarAsesores = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (tipoF) params.append('tipo', tipoF);
        fetch(`/api/asesores?${params}`)
            .then(r => r.json())
            .then(data => setAsesores(Array.isArray(data) ? data : []))
            .catch(() => setAsesores([]));
    };

    useEffect(() => { cargarAsesores(); }, [search, tipoF]);

    const abrirEditar = (a) => {
        fetch(`/api/asesores/${a.id}`)
            .then(r => r.json())
            .then(data => setModal(data))
            .catch(() => alert("Error al cargar asesor"));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Catálogo de asesores</h1>
                <p>Asesores internos y externos del programa de residencias</p>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar por nombre de asesor..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="filter-select" value={tipoF}
                        onChange={e => setTipoF(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="interno">Internos</option>
                        <option value="externo">Externos</option>
                    </select>
                    <button className="topbar-btn btn-primary" onClick={() => setModal("new")}>
                        <Icon n="plus" /> Nuevo asesor
                    </button>
                </div>
                <div style={{ overflowX: "auto", background: "#fff" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th><th>Tipo</th><th>Departamento</th>
                                <th>Puesto</th><th>Correo</th><th>Teléfono</th>
                                <th>Ext.</th><th>Habilitado</th>
                                <th>Última mod.</th><th>Fecha registro</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asesores.length === 0 ? (
                                <tr><td colSpan={11} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No hay asesores registrados
                                </td></tr>
                            ) : asesores.map(a => (
                                <tr key={a.id}>
                                    <td className="td-name" title={`${a.nombres} ${a.apellidos}`}>
                                        {a.nombres} {a.apellidos}
                                    </td>
                                    <td>
                                        <span className={`badge ${a.tipo === "interno" ? "badge-blue" : "badge-yellow"}`}>
                                            {a.tipo === "interno" ? "Interno" : "Externo"}
                                        </span>
                                    </td>
                                    <td title={a.departamento}>{a.departamento || "—"}</td>
                                    <td title={a.puesto}>{a.puesto || "—"}</td>
                                    <td style={{ color: "#2563eb", fontSize: 12 }}>{a.correo}</td>
                                    <td>{a.telefono}</td>
                                    <td>{a.extension || "—"}</td>
                                    <td>
                                        <span className={`badge ${a.habilitado ? "badge-green" : "badge-red"}`}>
                                            {a.habilitado ? "Sí" : "No"}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 11 }}>
                                        {a.fecha_modificacion
                                            ? new Date(a.fecha_modificacion).toLocaleDateString('es-MX')
                                            : "—"}
                                    </td>
                                    <td style={{ fontSize: 11 }}>
                                        {a.fecha_registro
                                            ? new Date(a.fecha_registro).toLocaleDateString('es-MX')
                                            : "—"}
                                    </td>
                                    <td>
                                        <button className="action-btn ab-edit"
                                            onClick={() => abrirEditar(a)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <span>Número de registros: {asesores.length}</span>
                </div>
            </div>

            <ModalAsesor
                show={!!modal}
                onClose={() => setModal(null)}
                advisor={modal === "new" ? null : modal}
                onSaved={cargarAsesores}
            />

            {/* Dashboard de carga de trabajo (datos mock) */}
            <div style={{ marginTop: 32 }}>
                <DashboardCarga asesores={asesores} />
            </div>
        </div>
    );
}
