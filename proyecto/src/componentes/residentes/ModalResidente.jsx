import React, { useState, useEffect } from "react";
import { Modal } from "../compartidos/Modal";
import { Icon } from "../compartidos/Icono";
import { useNotification } from "../../contexto/ContextoNotificaciones";
import { ModalSeleccionAsesor } from "../asesores/ModalSeleccionAsesor";
import { ModalSeleccionRevisor } from "../revisores/ModalSeleccionRevisor";

// ══════════════════════════════════════════════════════════════
// MODAL RESIDENTE — Crear / Editar expediente o proyecto
// Props: show, onClose, resident (null = nuevo), onSaved,
//        isProjectMode (bool, default false)
// ══════════════════════════════════════════════════════════════

export function ModalResidente({ show, onClose, resident, onSaved, isProjectMode = false }) {
    const { notify, alert } = useNotification();
    const isNew = !resident;

    const emptyForm = {
        num_control: '', correo: '', nombres: '', apellidos: '',
        sexo: '', telefono: '', carrera_id: '', especialidad_id: '',
        nombre_proyecto: '', empresa_id: '', empresa_nombre: '',
        departamento: '', horario: '', semestre: '',
        fecha_inicio: '', fecha_cierre: '', observaciones: '',
        estado: 'activo',
        asesor_interno_id: null, asesor_interno: '',
        asesor_externo_id: null, asesor_externo: '',
        revisor_id: null, revisor: ''
    };

    const [form, setForm] = useState(emptyForm);
    const [carreras, setCarreras] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [tiposDoc, setTiposDoc] = useState([]);
    const [docsExist, setDocsExist] = useState([]);   // docs ya en BD (edición)
    const [docsNuevos, setDocsNuevos] = useState([]);   // {tipo_doc_id, tipo_desc, file}
    const [selAdvisor, setSelAdvisor] = useState(null); // 'interno' | 'externo'
    const [selRevisor, setSelRevisor] = useState(false); // bool
    const [loading, setLoading] = useState(false);
    const [elimModal, setElimModal] = useState(false);
    const [elimArch, setElimArch] = useState(false);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // Cargar catálogos al abrir
    useEffect(() => {
        if (!show) return;
        fetch('/api/carreras/habilitadas').then(r => r.json()).then(d => setCarreras(Array.isArray(d) ? d : []));
        fetch('/api/empresas').then(r => r.json()).then(d => setEmpresas(Array.isArray(d) ? d : []));
        // tipos_documento desde BD via endpoint de residentes/tipos
        fetch('/api/tipos_documento').then(r => r.json()).then(d => setTiposDoc(Array.isArray(d) ? d : []));

        if (resident) {
            // Cargar detalle completo del residente
            fetch(`/api/residentes/${resident.num_control}`)
                .then(r => r.json())
                .then(d => {
                    setForm({
                        num_control: d.num_control || '',
                        correo: d.correo || '',
                        nombres: d.nombres || '',
                        apellidos: d.apellidos || '',
                        sexo: d.sexo || '',
                        telefono: d.telefono || '',
                        carrera_id: d.carrera_id || '',
                        especialidad_id: d.especialidad_id || '',
                        nombre_proyecto: d.nombre_proyecto || '',
                        empresa_id: d.empresa_id || '',
                        empresa_nombre: d.empresa || '',
                        departamento: d.departamento || '',
                        horario: d.horario || '',
                        semestre: d.semestre || '',
                        fecha_inicio: d.fecha_inicio ? new Date(d.fecha_inicio).toISOString().split('T')[0] : '',
                        fecha_cierre: d.fecha_cierre ? new Date(d.fecha_cierre).toISOString().split('T')[0] : '',
                        observaciones: d.observaciones || '',
                        estado: d.estado || 'activo',
                        asesor_interno_id: d.asesor_interno_id || null,
                        asesor_interno: d.asesor_interno || '',
                        asesor_externo_id: d.asesor_externo_id || null,
                        asesor_externo: d.asesor_externo || '',
                        revisor_id: d.revisor_id || null,
                        revisor: d.revisor || '',
                    });
                    setDocsExist(Array.isArray(d.documentos) ? d.documentos : []);
                    if (d.carrera_id) cargarEspecialidades(d.carrera_id);
                });
        } else {
            setForm(emptyForm);
            setDocsExist([]);
            setDocsNuevos([]);
        }
    }, [show, resident]);

    const cargarEspecialidades = (carrera_id) => {
        if (!carrera_id) { setEspecialidades([]); return; }
        fetch(`/api/especialidades/${carrera_id}`)
            .then(r => r.json())
            .then(d => setEspecialidades(Array.isArray(d) ? d : []));
    };

    const handleSelectAdvisor = (a) => {
        if (selAdvisor === 'interno')
            upd('asesor_interno_id', a.id), upd('asesor_interno', `${a.nombres} ${a.apellidos}`);
        else if (selAdvisor === 'externo')
            upd('asesor_externo_id', a.id), upd('asesor_externo', `${a.nombres} ${a.apellidos}`);
        setSelAdvisor(null);
    };

    const handleSelectRevisor = (r) => {
        upd('revisor_id', r.id);
        upd('revisor', `${r.nombres} ${r.apellidos}`);
        setSelRevisor(false);
    };

    const handleSelectEmpresa = (e) => {
        upd('empresa_id', e.id);
        upd('empresa_nombre', e.nombre);
    };

    // Documentos nuevos
    const tiposUsados = [
        ...docsExist.map(d => d.tipo_doc_id),
        ...docsNuevos.map(d => d.tipo_doc_id)
    ];
    const tiposDisponibles = tiposDoc.filter(t => !tiposUsados.includes(t.id));

    const agregarFilaDoc = () => {
        if (tiposDisponibles.length === 0) return;
        setDocsNuevos(prev => [...prev, { tipo_doc_id: '', tipo_desc: '', file: null, key: Date.now() }]);
    };

    const actualizarDocNuevo = (key, campo, valor) => {
        setDocsNuevos(prev => prev.map(d => d.key === key ? { ...d, [campo]: valor } : d));
    };

    const eliminarFilaDoc = (key) => {
        setDocsNuevos(prev => prev.filter(d => d.key !== key));
    };

    const eliminarDocExistente = async (doc_id) => {
        try {
            await fetch(`/api/documentos/${doc_id}`, { method: 'DELETE' });
            setDocsExist(prev => prev.filter(d => d.id !== doc_id));
            notify('Documento eliminado', 'info');
        } catch (e) { await alert('Error al eliminar documento'); }
    };

    // Guardar
    const guardar = async () => {
        if (!form.num_control.trim()) return await alert('N° de control requerido', 'warning', 'Campo requerido');
        if (!form.nombres.trim() || !form.apellidos.trim()) return await alert('Nombres y apellidos requeridos', 'warning', 'Campo requerido');
        if (!form.correo.trim()) return await alert('Correo requerido', 'warning', 'Campo requerido');
        if (!form.sexo) return await alert('Sexo requerido', 'warning', 'Campo requerido');
        if (!form.carrera_id) return await alert('Carrera requerida', 'warning', 'Campo requerido');
        if (!form.nombre_proyecto.trim()) return await alert('Nombre del proyecto requerido', 'warning', 'Campo requerido');
        if (!form.semestre) return await alert('Semestre requerido', 'warning', 'Campo requerido');
        if (!form.fecha_inicio) return await alert('Fecha de inicio requerida', 'warning', 'Campo requerido');

        setLoading(true);
        try {
            const body = {
                num_control: form.num_control,
                nombres: form.nombres,
                apellidos: form.apellidos,
                sexo: form.sexo === 'Hombre' ? 'H' : form.sexo === 'Mujer' ? 'M' : 'otro',
                correo: form.correo,
                telefono: form.telefono,
                carrera_id: form.carrera_id || null,
                especialidad_id: form.especialidad_id || null,
                empresa_id: form.empresa_id || null,
                asesor_interno_id: form.asesor_interno_id || null,
                asesor_externo_id: form.asesor_externo_id || null,
                revisor_id: form.revisor_id || null,
                nombre_proyecto: form.nombre_proyecto,
                departamento: form.departamento,
                horario: form.horario,
                semestre: form.semestre,
                fecha_inicio: form.fecha_inicio,
                fecha_cierre: form.fecha_cierre || null,
                observaciones: form.observaciones || null,
                estado: form.estado
            };

            const isProyecto = isProjectMode === true;
            const url = isProyecto
                ? (isNew ? '/api/proyectos' : `/api/proyectos/${form.num_control}`)
                : (isNew ? '/api/residentes' : `/api/residentes/${form.num_control}`);
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                await alert(data.error || 'Error al guardar', 'error');
                setLoading(false);
                return;
            }

            // Subir documentos nuevos solo en modo expediente
            if (!isProyecto) {
                for (const doc of docsNuevos) {
                    if (!doc.file || !doc.tipo_doc_id) continue;
                    const fd = new FormData();
                    fd.append('archivo', doc.file);
                    fd.append('tipo_doc_id', doc.tipo_doc_id);
                    await fetch(`/api/residentes/${form.num_control}/documentos`, {
                        method: 'POST', body: fd
                    });
                }
            }

            notify(
                isNew
                    ? (isProyecto ? 'Proyecto registrado correctamente' : 'Residente registrado correctamente')
                    : 'Cambios guardados correctamente',
                'success'
            );
            onSaved && onSaved();
            onClose();
        } catch (e) {
            await alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar expediente
    const eliminar = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/residentes/${form.num_control}?eliminar_archivos=${elimArch}`,
                { method: 'DELETE' }
            );
            const data = await res.json();
            if (!res.ok) { await alert(data.error || 'Error al eliminar'); setLoading(false); return; }
            notify('Expediente eliminado', 'info');
            onSaved && onSaved();
            onClose();
        } catch (e) {
            await alert('Error de conexión');
        } finally {
            setLoading(false);
            setElimModal(false);
        }
    };

    // Modal de confirmación de empresa
    const [showEmpModal, setShowEmpModal] = useState(false);
    const [empSearch, setEmpSearch] = useState('');
    const empFiltradas = empresas.filter(e =>
        !empSearch || e.nombre.toLowerCase().includes(empSearch.toLowerCase())
    );

    return (
        <>
            <Modal show={show && !selAdvisor && !selRevisor && !elimModal && !showEmpModal} onClose={onClose}
                size="lg"
                title={isProjectMode ? 'Registrar Proyecto en Progreso' : (isNew ? 'Registrar nuevo residente' : 'Editar expediente')}
                sub={isProjectMode ? 'Complete los datos iniciales del proyecto' : (resident ? `N° Control: ${resident.num_control}` : 'Complete los campos requeridos')}
                footer={<>
                    {!isNew && !isProjectMode && (
                        <button className="topbar-btn btn-danger" style={{ marginRight: 'auto' }}
                            onClick={() => setElimModal(true)}>
                            <Icon n="trash" /> Eliminar expediente
                        </button>
                    )}
                    <button className="topbar-btn btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="topbar-btn btn-primary" onClick={guardar} disabled={loading}>
                        <Icon n="check" /> {loading ? 'Guardando...' : (isProjectMode ? 'Iniciar seguimiento' : 'Guardar cambios')}
                    </button>
                </>}>

                {/* HELP TEXT FOR PROJECT MODE */}
                {isProjectMode && (
                    <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16, padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E5EAF2' }}>
                        Registre los datos iniciales. El expediente documental se generará al finalizar los reportes.
                    </div>
                )}

                {/* INFO GENERAL */}
                <div className="section-divider">Información general</div>
                <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">N° Control <span className="req">*</span></label>
                        <input className="form-input" value={form.num_control}
                            onChange={e => upd('num_control', e.target.value)}
                            placeholder="Ej. 20070001" disabled={!isNew} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Correo <span className="req">*</span></label>
                        <input className="form-input" value={form.correo}
                            onChange={e => upd('correo', e.target.value)}
                            placeholder="correo@cdmadero.tecnm.mx" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nombre(s) <span className="req">*</span></label>
                        <input className="form-input" value={form.nombres}
                            onChange={e => upd('nombres', e.target.value)} placeholder="Nombre(s)" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Apellidos <span className="req">*</span></label>
                        <input className="form-input" value={form.apellidos}
                            onChange={e => upd('apellidos', e.target.value)} placeholder="Apellido Apellido" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Sexo <span className="req">*</span></label>
                        <select className="form-select" value={form.sexo}
                            onChange={e => upd('sexo', e.target.value)}>
                            <option value="">Seleccionar</option>
                            <option value="Hombre">Hombre</option>
                            <option value="Mujer">Mujer</option>
                            <option value="otro">Prefiero no decir</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input className="form-input" value={form.telefono}
                            onChange={e => upd('telefono', e.target.value)} placeholder="___-___-____" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Carrera <span className="req">*</span></label>
                        <select className="form-select" value={form.carrera_id}
                            onChange={e => { upd('carrera_id', e.target.value); upd('especialidad_id', ''); cargarEspecialidades(e.target.value); }}>
                            <option value="">Seleccionar</option>
                            {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Especialidad</label>
                        <select className="form-select" value={form.especialidad_id}
                            onChange={e => upd('especialidad_id', e.target.value)}>
                            <option value="">Seleccionar</option>
                            {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {/* PROYECTO */}
                <div className="section-divider">Proyecto</div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                    <div className="form-group span-3">
                        <label className="form-label">Nombre del proyecto <span className="req">*</span></label>
                        <input className="form-input" value={form.nombre_proyecto}
                            onChange={e => upd('nombre_proyecto', e.target.value)}
                            placeholder="Título completo del proyecto de residencia" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Empresa</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input className="form-input" style={{ flex: 1 }}
                                value={form.empresa_nombre} readOnly
                                placeholder="Seleccionar empresa..." />
                            <button className="topbar-btn btn-secondary"
                                style={{ whiteSpace: 'nowrap', border: '1.5px solid #D1DAE8' }}
                                onClick={() => { setEmpSearch(''); setShowEmpModal(true); }}>
                                Seleccionar
                            </button>
                            {form.empresa_id && (
                                <button className="topbar-btn btn-ghost"
                                    onClick={() => { upd('empresa_id', ''); upd('empresa_nombre', ''); }}><span className="material-symbols-rounded" style={{fontSize:15}}>close</span></button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="form-grid form-grid-3" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Departamento</label>
                        <input className="form-input" value={form.departamento}
                            onChange={e => upd('departamento', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Horario</label>
                        <input className="form-input" value={form.horario}
                            onChange={e => upd('horario', e.target.value)} placeholder="09:00 a 17:00" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Semestre <span className="req">*</span></label>
                        <select className="form-select" value={form.semestre}
                            onChange={e => upd('semestre', e.target.value)}>
                            <option value="">Seleccionar</option>
                            <option value="ENE-JUN">ENE-JUN</option>
                            <option value="AGO-DIC">AGO-DIC</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Fecha de inicio <span className="req">*</span></label>
                        <input className="form-input" type="date" value={form.fecha_inicio}
                            onChange={e => upd('fecha_inicio', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Fecha de cierre</label>
                        <input className="form-input" type="date" value={form.fecha_cierre}
                            onChange={e => upd('fecha_cierre', e.target.value)} />
                    </div>
                </div>

                <div className="section-divider">Asesores y Revisor</div>
                <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
                    {[
                        { key: 'interno', label: 'Asesor interno', val: form.asesor_interno },
                        { key: 'externo', label: 'Asesor externo', val: form.asesor_externo },
                    ].map(a => (
                        <div className="form-group" key={a.key}>
                            <label className="form-label">{a.label}</label>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <input className="form-input" style={{ flex: 1 }}
                                    value={a.val || 'SIN ASIGNAR'} readOnly />
                                <button className="topbar-btn btn-secondary"
                                    style={{ border: '1.5px solid #D1DAE8' }}
                                    onClick={() => setSelAdvisor(a.key)}>Seleccionar</button>
                                {a.val && (
                                    <button className="topbar-btn btn-ghost"
                                        onClick={() => { upd(`asesor_${a.key}_id`, null); upd(`asesor_${a.key}`, ''); }}>
                                        <span className="material-symbols-rounded" style={{fontSize:15}}>close</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {/* Revisor — usa endpoint /api/revisores */}
                    <div className="form-group">
                        <label className="form-label">Revisor</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input className="form-input" style={{ flex: 1 }}
                                value={form.revisor || 'SIN ASIGNAR'} readOnly />
                            <button className="topbar-btn btn-secondary"
                                style={{ border: '1.5px solid #D1DAE8' }}
                                onClick={() => setSelRevisor(true)}>Seleccionar</button>
                            {form.revisor && (
                                <button className="topbar-btn btn-ghost"
                                    onClick={() => { upd('revisor_id', null); upd('revisor', ''); }}>
                                    <span className="material-symbols-rounded" style={{fontSize:15}}>close</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* OBSERVACIONES */}
                <div className="section-divider">Observaciones</div>
                <textarea className="form-textarea" style={{ width: '100%' }}
                    value={form.observaciones}
                    onChange={e => upd('observaciones', e.target.value)}
                    placeholder="Notas u observaciones del expediente..." />

                {/* ESTADO */}
                {!isProjectMode && (
                    <div style={{ marginTop: 14 }}>
                        <label className="checkbox-row">
                            <input type="checkbox"
                                checked={form.estado === 'cerrado'}
                                onChange={e => upd('estado', e.target.checked ? 'cerrado' : 'activo')} />
                            <span>Expediente cerrado</span>
                        </label>
                    </div>
                )}

                {/* DOCUMENTOS — ocultar en modo proyecto */}
                {!isProjectMode && (<>
                    <div className="section-divider" style={{ marginTop: 16 }}>Documentos</div>

                    {/* Docs existentes (edición) */}
                    {docsExist.map(d => (
                        <div className="doc-item" key={d.id}>
                            <Icon n="doc" />
                            <div style={{ flex: 1 }}>
                                <div className="doc-name">{d.nombre_archivo}</div>
                                <div className="doc-type">{d.tipo}</div>
                            </div>
                            <button className="action-btn"
                                style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 10, padding: '3px 7px' }}
                                onClick={() => eliminarDocExistente(d.id)}>
                                <Icon n="trash" />
                            </button>
                        </div>
                    ))}

                    {/* Filas de nuevos docs */}
                    {docsNuevos.map(d => (
                        <div key={d.key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <select className="form-select" style={{ flex: '0 0 220px' }}
                                value={d.tipo_doc_id}
                                onChange={e => {
                                    const t = tiposDoc.find(t => t.id === Number(e.target.value));
                                    actualizarDocNuevo(d.key, 'tipo_doc_id', Number(e.target.value));
                                    actualizarDocNuevo(d.key, 'tipo_desc', t ? t.descripcion : '');
                                }}>
                                <option value="">— Tipo de documento —</option>
                                {tiposDoc
                                    .filter(t => !tiposUsados.includes(t.id) || t.id === d.tipo_doc_id)
                                    .map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
                            </select>
                            <label style={{
                                flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                                background: '#F8FAFC', border: '1.5px solid #D1DAE8', borderRadius: 7,
                                padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: '#64748B'
                            }}>
                                <Icon n="doc" />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {d.file ? d.file.name : 'Seleccionar PDF...'}
                                </span>
                                <input type="file" accept=".pdf" style={{ display: 'none' }}
                                    onChange={e => actualizarDocNuevo(d.key, 'file', e.target.files[0] || null)} />
                            </label>
                            <button className="action-btn"
                                style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 10, padding: '5px 8px' }}
                                onClick={() => eliminarFilaDoc(d.key)}>
                                <Icon n="trash" />
                            </button>
                        </div>
                    ))}

                    <button className="doc-add" style={{ marginTop: 8 }}
                        onClick={agregarFilaDoc}
                        disabled={tiposDisponibles.length === 0}>
                        <Icon n="plus" />
                        {tiposDisponibles.length === 0 ? 'No hay más tipos disponibles' : 'Añadir documento'}
                    </button>
                </>)}
            </Modal>

            {/* Modal selección de asesor */}
            <ModalSeleccionAsesor
                show={!!selAdvisor}
                onClose={() => setSelAdvisor(null)}
                onSelect={handleSelectAdvisor} />

            {/* Modal selección de revisor */}
            <ModalSeleccionRevisor
                show={selRevisor}
                onClose={() => setSelRevisor(false)}
                onSelect={handleSelectRevisor} />

            {/* Modal selección de empresa */}
            <Modal show={showEmpModal} onClose={() => setShowEmpModal(false)}
                title="Seleccionar empresa" size="sm"
                footer={<button className="topbar-btn btn-ghost" onClick={() => setShowEmpModal(false)}>Cancelar</button>}>
                <div className="search-box" style={{ marginBottom: 12 }}>
                    <Icon n="search" />
                    <input placeholder="Buscar empresa..." value={empSearch}
                        onChange={e => setEmpSearch(e.target.value)} />
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {empFiltradas.map(e => (
                        <div key={e.id} className="recent-item" style={{ cursor: 'pointer' }}
                            onClick={() => { handleSelectEmpresa(e); setShowEmpModal(false); }}>
                            <div style={{ flex: 1 }}>
                                <div className="recent-name">{e.nombre}</div>
                                <div className="recent-meta">{e.giro} · {e.ciudad}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Modal confirmación eliminar */}
            <Modal show={elimModal} onClose={() => setElimModal(false)}
                title="Eliminar expediente" size="sm"
                footer={<>
                    <button className="topbar-btn btn-ghost" onClick={() => setElimModal(false)}>Cancelar</button>
                    <button className="topbar-btn btn-danger" onClick={eliminar} disabled={loading}>
                        <Icon n="trash" /> {loading ? 'Eliminando...' : 'Confirmar eliminación'}
                    </button>
                </>}>
                <p style={{ marginBottom: 14, fontSize: 13 }}>
                    ¿Eliminar el expediente de <strong>{form.nombres} {form.apellidos}</strong>?
                    Esta acción no se puede deshacer.
                </p>
                <label className="checkbox-row">
                    <input type="checkbox" checked={elimArch}
                        onChange={e => setElimArch(e.target.checked)} />
                    <span>También eliminar archivos físicos del disco</span>
                </label>
            </Modal>
        </>
    );
}
