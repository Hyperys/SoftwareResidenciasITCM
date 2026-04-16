import React from "react";

// ══════════════════════════════════════════════════════════════
// MODAL — Componente genérico reutilizable en toda la app
// Props: show, onClose, title, sub, size ("sm"|"md"|"lg"),
//        children (cuerpo), footer (botones)
// ══════════════════════════════════════════════════════════════

export function Modal({ show, onClose, title, sub, size = "md", children, footer }) {
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={`modal modal-${size}`}>
                <div className="modal-header">
                    <div><h2>{title}</h2>{sub && <div className="sub">{sub}</div>}</div>
                    <button className="close-btn" onClick={onClose}><span className="material-symbols-rounded" style={{fontSize:16}}>close</span></button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
