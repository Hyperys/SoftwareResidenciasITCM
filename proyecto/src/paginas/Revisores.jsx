import React, { useState, useEffect } from "react";
import { Icon } from "../componentes/compartidos/Icono";
import { ModalRevisor } from "../componentes/revisores/ModalRevisor";
import { useNotification } from "../contexto/ContextoNotificaciones";

// ══════════════════════════════════════════════════════════════
// PÁGINA: REVISORES — Catálogo de revisores
// ══════════════════════════════════════════════════════════════

export function Revisores() {
    const { alert } = useNotification();
    const [revisores, setRevisores] = useState([]);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState("");
    const [tipoF, setTipoF] = useState("");

    const cargarRevisores = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (tipoF) params.append('tipo', tipoF);
        fetch(`/api/revisores?${params}`)
            .then(r => r.json())
            .then(data => setRevisores(Array.isArray(data) ? data : []))
            .catch(() => setRevisores([]));
    };

    useEffect(() => { cargarRevisores(); }, [search, tipoF]);

    const abrirEditar = (r) => {
        fetch(`/api/revisores/${r.id}`)
            .then(res => res.json())
            .then(data => setModal(data))
            .catch(() => alert("Error al cargar revisor"));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Catálogo de revisores</h1>
                <p>Revisores internos y externos del programa de residencias</p>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar por nombre de revisor..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="filter-select" value={tipoF}
                        onChange={e => setTipoF(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="interno">Internos</option>
                        <option value="externo">Externos</option>
                    </select>
                    <button className="topbar-btn btn-primary" onClick={() => setModal("new")}>
                        <Icon n="plus" /> Nuevo revisor
                    </button>
                </div>
                <div style={{ overflowX: "auto", background: "#fff" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Departamento</th>
                                <th>Puesto</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Ext.</th>
                                <th>Habilitado</th>
                                <th>Última mod.</th>
                                <th>Fecha registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revisores.length === 0 ? (
                                <tr><td colSpan={11} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No hay revisores registrados
                                </td></tr>
                            ) : revisores.map(r => (
                                <tr key={r.id}>
                                    <td className="td-name" title={`${r.nombres} ${r.apellidos}`}>
                                        {r.nombres} {r.apellidos}
                                    </td>
                                    <td>
                                        <span className={`badge ${r.tipo === "interno" ? "badge-blue" : "badge-yellow"}`}>
                                            {r.tipo === "interno" ? "Interno" : "Externo"}
                                        </span>
                                    </td>
                                    <td title={r.departamento}>{r.departamento || "—"}</td>
                                    <td title={r.puesto}>{r.puesto || "—"}</td>
                                    <td style={{ color: "#2563eb", fontSize: 12 }}>{r.correo}</td>
                                    <td>{r.telefono}</td>
                                    <td>{r.extension || "—"}</td>
                                    <td>
                                        <span className={`badge ${r.habilitado ? "badge-green" : "badge-red"}`}>
                                            {r.habilitado ? "Sí" : "No"}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 11 }}>
                                        {r.fecha_modificacion
                                            ? new Date(r.fecha_modificacion).toLocaleDateString('es-MX')
                                            : "—"}
                                    </td>
                                    <td style={{ fontSize: 11 }}>
                                        {r.fecha_registro
                                            ? new Date(r.fecha_registro).toLocaleDateString('es-MX')
                                            : "—"}
                                    </td>
                                    <td>
                                        <button className="action-btn ab-edit"
                                            onClick={() => abrirEditar(r)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <span>Número de registros: {revisores.length}</span>
                </div>
            </div>

            <ModalRevisor
                show={!!modal}
                onClose={() => setModal(null)}
                revisor={modal === "new" ? null : modal}
                onSaved={cargarRevisores}
            />
        </div>
    );
}
