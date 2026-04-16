import React, { useState, useEffect } from "react";
import { Icon } from "../componentes/compartidos/Icono";
import { ModalResidente } from "../componentes/residentes/ModalResidente";

// ══════════════════════════════════════════════════════════════
// PÁGINA: RESIDENTES — Listado con filtros y acciones
// ══════════════════════════════════════════════════════════════

export function Residentes() {
    const [residentes, setResidentes] = useState([]);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState('');
    const [yearF, setYearF] = useState('');
    const [semF, setSemF] = useState('');
    const [statusF, setStatusF] = useState('');

    const cargarResidentes = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (yearF) params.append('anio', yearF);
        if (semF) params.append('semestre', semF);
        if (statusF) params.append('estado', statusF);
        fetch(`/api/residentes?${params}`)
            .then(r => r.json())
            .then(d => setResidentes(Array.isArray(d) ? d : []))
            .catch(() => setResidentes([]));
    };

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (yearF) params.append('anio', yearF);
        if (semF) params.append('semestre', semF);
        if (statusF) params.append('estado', statusF);
        fetch(`/api/residentes?${params}`)
            .then(r => r.json())
            .then(d => setResidentes(Array.isArray(d) ? d : []))
            .catch(() => setResidentes([]));
    }, [search, yearF, semF, statusF]);

    const abrirEditar = (r) => {
        setModal(r);
    };

    return (
        <div>
            <div className="page-header">
                <h1>Listado de residentes</h1>
                <p>Gestión de expedientes del programa de residencias</p>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar por nombre, N° control o correo..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <input className="filter-select" value={yearF}
                        onChange={e => { const v = e.target.value; if (v === '' || /^\d{0,4}$/.test(v)) setYearF(v); }}
                        placeholder="Año (ej. 2024)" style={{ width: 130 }} />
                    <select className="filter-select" value={semF}
                        onChange={e => setSemF(e.target.value)}>
                        <option value="">Todos los semestres</option>
                        <option value="ENE-JUN">ENE-JUN</option>
                        <option value="AGO-DIC">AGO-DIC</option>
                    </select>
                    <select className="filter-select" value={statusF}
                        onChange={e => setStatusF(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="cerrado">Cerrado</option>
                    </select>
                    <button className="topbar-btn btn-primary" onClick={() => setModal('new')}>
                        <Icon n="plus" /> Registrar nuevo
                    </button>
                </div>
                <div style={{ overflowX: 'auto', background: '#fff' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>N° Control</th><th>Nombre</th><th>Sexo</th>
                                <th>Especialidad</th><th>Semestre</th>
                                <th>Fecha inicio</th><th>Fecha cierre</th>
                                <th>Asesor interno</th><th>Asesor externo</th>
                                <th>Empresa</th><th>Horario</th>
                                <th>Estado</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {residentes.length === 0 ? (
                                <tr><td colSpan={13} style={{ textAlign: 'center', color: '#94A3B8', padding: 24 }}>
                                    No hay residentes registrados
                                </td></tr>
                            ) : residentes.map(r => (
                                <tr key={r.num_control}>
                                    <td className="td-id">{r.num_control}</td>
                                    <td className="td-name">{r.nombre_completo}</td>
                                    <td><span className={`badge ${r.sexo === 'M' ? 'badge-blue' : 'badge-gray'}`}>
                                        {r.sexo === 'H' ? 'Hombre' : r.sexo === 'M' ? 'Mujer' : r.sexo}
                                    </span></td>
                                    <td>{r.especialidad || '—'}</td>
                                    <td><span className="badge badge-blue">{r.semestre}</span></td>
                                    <td>{r.fecha_inicio}</td>
                                    <td>{r.fecha_cierre || '—'}</td>
                                    <td style={{ color: !r.asesor_interno ? '#F59E0B' : 'inherit', fontWeight: !r.asesor_interno ? 600 : 400 }}>
                                        {r.asesor_interno || 'SIN ASIGNAR'}
                                    </td>
                                    <td style={{ color: !r.asesor_externo ? '#F59E0B' : 'inherit', fontWeight: !r.asesor_externo ? 600 : 400 }}>
                                        {r.asesor_externo || 'SIN ASIGNAR'}
                                    </td>
                                    <td>{r.empresa || '—'}</td>
                                    <td>{r.horario}</td>
                                    <td><span className={`badge badge-status ${r.estado === 'cerrado' ? 'badge-green' : 'badge-yellow'}`}>
                                        {r.estado === 'cerrado' ? 'Cerrado' : 'Activo'}
                                    </span></td>
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
                    <span>Número de registros: {residentes.length}</span>
                </div>
            </div>
            <ModalResidente
                show={!!modal}
                onClose={() => setModal(null)}
                resident={modal === 'new' ? null : modal}
                onSaved={cargarResidentes}
            />
        </div>
    );
}
