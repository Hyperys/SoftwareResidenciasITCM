// ══════════════════════════════════════════════════════════════
// APP.JSX — Ensamblador principal de la aplicación
// Importa todos los módulos separados y ensambla el layout
// ══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";

// ── Estilos globales
import { styles } from "./estilos/globales";

// ── Contexto de notificaciones
import { NotifProvider } from "./contexto/ContextoNotificaciones";

// ── Componentes de plantilla
import { NavDock } from "./componentes/plantilla/NavDock";

// ── Componente Icon (para el sidebar)
import { Icon } from "./componentes/compartidos/Icono";

// ── Páginas
import { Dashboard } from "./paginas/Dashboard";
import { Residentes } from "./paginas/Residentes";
import { Empresas } from "./paginas/Empresas";
import { Asesores } from "./paginas/Asesores";
import { Revisores } from "./paginas/Revisores";
import { Carreras } from "./paginas/Carreras";
import { Proyectos } from "./paginas/Proyectos";
import { Reportes } from "./paginas/Reportes";

const MSF_LOGO_SIZE = 70;

export default function App() {
    const [page, setPage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const nav = [
        { id: "dashboard", label: "Panel principal",        short: "Inicio",     icon: "dashboard" },
        { id: "projects",  label: "Proyectos en progreso",  short: "Proyectos",  icon: "projects"  },
        { id: "residents", label: "Residentes",             short: "Residentes", icon: "residents" },
        { id: "advisors",  label: "Asesores",               short: "Asesores",   icon: "advisors"  },
        { id: "revisores", label: "Revisores",              short: "Revisores",  icon: "revisores" },
        { id: "companies", label: "Empresas",               short: "Empresas",   icon: "companies" },
        { id: "careers",   label: "Carreras",               short: "Carreras",   icon: "careers"   },
        { id: "reports",   label: "Reportes",               short: "Reportes",   icon: "reports"   },
    ];

    const titles = {
        dashboard: "Panel de administración",
        projects:  "Proyectos en progreso",
        residents: "Residentes",
        advisors:  "Catálogo de asesores",
        revisores: "Catálogo de revisores",
        companies: "Catálogo de empresas",
        careers:   "Carreras y especialidades",
        reports:   "Informes y reportes",
    };

    const pageEl = {
        dashboard: <Dashboard setPage={setPage} />,
        projects:  <Proyectos darkMode={darkMode} />,
        residents: <Residentes />,
        advisors:  <Asesores />,
        revisores: <Revisores />,
        companies: <Empresas />,
        careers:   <Carreras />,
        reports:   <Reportes />,
    };

    return (
        <NotifProvider>
            <>
                <style>{styles}</style>
                <div className="app">

                    {/* ── TOPBAR ── */}
                    <div className="topbar">
                        <div className="topbar-title">{titles[page]}</div>
                        <span className="topbar-badge">
                            <span className="material-symbols-rounded" style={{fontSize:13,verticalAlign:'middle',marginRight:4}}>school</span>
                            TECNM
                        </span>
                    </div>

                    {/* ── FILA INFERIOR ── */}
                    <div className="body-row">

                        {/* Sidebar / Dock flotante */}
                        <div className={`sidebar ${sidebarOpen ? "expanded" : "collapsed"}`}>
                            <div className="sidebar-logo">
                                <button className="sidebar-hamburger" onClick={() => setSidebarOpen(true)} title="Expandir menú">
                                    <span></span><span></span><span></span>
                                </button>
                                <div className="logo-text">
                                    <div className="inst">TECNM</div>
                                    <div className="title">Archivo de<br />Residencias</div>
                                    <div className="sub">Ciudad Madero</div>
                                </div>
                                <div className="sidebar-toggle-float" onClick={() => setSidebarOpen(false)} title="Colapsar">
                                    <span className="material-symbols-rounded" style={{fontSize:16,color:'rgba(255,255,255,0.9)'}}>chevron_left</span>
                                </div>
                            </div>
                            <div className="nav-section">Navegación</div>
                            <NavDock isCollapsed={!sidebarOpen}>
                                {nav.map(n => (
                                    <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                                        <Icon n={n.icon} />
                                        <span className="nav-label-full">{n.label}</span>
                                        <span className="nav-label-short">{n.short}</span>
                                    </div>
                                ))}
                                <div className="sidebar-manual"
                                    onClick={() => window.open('/manual_usuario.pdf', '_blank')}
                                    title="Manual de usuario">
                                    <span className="material-symbols-rounded" style={{fontSize:20,opacity:0.8}}>menu_book</span>
                                    <span className="nav-label-full">Manual de usuario</span>
                                    <span className="manual-label-short">Manual de usuario</span>
                                </div>
                                <div className="sidebar-darkrow" onClick={sidebarOpen ? undefined : () => setDarkMode(d => !d)}>
                                    <button className="dark-icon-btn" onClick={() => setDarkMode(d => !d)} title={darkMode ? "Modo oscuro" : "Modo claro"}>
                                        <span className="material-symbols-rounded" style={{fontSize:18,color:'rgba(255,255,255,0.75)'}}>
                                            {darkMode ? 'light_mode' : 'dark_mode'}
                                        </span>
                                    </button>
                                    <span className="dark-mode-label-short">{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                                    <span className="dark-label">{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                                    <label className="dark-switch">
                                        <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
                                        <span className="dark-slider"></span>
                                    </label>
                                </div>
                            </NavDock>
                            <div className="sidebar-footer">
                                <img src="/msf_logo.png" alt="MSF"
                                    style={{ width: MSF_LOGO_SIZE, height: MSF_LOGO_SIZE, objectFit: "contain", opacity: 0.85, display: "block", margin: "0 auto 6px" }} />
                                <span>v1.0 · 2026</span>
                            </div>
                        </div>

                        {/* Panel principal */}
                        <div className="main">
                            <div className="page-content">{pageEl[page]}</div>
                        </div>

                    </div>
                </div>
            </>
        </NotifProvider>
    );
}
