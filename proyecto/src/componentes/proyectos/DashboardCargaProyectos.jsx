import React, { useState } from "react";
import { useNotification } from "../../contexto/ContextoNotificaciones";

// ══════════════════════════════════════════════════════════════
// DASHBOARD CARGA PROYECTOS (mejorado con dark mode)
// Muestra KPIs, gráfica de barras y detalle por asesor
// Props: asesores, proyectos, darkMode, onRefreshProyectos
// ══════════════════════════════════════════════════════════════

export function DashboardCargaProyectos({ asesores, proyectos, darkMode, onRefreshProyectos }) {
    const { notify, alert, confirm } = useNotification();
    const [expandedAdvisor, setExpandedAdvisor] = useState(null);
    const [projectsState, setProjectsState] = useState({});

    const asesoresConProyectos = asesores.map(asesor => {
        const proyectosAsignados = (proyectos || [])
            .filter(p => p.asesor_interno_id === asesor.id)
            .map(p => ({
                id: p.num_control,
                nombre: p.nombre_proyecto,
                estudiante: p.nombre_completo,
                carrera: p.carrera,
                hito1: p.estado_hito1,
                hito2: p.estado_hito2,
                hito3: p.estado_hito3,
            }));
        return { ...asesor, proyectos: proyectosAsignados, numProyectos: proyectosAsignados.length };
    }).filter(a => a.habilitado);

    const totalProyectos = asesoresConProyectos.reduce((sum, a) => sum + a.numProyectos, 0);
    const numAsesores = asesoresConProyectos.length;
    const promedioProyectos = numAsesores > 0 ? (totalProyectos / numAsesores).toFixed(1) : 0;
    const asesoresOrdenados = [...asesoresConProyectos].sort((a, b) => b.numProyectos - a.numProyectos);
    const maxProyectos = Math.max(...asesoresOrdenados.map(a => a.numProyectos), 1);

    // Color carga: muted en dark para evitar fatiga visual
    const getColorCarga = (n) => {
        if (darkMode) {
            if (n >= 7) return { bg: '#991B1B', label: 'Alta' };
            if (n >= 4) return { bg: '#92400E', label: 'Media' };
            if (n >= 1) return { bg: '#065F46', label: 'Baja' };
            return { bg: '#334155', label: 'Sin carga' };
        }
        if (n >= 7) return { bg: '#EF4444', label: 'Alta' };
        if (n >= 4) return { bg: '#F59E0B', label: 'Media' };
        if (n >= 1) return { bg: '#10B981', label: 'Baja' };
        return { bg: '#CBD5E1', label: 'Sin carga' };
    };

    // Design tokens mirroring Residentes dark styles
    const d = {
        pageBg: darkMode ? '#0F1623' : 'transparent',
        card: darkMode ? '#1A2236' : '#ffffff',
        cardBdr: darkMode ? '#2A3548' : '#E5EAF2',
        hdr: darkMode ? '#E2E8F0' : '#24375b',
        text: darkMode ? '#CBD5E1' : '#374151',
        sub: darkMode ? '#94A3B8' : '#64748B',
        rowDiv: darkMode ? '#2A3548' : '#F0F4F9',
        rowHover: darkMode ? '#212E45' : '#FAFBFF',
        iconBg: darkMode ? '#1E3A6E' : '#EFF6FF',
        kpiVal: darkMode ? '#E2E8F0' : '#24375b',
        badgeBg: (n) => n >= 7 ? (darkMode ? '#450A0A' : '#FEE2E2')
            : n >= 4 ? (darkMode ? '#451A03' : '#FEF3C7')
                : n >= 1 ? (darkMode ? '#064E3B' : '#D1FAE5')
                    : (darkMode ? '#1E293B' : '#F1F5F9'),
        badgeClr: (n) => n >= 7 ? (darkMode ? '#FCA5A5' : '#DC2626')
            : n >= 4 ? (darkMode ? '#FCD34D' : '#D97706')
                : n >= 1 ? (darkMode ? '#6EE7B7' : '#059669')
                    : (darkMode ? '#94A3B8' : '#64748B'),
        mColor: (state) => state === 'completado' ? '#22C55E'
            : state === 'en_progreso' ? '#EAB308'
                : (darkMode ? '#334155' : '#CBD5E1'),
        connLine: darkMode ? '#2A3548' : '#E5EAF2',
        mileLbl: darkMode ? '#475569' : '#94A3B8',
    };

    const getMilestoneState = (project, milestone) => {
        const stateKey = `${project.id}-${milestone}`;
        if (projectsState[stateKey]) return projectsState[stateKey];
        return project[`hito${milestone}`] || 'pendiente';
    };

    const toggleMilestone = async (projectId, milestone, project) => {
        // Poka-Yoke: verificar que el hito anterior esté completado
        if (milestone === 2 && getMilestoneState(project, 1) !== 'completado') return;
        if (milestone === 3 && getMilestoneState(project, 2) !== 'completado') return;

        const stateKey = `${projectId}-${milestone}`;
        const current = getMilestoneState(project, milestone);
        const next = current === 'pendiente' ? 'en_progreso' : current === 'en_progreso' ? 'completado' : 'pendiente';

        try {
            const res = await fetch(`/api/proyectos/${projectId}/hito`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hito: milestone, estado: next })
            });
            const data = await res.json();
            if (!res.ok) {
                await alert(data.error || 'Error al actualizar el hito');
                return;
            }
            setProjectsState(prev => ({ ...prev, [stateKey]: next }));
            notify(`Hito ${milestone} actualizado a ${next === 'en_progreso' ? 'En proceso' : next === 'completado' ? 'Completado' : 'Pendiente'}`, 'success');
        } catch (e) {
            await alert('Error de conexión al actualizar hito');
        }
    };

    const transferirAExpediente = async (projectId) => {
        const ok = await confirm('¿Desea generar el expediente para este proyecto? Esta acción no se puede deshacer.', 'Generar Expediente');
        if (!ok) return;
        try {
            const res = await fetch(`/api/proyectos/${projectId}/convertir`, {
                method: 'PATCH'
            });
            const data = await res.json();
            if (!res.ok) {
                await alert(data.error || 'No se pudo generar el expediente');
                return;
            }
            notify(data.mensaje || 'Expediente generado correctamente', 'success');
            onRefreshProyectos && onRefreshProyectos();
        } catch (e) {
            await alert('Error de conexión al generar expediente');
        }
    };

    const Card = ({ style, children }) => (
        <div style={{ background: d.card, border: `1px solid ${d.cardBdr}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>
            {children}
        </div>
    );
    const CardHeader = ({ title }) => (
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${d.cardBdr}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: d.hdr }}>{title}</span>
        </div>
    );

    return (
        <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { icon: 'task_alt', label: 'Total Projects', val: totalProyectos },
                    { icon: 'group', label: 'Active Advisors', val: numAsesores },
                    { icon: 'bar_chart', label: 'Average Load', val: promedioProyectos },
                ].map(({ icon, label, val }) => (
                    <div key={label} style={{ background: d.card, border: `1px solid ${d.cardBdr}`, borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: d.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-rounded" style={{fontSize:28,color:'#2f4d80'}}>{icon}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: d.sub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: d.kpiVal, lineHeight: 1 }}>{val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráfica de barras */}
            <Card style={{ marginBottom: 24 }}>
                <CardHeader title="Carga de proyectos por asesor" />
                <div style={{ padding: 24 }}>
                    {asesoresOrdenados.map((asesor, idx) => {
                        const colorInfo = getColorCarga(asesor.numProyectos);
                        const barWidth = (asesor.numProyectos / maxProyectos) * 100;
                        return (
                            <div key={asesor.id} style={{ display: 'flex', alignItems: 'center', paddingTop: idx === 0 ? 0 : 12, paddingBottom: 12, borderBottom: idx < asesoresOrdenados.length - 1 ? `1px solid ${d.rowDiv}` : 'none' }}>
                                <div style={{ width: 180, fontSize: 13, fontWeight: 600, color: d.hdr, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {asesor.nombres} {asesor.apellidos}
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ height: 32, width: `${barWidth}%`, background: colorInfo.bg, borderRadius: 6, minWidth: asesor.numProyectos > 0 ? 40 : 0, transition: 'width 0.3s ease' }}></div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: d.text, minWidth: 70 }}>
                                        {asesor.numProyectos} {asesor.numProyectos === 1 ? 'proyecto' : 'proyectos'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Leyenda de estados */}
            <div style={{ marginBottom: 16, padding: '12px 16px', background: darkMode ? '#1e293b' : '#ffffff', border: `1px solid ${darkMode ? '#2A3548' : '#E5EAF2'}`, borderRadius: 10, display: 'flex', gap: 24, alignItems: 'center', fontSize: 12 }}>
                <strong style={{ color: d.hdr }}>Estados del proyecto:</strong>
                <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.mColor('en_progreso'), boxShadow: `0 0 6px ${d.mColor('en_progreso')}80` }}></div>
                        <span style={{ color: d.sub }}>En proceso</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.mColor('completado'), boxShadow: `0 0 6px ${d.mColor('completado')}80` }}></div>
                        <span style={{ color: d.sub }}>Finalizado</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.mColor('pendiente') }}></div>
                        <span style={{ color: d.sub }}>Pendiente</span>
                    </div>
                </div>
            </div>

            {/* Detalle por asesor (Accordion) */}
            <Card>
                <CardHeader title="Detalle por asesor" />
                <div style={{ padding: '0 24px 24px 24px' }}>
                    {asesoresOrdenados.map((asesor, idx) => {
                        const isExpanded = expandedAdvisor === asesor.id;
                        return (
                            <div key={asesor.id} style={{ borderBottom: idx < asesoresOrdenados.length - 1 ? `1px solid ${d.rowDiv}` : 'none', paddingTop: idx === 0 ? 24 : 16, paddingBottom: 16 }}>
                                <div
                                    onClick={() => setExpandedAdvisor(isExpanded ? null : asesor.id)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = d.rowHover}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className="material-symbols-rounded" style={{ fontSize: 18, color: d.sub }}>{isExpanded ? 'expand_more' : 'chevron_right'}</span>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: d.hdr }}>{asesor.nombres} {asesor.apellidos}</div>
                                            <div style={{ fontSize: 12, color: d.sub, marginTop: 2 }}>{asesor.numProyectos} {asesor.numProyectos === 1 ? 'proyecto activo' : 'proyectos activos'}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: d.badgeBg(asesor.numProyectos), color: d.badgeClr(asesor.numProyectos) }}>
                                        {asesor.numProyectos >= 7 ? 'Carga alta' : asesor.numProyectos >= 4 ? 'Carga media' : asesor.numProyectos >= 1 ? 'Disponible' : 'Sin carga'}
                                    </div>
                                </div>

                                {isExpanded && asesor.proyectos.length > 0 && (
                                    <div style={{ marginTop: 12, paddingLeft: 42, paddingRight: 12 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: d.sub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                                            Proyectos activos:
                                        </div>
                                        {asesor.proyectos.map((proyecto) => (
                                            <div key={proyecto.id} style={{ fontSize: 13, color: d.text, paddingTop: 12, paddingBottom: 12, borderBottom: `1px solid ${d.rowDiv}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <strong style={{ color: d.hdr }}>{proyecto.nombre}</strong>
                                                        <span className="badge badge-blue" style={{ fontSize: 10, padding: '2px 6px' }}>{proyecto.carrera}</span>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: d.sub }}>{proyecto.estudiante}</div>
                                                </div>

                                                {/* Botón Generar Expediente — solo si hito 3 está completado */}
                                                {getMilestoneState(proyecto, 3) === 'completado' && (
                                                    <button
                                                        onClick={() => transferirAExpediente(proyecto.id)}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                                            padding: '4px 12px', fontSize: 11, fontWeight: 600,
                                                            border: '1.5px solid #24375b', borderRadius: 6,
                                                            background: 'transparent', color: '#24375b',
                                                            cursor: 'pointer', transition: 'all 0.15s',
                                                            whiteSpace: 'nowrap', flexShrink: 0
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#24375b'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#24375b'; }}
                                                        title="Transferir a expediente de residente"
                                                    >
                                                        <span className="material-symbols-rounded" style={{fontSize:15}}>create_new_folder</span>
                                                        Generar Expediente
                                                    </button>
                                                )}

                                                {/* Flujo lineal de hitos */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
                                                    {[1, 2, 3].map((num, mIdx) => {
                                                        const state = getMilestoneState(proyecto, num);
                                                        const color = d.mColor(state);
                                                        const milestoneLabels = { 1: '1er reporte', 2: '2do reporte', 3: 'Reporte final' };
                                                        const isBlocked = (num === 2 && getMilestoneState(proyecto, 1) !== 'completado')
                                                            || (num === 3 && getMilestoneState(proyecto, 2) !== 'completado');
                                                        return (
                                                            <React.Fragment key={num}>
                                                                <div style={{
                                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                                                    opacity: isBlocked ? 0.4 : 1,
                                                                    pointerEvents: isBlocked ? 'none' : 'auto',
                                                                    transition: 'opacity 0.2s'
                                                                }}>
                                                                    <div
                                                                        onClick={() => toggleMilestone(proyecto.id, num, proyecto)}
                                                                        style={{
                                                                            width: 20, height: 20, borderRadius: '50%', background: color,
                                                                            cursor: isBlocked ? 'not-allowed' : 'pointer',
                                                                            transition: 'all 0.2s', border: `2px solid ${color}`,
                                                                            boxShadow: state !== 'pending' ? `0 2px 8px ${color}40` : 'none'
                                                                        }}
                                                                        title={isBlocked
                                                                            ? `Hito ${num}: Bloqueado (complete el hito anterior primero)`
                                                                            : `Hito ${num}: ${state === 'completado' ? 'Finalizado' : state === 'en_progreso' ? 'En proceso' : 'Pendiente'} (click para cambiar)`}
                                                                    />
                                                                    <span style={{ fontSize: 9, color: d.mileLbl, whiteSpace: 'nowrap', textAlign: 'center' }}>{milestoneLabels[num]}</span>
                                                                </div>
                                                                {mIdx < 2 && <div style={{ width: 24, height: 2, background: d.connLine, marginBottom: 14 }}></div>}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isExpanded && asesor.proyectos.length === 0 && (
                                    <div style={{ marginTop: 12, paddingLeft: 42, fontSize: 13, color: d.sub, fontStyle: 'italic' }}>
                                        Sin proyectos asignados
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
