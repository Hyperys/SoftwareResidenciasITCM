import React, { useState, useEffect } from "react";
import { Modal } from "../compartidos/Modal";
import { Icon } from "../compartidos/Icono";
import { ModalAsesor } from "./ModalAsesor";

// ══════════════════════════════════════════════════════════════
// MODAL SELECCIÓN ASESOR — Listado para elegir un asesor
// Props: show, onClose, onSelect, filterEmpresa
// ══════════════════════════════════════════════════════════════

export function ModalSeleccionAsesor({ show, onClose, onSelect, filterEmpresa }) {
    const [asesores, setAsesores] = useState([]);
    const [search, setSearch] = useState("");
    const [showNew, setShowNew] = useState(false);

    useEffect(() => {
        if (show) {
            fetch('/api/asesores')
                .then(r => r.json())
                .then(data => setAsesores(Array.isArray(data) ? data : []))
                .catch(() => setAsesores([]));
        }
    }, [show]);

    const filtered = asesores.filter(a => {
        const matchSearch = !search ||
            `${a.nombres} ${a.apellidos}`.toLowerCase().includes(search.toLowerCase());
        const matchEmpresa = !filterEmpresa || a.empresa_nombre === filterEmpresa;
        return matchSearch && matchEmpresa;
    });

    return (
        <>
            <Modal show={show && !showNew} onClose={onClose}
                title={filterEmpresa ? `Asesores — ${filterEmpresa}` : "Seleccionar asesor"} size="md"
                footer={<>
                    <button className="topbar-btn btn-secondary"
                        style={{ border: "1.5px solid #D1DAE8", marginRight: "auto" }}
                        onClick={() => setShowNew(true)}>
                        <Icon n="plus" /> Añadir nuevo asesor
                    </button>
                    <button className="topbar-btn btn-ghost" onClick={onClose}>Cancelar</button>
                </>}>
                <div className="search-box" style={{ marginBottom: 14 }}>
                    <Icon n="search" />
                    <input placeholder="Buscar asesor por nombre..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>Tipo</th><th>Empresa / Depto</th><th>Puesto</th><th></th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No se encontraron asesores
                                </td></tr>
                            ) : filtered.map(a => (
                                <tr key={a.id}>
                                    <td className="td-name">{a.nombres} {a.apellidos}</td>
                                    <td>
                                        <span className={`badge ${a.tipo === "interno" ? "badge-blue" : "badge-yellow"}`}>
                                            {a.tipo === "interno" ? "Interno" : "Externo"}
                                        </span>
                                    </td>
                                    <td>{a.tipo === "interno" ? a.departamento : a.empresa_nombre}</td>
                                    <td>{a.puesto}</td>
                                    <td>
                                        <button className="action-btn ab-edit"
                                            onClick={() => { onSelect && onSelect(a); onClose(); }}>
                                            Seleccionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
            <ModalAsesor show={showNew} onClose={() => setShowNew(false)}
                onSaved={() => setShowNew(false)} />
        </>
    );
}
