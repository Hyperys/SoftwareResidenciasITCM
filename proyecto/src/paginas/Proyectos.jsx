import React, { useState, useEffect } from "react";
import { Icon } from "../componentes/compartidos/Icono";
import { DashboardCargaProyectos } from "../componentes/proyectos/DashboardCargaProyectos";
import { ModalResidente } from "../componentes/residentes/ModalResidente";

// ══════════════════════════════════════════════════════════════
// PÁGINA: PROYECTOS — Seguimiento de proyectos en progreso
// Props: darkMode
// ══════════════════════════════════════════════════════════════

export function Proyectos({ darkMode }) {
    const [asesores, setAsesores] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);

    const cargarAsesores = () => {
        fetch('/api/asesores')
            .then(r => r.json())
            .then(data => setAsesores(Array.isArray(data) ? data : []))
            .catch(() => setAsesores([]));
    };

    const cargarProyectos = () => {
        fetch('/api/proyectos')
            .then(r => r.json())
            .then(data => setProyectos(Array.isArray(data) ? data : []))
            .catch(() => setProyectos([]));
    };

    useEffect(() => {
        cargarAsesores();
        cargarProyectos();
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1>Proyectos en progreso</h1>
                <p>Seguimiento y gestión de proyectos de residencias</p>
            </div>

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    className="topbar-btn btn-primary"
                    onClick={() => setShowNewProjectModal(true)}
                >
                    <Icon n="plus" /> Agregar proyecto en progreso
                </button>
            </div>

            <DashboardCargaProyectos
                asesores={asesores}
                proyectos={proyectos}
                darkMode={darkMode}
                onRefreshProyectos={cargarProyectos}
            />

            {/* Reutilizamos ModalResidente en modo proyecto */}
            <ModalResidente
                show={showNewProjectModal}
                onClose={() => setShowNewProjectModal(false)}
                onSaved={() => { cargarAsesores(); cargarProyectos(); }}
                isProjectMode={true}
            />
        </div>
    );
}
