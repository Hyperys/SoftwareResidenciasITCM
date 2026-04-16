import React, { useState, useEffect } from "react";
import { Modal } from "../compartidos/Modal";
import { Icon } from "../compartidos/Icono";
import { useNotification } from "../../contexto/ContextoNotificaciones";

// ══════════════════════════════════════════════════════════════
// MODAL REVISOR — Crear / Editar un revisor
// Los revisores comparten la tabla `asesores` del backend.
// Props: show, onClose, revisor (null = nuevo), onSaved
// ══════════════════════════════════════════════════════════════

export function ModalRevisor({ show, onClose, revisor, onSaved }) {
    const { notify, alert, confirm } = useNotification();
    const emptyForm = {
        nombres: '', apellidos: '', tipo: 'interno', departamento: '',
        puesto: '', correo: '', telefono: '', extension: '', habilitado: true, empresa_id: null
    };
    const [form, setForm] = useState(emptyForm);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setForm(revisor ? {
                nombres: revisor.nombres || '',
                apellidos: revisor.apellidos || '',
                tipo: revisor.tipo || 'interno',
                departamento: revisor.departamento || '',
                puesto: revisor.puesto || '',
                correo: revisor.correo || '',
                telefono: revisor.telefono || '',
                extension: revisor.extension || '',
                habilitado: revisor.habilitado !== false,
                empresa_id: revisor.empresa_id || null
            } : emptyForm);
        }
    }, [show, revisor]);

    useEffect(() => {
        if (show) {
            fetch('/api/empresas')
                .then(r => r.json())
                .then(data => setEmpresas(Array.isArray(data) ? data : []))
                .catch(() => setEmpresas([]));
        }
    }, [show]);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const guardar = async () => {
        if (!form.nombres.trim() || !form.apellidos.trim())
            return await alert("Nombres y apellidos son requeridos", 'warning', 'Campos requeridos');
        if (!form.correo.trim() || !form.telefono.trim())
            return await alert("Correo y teléfono son requeridos", 'warning', 'Campos requeridos');
        setLoading(true);
        try {
            const url = revisor ? `/api/revisores/${revisor.id}` : '/api/revisores';
            const method = revisor ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) { await alert(data.error || "Error al guardar"); setLoading(false); return; }
            notify("Revisor guardado correctamente", "success");
            onSaved && onSaved();
            onClose();
        } catch (e) {
            await alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const eliminar = async () => {
        const ok = await confirm(`¿Eliminar al revisor ${form.nombres} ${form.apellidos}? Esta acción no se puede deshacer.`);
        if (!ok) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/revisores/${revisor.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) { await alert(data.error || "Error al eliminar"); setLoading(false); return; }
            notify("Revisor eliminado", "info");
            onSaved && onSaved();
            onClose();
        } catch (e) {
            await alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} size="sm"
            title={revisor ? "Editar revisor" : "Nuevo revisor"}
            sub={revisor ? `ID: ${revisor.id}` : "Complete los campos requeridos"}
            footer={<>
                {revisor && (
                    <button className="topbar-btn btn-danger"
                        style={{ marginRight: "auto" }} onClick={eliminar} disabled={loading}>
                        <Icon n="trash" /> Eliminar
                    </button>
                )}
                <button className="topbar-btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="topbar-btn btn-primary" onClick={guardar} disabled={loading}>
                    <Icon n="check" /> {loading ? "Guardando..." : "Guardar"}
                </button>
            </>}>
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                <div className="form-group">
                    <label className="form-label">Nombres <span className="req">*</span></label>
                    <input className="form-input" value={form.nombres}
                        onChange={e => upd('nombres', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Apellidos <span className="req">*</span></label>
                    <input className="form-input" value={form.apellidos}
                        onChange={e => upd('apellidos', e.target.value)} />
                </div>
                <div className="form-group span-2">
                    <label className="form-label">Tipo <span className="req">*</span></label>
                    <select className="form-select" value={form.tipo}
                        onChange={e => upd('tipo', e.target.value)}>
                        <option value="interno">Interno</option>
                        <option value="externo">Externo</option>
                    </select>
                </div>
                {form.tipo === 'externo' && (
                    <div className="form-group span-2">
                        <label className="form-label">Empresa</label>
                        <select className="form-select" value={form.empresa_id || ''}
                            onChange={e => upd('empresa_id', e.target.value ? Number(e.target.value) : null)}>
                            <option value="">— Sin empresa —</option>
                            {empresas.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">Departamento</label>
                    <input className="form-input" value={form.departamento}
                        onChange={e => upd('departamento', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Puesto</label>
                    <input className="form-input" value={form.puesto}
                        onChange={e => upd('puesto', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Correo <span className="req">*</span></label>
                    <input className="form-input" value={form.correo} type="email"
                        onChange={e => upd('correo', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono <span className="req">*</span></label>
                    <input className="form-input" value={form.telefono}
                        onChange={e => upd('telefono', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Extensión</label>
                    <input className="form-input" value={form.extension}
                        onChange={e => upd('extension', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="checkbox-row" style={{ marginTop: 20 }}>
                        <input type="checkbox" checked={form.habilitado}
                            onChange={e => upd('habilitado', e.target.checked)} />
                        <span>Habilitado</span>
                    </label>
                </div>
            </div>
        </Modal>
    );
}
