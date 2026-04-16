import React, { useState, useEffect } from "react";
import { Modal } from "../compartidos/Modal";
import { Icon } from "../compartidos/Icono";
import { useNotification } from "../../contexto/ContextoNotificaciones";

// ══════════════════════════════════════════════════════════════
// MODAL EMPRESA — Crear / Editar empresa en el catálogo
// Props: show, onClose, company (null = nueva), onSaved
// ══════════════════════════════════════════════════════════════

export function ModalEmpresa({ show, onClose, company, onSaved }) {
    const { notify, alert } = useNotification();
    const emptyForm = {
        giro: '', rfc: '', nombre: '', correo: '', telefono: '',
        extension: '', direccion: '', colonia: '', codigo_postal: '',
        pais: 'México', estado_geo: 'Tamaulipas', ciudad: '', habilitada: true
    };
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setForm(company ? {
                giro: company.giro || '',
                rfc: company.rfc || '',
                nombre: company.nombre || '',
                correo: company.correo || '',
                telefono: company.telefono || '',
                extension: company.extension || '',
                direccion: company.direccion || '',
                colonia: company.colonia || '',
                codigo_postal: company.codigo_postal || '',
                pais: company.pais || 'México',
                estado_geo: company.estado_geo || 'Tamaulipas',
                ciudad: company.ciudad || '',
                habilitada: company.habilitada !== false
            } : emptyForm);
        }
    }, [show, company]);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const guardar = async () => {
        if (!form.nombre.trim() || !form.giro) return await alert("Nombre y giro son requeridos", 'warning', 'Campos requeridos');
        setLoading(true);
        try {
            const url = company ? `/api/empresas/${company.id}` : '/api/empresas';
            const method = company ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) { await alert(data.error || "Error al guardar"); setLoading(false); return; }
            notify("Empresa guardada correctamente", "success");
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
            title={company ? "Editar empresa" : "Nueva empresa"}
            footer={<>
                <button className="topbar-btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="topbar-btn btn-primary" onClick={guardar} disabled={loading}>
                    <Icon n="check" /> {loading ? "Guardando..." : "Guardar"}
                </button>
            </>}>
            <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                <div className="form-group">
                    <label className="form-label">Giro <span className="req">*</span></label>
                    <select className="form-select" value={form.giro} onChange={e => upd('giro', e.target.value)}>
                        <option value="">Seleccionar</option>
                        <option value="publica">Pública</option>
                        <option value="privada">Privada</option>
                        <option value="industrial">Industrial</option>
                        <option value="servicios">Servicios</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">RFC</label>
                    <input className="form-input" value={form.rfc}
                        onChange={e => upd('rfc', e.target.value)} placeholder="RFC de la empresa" />
                </div>
                <div className="form-group span-2">
                    <label className="form-label">Nombre <span className="req">*</span></label>
                    <input className="form-input" value={form.nombre}
                        onChange={e => upd('nombre', e.target.value)} placeholder="Razón social" />
                </div>
                <div className="form-group span-2">
                    <label className="form-label">Correo</label>
                    <input className="form-input" value={form.correo} type="email"
                        onChange={e => upd('correo', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-input" value={form.telefono}
                        onChange={e => upd('telefono', e.target.value)} placeholder="___-___-____" />
                </div>
                <div className="form-group">
                    <label className="form-label">Extensión</label>
                    <input className="form-input" value={form.extension}
                        onChange={e => upd('extension', e.target.value)} placeholder="Ext." />
                </div>
                <div className="form-group span-2">
                    <label className="form-label">Dirección <span className="req">*</span></label>
                    <input className="form-input" value={form.direccion}
                        onChange={e => upd('direccion', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Colonia <span className="req">*</span></label>
                    <input className="form-input" value={form.colonia}
                        onChange={e => upd('colonia', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Código postal</label>
                    <input className="form-input" value={form.codigo_postal}
                        onChange={e => upd('codigo_postal', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">País</label>
                    <select className="form-select" value={form.pais} onChange={e => upd('pais', e.target.value)}>
                        <option>México</option>
                        <option>Estados Unidos</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Estado</label>
                    <input className="form-input" value={form.estado_geo}
                        onChange={e => upd('estado_geo', e.target.value)} placeholder="Estado" />
                </div>
                <div className="form-group span-2">
                    <label className="form-label">Ciudad</label>
                    <input className="form-input" value={form.ciudad}
                        onChange={e => upd('ciudad', e.target.value)} placeholder="Ciudad" />
                </div>
                <div className="form-group span-2">
                    <label className="checkbox-row">
                        <input type="checkbox" checked={form.habilitada}
                            onChange={e => upd('habilitada', e.target.checked)} />
                        <span>Habilitada</span>
                    </label>
                </div>
            </div>
        </Modal>
    );
}
