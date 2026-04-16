import React, { useState } from "react";

// ══════════════════════════════════════════════════════════════
// DASHBOARD CARGA (auxiliar de la página Asesores)
// Muestra datos mock de carga de proyectos por asesor
// Props: asesores (array)
// ══════════════════════════════════════════════════════════════

export function DashboardCarga({ asesores }) {
    const [expandedAdvisor, setExpandedAdvisor] = useState(null);

    // Datos mock de proyectos (esto vendrá del backend en el futuro)
    const proyectosPorAsesor = {
        1: [
            { id: 1, nombre: "Optimización de Logística", estudiante: "Juan Martínez", carrera: "ISC" },
            { id: 2, nombre: "Desarrollo Plataforma Web", estudiante: "Ana Torres", carrera: "ISC" },
            { id: 3, nombre: "Análisis de Datos", estudiante: "Luis Ramírez", carrera: "II" },
            { id: 4, nombre: "Sistema ERP Empresarial", estudiante: "María González", carrera: "ISC" },
            { id: 5, nombre: "App Móvil Inventarios", estudiante: "Carlos Ruiz", carrera: "ISC" },
            { id: 6, nombre: "Dashboard Analytics", estudiante: "Laura Díaz", carrera: "II" },
            { id: 7, nombre: "API REST Pagos", estudiante: "Pedro Sánchez", carrera: "ISC" },
            { id: 8, nombre: "Web Institucional", estudiante: "Rosa Vega", carrera: "ISC" },
            { id: 9, nombre: "Sistema Ventas", estudiante: "Jorge Castro", carrera: "II" },
            { id: 10, nombre: "App Logística", estudiante: "Roberto Cruz", carrera: "ISC" },
            { id: 11, nombre: "Portal Clientes", estudiante: "Sofia Ramírez", carrera: "ISC" },
            { id: 12, nombre: "CRM Empresarial", estudiante: "Miguel Ángel López", carrera: "II" },
        ],
        2: [
            { id: 13, nombre: "Sistema Inventarios", estudiante: "Carmen López", carrera: "II" },
            { id: 14, nombre: "Dashboard Ventas", estudiante: "Antonio Vargas", carrera: "ISC" },
            { id: 15, nombre: "App de Gestión", estudiante: "Isabel Cruz", carrera: "ISC" },
            { id: 16, nombre: "Portal Educativo", estudiante: "Fernando Ruiz", carrera: "ISC" },
            { id: 17, nombre: "Sistema de Reportes", estudiante: "Patricia Gómez", carrera: "II" },
            { id: 18, nombre: "Plataforma E-learning", estudiante: "Ricardo Torres", carrera: "ISC" },
            { id: 19, nombre: "App de Seguimiento", estudiante: "Gabriela Díaz", carrera: "ISC" },
            { id: 20, nombre: "Sistema de Calidad", estudiante: "Alberto Sánchez", carrera: "II" },
            { id: 21, nombre: "Web Corporativa", estudiante: "Monica Pérez", carrera: "ISC" },
            { id: 22, nombre: "API de Integración", estudiante: "Héctor Castro", carrera: "ISC" },
        ],
        3: [
            { id: 23, nombre: "App de Servicios", estudiante: "Daniela Ramírez", carrera: "ISC" },
            { id: 24, nombre: "Sistema de Compras", estudiante: "Andrés López", carrera: "II" },
            { id: 25, nombre: "Portal de Proveedores", estudiante: "Claudia Martínez", carrera: "ISC" },
            { id: 26, nombre: "Dashboard Operativo", estudiante: "Javier Torres", carrera: "II" },
            { id: 27, nombre: "App de Monitoreo", estudiante: "Beatriz Ruiz", carrera: "ISC" },
            { id: 28, nombre: "Sistema de Control", estudiante: "Raúl Gómez", carrera: "ISC" },
            { id: 29, nombre: "Web de Consultas", estudiante: "Verónica Díaz", carrera: "II" },
            { id: 30, nombre: "API de Reportes", estudiante: "Ernesto Sánchez", carrera: "ISC" },
        ],
        4: [
            { id: 31, nombre: "Sistema de Nómina", estudiante: "Silvia Pérez", carrera: "II" },
            { id: 32, nombre: "App de Recursos", estudiante: "Guillermo Castro", carrera: "ISC" },
            { id: 33, nombre: "Portal de Empleados", estudiante: "Mariana Ramírez", carrera: "ISC" },
            { id: 34, nombre: "Dashboard RH", estudiante: "Francisco López", carrera: "II" },
            { id: 35, nombre: "Sistema de Evaluación", estudiante: "Adriana Martínez", carrera: "ISC" },
            { id: 36, nombre: "App de Capacitación", estudiante: "Rodrigo Torres", carrera: "ISC" },
        ],
        5: [
            { id: 37, nombre: "Web de Productos", estudiante: "Valeria Ruiz", carrera: "ISC" },
            { id: 38, nombre: "Sistema de Marketing", estudiante: "Sergio Gómez", carrera: "II" },
            { id: 39, nombre: "App de Promociones", estudiante: "Carolina Díaz", carrera: "ISC" },
            { id: 40, nombre: "Portal de Clientes", estudiante: "Mauricio Sánchez", carrera: "ISC" },
            { id: 41, nombre: "Dashboard Comercial", estudiante: "Alejandra Pérez", carrera: "II" },
        ],
        6: [
            { id: 42, nombre: "Sistema de Facturación", estudiante: "Eduardo Castro", carrera: "ISC" },
            { id: 43, nombre: "App Contable", estudiante: "Martha Ramírez", carrera: "II" },
            { id: 44, nombre: "Portal Financiero", estudiante: "Oscar López", carrera: "ISC" },
            { id: 45, nombre: "Dashboard Fiscal", estudiante: "Lorena Martínez", carrera: "ISC" },
        ],
        7: [
            { id: 46, nombre: "Web de Servicios", estudiante: "Pablo Torres", carrera: "II" },
            { id: 47, nombre: "Sistema de Tickets", estudiante: "Natalia Ruiz", carrera: "ISC" },
            { id: 48, nombre: "App de Soporte", estudiante: "Arturo Gómez", carrera: "ISC" },
        ],
        8: [
            { id: 49, nombre: "Portal Académico", estudiante: "Julia Díaz", carrera: "ISC" },
            { id: 50, nombre: "Sistema de Calificaciones", estudiante: "Víctor Sánchez", carrera: "II" },
        ],
        9: [
            { id: 51, nombre: "App de Biblioteca", estudiante: "Camila Pérez", carrera: "ISC" },
            { id: 52, nombre: "Sistema de Préstamos", estudiante: "Diego Castro", carrera: "ISC" },
        ],
        10: [
            { id: 53, nombre: "Dashboard Administrativo", estudiante: "Elena Ramírez", carrera: "II" },
        ],
    };

    const asesoresConProyectos = asesores.map(asesor => ({
        ...asesor,
        proyectos: proyectosPorAsesor[asesor.id] || [],
        numProyectos: (proyectosPorAsesor[asesor.id] || []).length
    })).filter(a => a.habilitado);

    const totalProyectos = asesoresConProyectos.reduce((sum, a) => sum + a.numProyectos, 0);
    const numAsesores = asesoresConProyectos.length;
    const promedioProyectos = numAsesores > 0 ? (totalProyectos / numAsesores).toFixed(1) : 0;

    const asesoresOrdenados = [...asesoresConProyectos].sort((a, b) => b.numProyectos - a.numProyectos);
    const maxProyectos = Math.max(...asesoresOrdenados.map(a => a.numProyectos), 1);

    const getColorCarga = (numProyectos) => {
        if (numProyectos >= 7) return { bg: '#EF4444', label: 'Alta' };
        if (numProyectos >= 4) return { bg: '#F59E0B', label: 'Media' };
        if (numProyectos >= 1) return { bg: '#10B981', label: 'Baja' };
        return { bg: '#CBD5E1', label: 'Sin carga' };
    };

    return (
        <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-rounded" style={{fontSize:28,color:'#2f4d80'}}>task_alt</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Projects</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#24375b', lineHeight: 1 }}>{totalProyectos}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-rounded" style={{fontSize:28,color:'#2f4d80'}}>group</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Advisors</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#24375b', lineHeight: 1 }}>{numAsesores}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-rounded" style={{fontSize:28,color:'#2f4d80'}}>bar_chart</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Load</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#24375b', lineHeight: 1 }}>{promedioProyectos}</div>
                    </div>
                </div>
            </div>

            {/* Gráfica de barras */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <span className="card-title">Carga de proyectos por asesor</span>
                </div>
                <div style={{ padding: 24 }}>
                    {asesoresOrdenados.map((asesor, idx) => {
                        const colorInfo = getColorCarga(asesor.numProyectos);
                        const barWidth = (asesor.numProyectos / maxProyectos) * 100;
                        return (
                            <div key={asesor.id} style={{ display: 'flex', alignItems: 'center', paddingTop: idx === 0 ? 0 : 12, paddingBottom: 12, borderBottom: idx < asesoresOrdenados.length - 1 ? '1px solid #F0F4F9' : 'none' }}>
                                <div style={{ width: 180, fontSize: 13, fontWeight: 600, color: '#24375b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {asesor.nombres} {asesor.apellidos}
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ height: 32, width: `${barWidth}%`, background: colorInfo.bg, borderRadius: 6, minWidth: asesor.numProyectos > 0 ? 40 : 0, transition: 'width 0.3s ease' }}></div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 70 }}>
                                        {asesor.numProyectos} {asesor.numProyectos === 1 ? 'proyecto' : 'proyectos'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detalle por asesor (Accordion) */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Detalle por asesor</span>
                </div>
                <div style={{ padding: '0 24px 24px 24px' }}>
                    {asesoresOrdenados.map((asesor, idx) => {
                        const isExpanded = expandedAdvisor === asesor.id;
                        return (
                            <div key={asesor.id} style={{ borderBottom: idx < asesoresOrdenados.length - 1 ? '1px solid #F0F4F9' : 'none', paddingTop: idx === 0 ? 24 : 16, paddingBottom: 16 }}>
                                <div
                                    onClick={() => setExpandedAdvisor(isExpanded ? null : asesor.id)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#9cb7e0ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#64748B' }}>
                                            {isExpanded ? 'expand_more' : 'chevron_right'}
                                        </span>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#24375b' }}>{asesor.nombres} {asesor.apellidos}</div>
                                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{asesor.numProyectos} {asesor.numProyectos === 1 ? 'proyecto activo' : 'proyectos activos'}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                        background: asesor.numProyectos >= 7 ? '#FEE2E2' : asesor.numProyectos >= 4 ? '#FEF3C7' : asesor.numProyectos >= 1 ? '#D1FAE5' : '#F1F5F9',
                                        color: asesor.numProyectos >= 7 ? '#DC2626' : asesor.numProyectos >= 4 ? '#D97706' : asesor.numProyectos >= 1 ? '#059669' : '#64748B'
                                    }}>
                                        {asesor.numProyectos >= 7 ? 'Carga alta' : asesor.numProyectos >= 4 ? 'Carga media' : asesor.numProyectos >= 1 ? 'Disponible' : 'Sin carga'}
                                    </div>
                                </div>

                                {isExpanded && asesor.proyectos.length > 0 && (
                                    <div style={{ marginTop: 12, paddingLeft: 42, paddingRight: 12 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                                            Proyectos activos:
                                        </div>
                                        {asesor.proyectos.map((proyecto, pIdx) => (
                                            <div key={proyecto.id} style={{ fontSize: 13, color: '#374151', paddingTop: 6, paddingBottom: 6, display: 'flex', gap: 8 }}>
                                                <span style={{ color: '#94A3B8' }}>•</span>
                                                <span>
                                                    <strong style={{ color: '#24375b' }}>{proyecto.nombre}</strong>
                                                    {' - '}
                                                    <span>{proyecto.estudiante}</span>
                                                    {' - '}
                                                    <span className="badge badge-blue" style={{ fontSize: 10, padding: '2px 6px' }}>{proyecto.carrera}</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isExpanded && asesor.proyectos.length === 0 && (
                                    <div style={{ marginTop: 12, paddingLeft: 42, fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>
                                        Sin proyectos asignados
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
