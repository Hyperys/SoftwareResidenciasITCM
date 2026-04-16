import React, { useState, useEffect } from "react";
import { Icon } from "../componentes/compartidos/Icono";
import { ModalEmpresa } from "../componentes/empresas/ModalEmpresa";
import { ModalSeleccionAsesor } from "../componentes/asesores/ModalSeleccionAsesor";
import { useNotification } from "../contexto/ContextoNotificaciones";

// ══════════════════════════════════════════════════════════════
// PÁGINA: EMPRESAS — Catálogo de empresas receptoras
// ══════════════════════════════════════════════════════════════

export function Empresas() {
    const { alert } = useNotification();
    const [empresas, setEmpresas] = useState([]);
    const [modal, setModal] = useState(null);
    const [advisorModal, setAdvisorModal] = useState(null);
    const [search, setSearch] = useState("");
    const [giroF, setGiroF] = useState("");

    const cargarEmpresas = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (giroF) params.append('giro', giroF);
        fetch(`/api/empresas?${params}`)
            .then(r => r.json())
            .then(data => setEmpresas(Array.isArray(data) ? data : []))
            .catch(() => setEmpresas([]));
    };

    useEffect(() => { cargarEmpresas(); }, [search, giroF]);

    const abrirEditar = (e) => {
        fetch(`/api/empresas/${e.id}`)
            .then(r => r.json())
            .then(data => setModal(data))
            .catch(() => alert("Error al cargar empresa"));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Catálogo de empresas</h1>
                <p>Empresas receptoras del programa de residencias</p>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar por nombre o RFC..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="filter-select" value={giroF}
                        onChange={e => setGiroF(e.target.value)}>
                        <option value="">Todos los giros</option>
                        <option value="publica">Pública</option>
                        <option value="privada">Privada</option>
                        <option value="industrial">Industrial</option>
                        <option value="servicios">Servicios</option>
                        <option value="otro">Otro</option>
                    </select>
                    <button className="topbar-btn btn-primary" onClick={() => setModal("new")}>
                        <Icon n="plus" /> Añadir empresa
                    </button>
                </div>
                <div style={{ overflowX: "auto", background: "#fff" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th><th>RFC</th><th>Giro</th><th>Correo</th>
                                <th>Teléfono</th><th>Dirección</th><th>Ubicación</th>
                                <th>CP</th><th>Habilitada</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empresas.length === 0 ? (
                                <tr><td colSpan={10} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No hay empresas registradas
                                </td></tr>
                            ) : empresas.map(e => (
                                <tr key={e.id}>
                                    <td className="td-name" title={e.nombre}>{e.nombre}</td>
                                    <td className="td-id">{e.rfc}</td>
                                    <td><span className="badge badge-blue">{e.giro}</span></td>
                                    <td style={{ color: "#2563eb", fontSize: 12 }}>{e.correo || "—"}</td>
                                    <td>{e.telefono}</td>
                                    <td title={e.direccion}>{e.direccion}</td>
                                    <td>{e.ciudad}, {e.estado_geo}</td>
                                    <td>{e.codigo_postal}</td>
                                    <td>
                                        <span className={`badge ${e.habilitada ? "badge-green" : "badge-red"}`}>
                                            {e.habilitada ? "Sí" : "No"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="inline-actions">
                                            <button className="action-btn ab-edit"
                                                onClick={() => abrirEditar(e)}>Editar</button>
                                            <button className="action-btn ab-view"
                                                onClick={() => setAdvisorModal(e.nombre)}>
                                                Ver asesores
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <span>Número de registros: {empresas.length}</span>
                </div>
            </div>
            <ModalEmpresa
                show={!!modal}
                onClose={() => setModal(null)}
                company={modal === "new" ? null : modal}
                onSaved={cargarEmpresas}
            />
            <ModalSeleccionAsesor
                show={!!advisorModal}
                onClose={() => setAdvisorModal(null)}
                filterEmpresa={advisorModal}
            />
        </div>
    );
}
