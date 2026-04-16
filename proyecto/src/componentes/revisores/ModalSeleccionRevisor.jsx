import React, { useState, useEffect } from "react";
import { Modal } from "../compartidos/Modal";
import { Icon } from "../compartidos/Icono";
import { ModalRevisor } from "./ModalRevisor";

// ══════════════════════════════════════════════════════════════
// MODAL SELECCIÓN REVISOR — Listado para elegir un revisor
// Props: show, onClose, onSelect
// ══════════════════════════════════════════════════════════════

export function ModalSeleccionRevisor({ show, onClose, onSelect }) {
    const [revisores, setRevisores] = useState([]);
    const [search, setSearch] = useState("");
    const [showNew, setShowNew] = useState(false);

    const cargarRevisores = () => {
        fetch('/api/revisores')
            .then(r => r.json())
            .then(data => setRevisores(Array.isArray(data) ? data : []))
            .catch(() => setRevisores([]));
    };

    useEffect(() => {
        if (show) cargarRevisores();
    }, [show]);

    const filtered = revisores.filter(r =>
        !search || `${r.nombres} ${r.apellidos}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Modal show={show && !showNew} onClose={onClose}
                title="Seleccionar revisor" size="md"
                footer={<>
                    <button className="topbar-btn btn-secondary"
                        style={{ border: "1.5px solid #D1DAE8", marginRight: "auto" }}
                        onClick={() => setShowNew(true)}>
                        <Icon n="plus" /> Añadir nuevo revisor
                    </button>
                    <button className="topbar-btn btn-ghost" onClick={onClose}>Cancelar</button>
                </>}>
                <div className="search-box" style={{ marginBottom: 14 }}>
                    <Icon n="search" />
                    <input placeholder="Buscar revisor por nombre..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>Tipo</th><th>Departamento</th><th>Puesto</th><th></th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No se encontraron revisores
                                </td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id}>
                                    <td className="td-name">{r.nombres} {r.apellidos}</td>
                                    <td>
                                        <span className={`badge ${r.tipo === "interno" ? "badge-blue" : "badge-yellow"}`}>
                                            {r.tipo === "interno" ? "Interno" : "Externo"}
                                        </span>
                                    </td>
                                    <td>{r.departamento || '—'}</td>
                                    <td>{r.puesto || '—'}</td>
                                    <td>
                                        <button className="action-btn ab-edit"
                                            onClick={() => { onSelect && onSelect(r); onClose(); }}>
                                            Seleccionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
            <ModalRevisor show={showNew} onClose={() => setShowNew(false)}
                onSaved={() => { setShowNew(false); cargarRevisores(); }} />
        </>
    );
}
