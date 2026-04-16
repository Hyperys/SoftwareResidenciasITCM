import React, { useState, createContext, useContext, useCallback } from "react";

// ══════════════════════════════════════════════════════════════
// CONTEXTO DE NOTIFICACIONES
// Provee: notify (toast), alert (diálogo bloqueante), confirm
// ══════════════════════════════════════════════════════════════

export const NotifContext = createContext(null);

const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    confirm: '?',
};

const TITLES = {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
    confirm: 'Confirmar acción',
};

export function NotifProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [dialog, setDialog] = useState(null); // { type, title, message, resolve }
    const [dialogExiting, setDialogExiting] = useState(false);

    /* ── Toast (non-blocking, auto-dismiss) ── */
    const notify = useCallback((message, type = 'info', title) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, title, exiting: false }]);
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
        }, 3200);
    }, []);

    /* ── Blocking dialog (returns Promise<bool>) ── */
    const showDialog = useCallback((type, message, title) => {
        return new Promise(resolve => {
            setDialog({ type, message, title: title || TITLES[type], resolve });
            setDialogExiting(false);
        });
    }, []);

    /* alert-style (one OK button) */
    const alert = useCallback((message, type = 'error', title) =>
        showDialog(type, message, title), [showDialog]);

    /* confirm-style (Cancel + Confirm buttons) */
    const confirm = useCallback((message, title) =>
        showDialog('confirm', message, title || 'Confirmar acción'), [showDialog]);

    const closeDialog = (result) => {
        setDialogExiting(true);
        setTimeout(() => {
            setDialog(null);
            setDialogExiting(false);
            dialog?.resolve(result);
        }, 180);
    };

    return (
        <NotifContext.Provider value={{ notify, alert, confirm }}>
            {children}

            {/* ── Blocking Dialog ── */}
            {dialog && (
                <div className="notif-overlay">
                    <div className="notif-backdrop" onClick={() => dialog.type !== 'confirm' && closeDialog(false)} />
                    <div className={`notif-card${dialogExiting ? ' exiting' : ''}`}>
                        <div className="notif-icon-row">
                            <div className={`notif-icon-circle ${dialog.type}`}>
                                {ICONS[dialog.type]}
                            </div>
                        </div>
                        <div className="notif-body">
                            <div className="notif-title">{dialog.title}</div>
                            <div className="notif-message">{dialog.message}</div>
                        </div>
                        <div className="notif-actions">
                            {dialog.type === 'confirm' ? (
                                <>
                                    <button className="notif-btn cancel" onClick={() => closeDialog(false)}>
                                        Cancelar
                                    </button>
                                    <button className="notif-btn danger" onClick={() => closeDialog(true)}>
                                        Confirmar
                                    </button>
                                </>
                            ) : (
                                <button className="notif-btn primary" onClick={() => closeDialog(false)}>
                                    Aceptar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast Stack ── */}
            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map(t => (
                        <div key={t.id} className={`toast ${t.type}${t.exiting ? ' exiting' : ''}`}>
                            <span className="toast-dot">
                                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                                    {t.type === 'success' ? 'check_circle'
                                        : t.type === 'error' ? 'cancel'
                                        : t.type === 'warning' ? 'warning'
                                        : 'info'}
                                </span>
                            </span>
                            <span className="toast-text">{t.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </NotifContext.Provider>
    );
}

export function useNotification() {
    const ctx = useContext(NotifContext);
    if (!ctx) throw new Error('useNotification must be used within NotifProvider');
    return ctx;
}
