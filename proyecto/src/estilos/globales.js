// ══════════════════════════════════════════════════════════════
// CONSTANTES DE COLOR GLOBALES
// ══════════════════════════════════════════════════════════════

export const NAV_BLUE = "#24375b";
export const MID_BLUE = "#1c3256";
export const ACCENT = "#2f4d80";
export const LIGHT_ACCENT = "#EFF6FF";
export const BG = "#F4F6FB";

// ══════════════════════════════════════════════════════════════
// ESTILOS GLOBALES (inyectados como <style> en App.jsx)
// ══════════════════════════════════════════════════════════════

export const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
.material-symbols-rounded { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Rounded'; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-smoothing: antialiased; user-select: none; vertical-align: middle; }
.material-symbols-rounded.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'DM Sans',sans-serif; background:${BG}; color:#1E2A3B; }
/* ── ROOT ────────────────────────────────────────────────────────── */
.app {
  display:flex; flex-direction:column;
  height:100vh; overflow:hidden;
  background:#f4f6fb;
}

/* ── TOPBAR: franja completa siempre arriba ───────────────────────── */
.topbar {
  width:100%; height:60px; flex-shrink:0; box-sizing:border-box;
  background:#fff; border-bottom:1px solid #E5EAF2;
  display:flex; align-items:center; padding:0 28px; gap:16px;
  box-shadow:0 2px 8px rgba(0,0,0,0.05);
  position:relative; z-index:30;
}

/* ── BODY ROW ─────────────────────────────────────────────────────── */
.body-row {
  display:flex; flex-direction:row;
  flex:1; overflow:hidden;
  position:relative;
}

/* ── SIDEBAR: morph flotante ↔ anclado ───────────────────────────── */
.sidebar {
  background:#24375b;
  display:flex; flex-direction:column;
  flex-shrink:0;
  overflow:hidden;
  z-index:20;
  /* Transición suave de toda la geometría */
  transition:
    width            0.35s cubic-bezier(0.4,0,0.2,1),
    min-width        0.35s cubic-bezier(0.4,0,0.2,1),
    border-radius    0.35s cubic-bezier(0.4,0,0.2,1),
    margin           0.35s cubic-bezier(0.4,0,0.2,1),
    height           0.35s cubic-bezier(0.4,0,0.2,1),
    box-shadow       0.35s cubic-bezier(0.4,0,0.2,1);
}

/* COLAPSADO → Dock flotante (estado 1) */
.sidebar.collapsed {
  width:80px; min-width:80px;
  margin:12px 0 12px 12px;
  border-radius:16px;
  height:calc(100% - 24px);
  box-shadow:0 4px 20px rgba(0,0,0,0.15);
  align-self:flex-start;
}

/* EXPANDIDO → Anclado (estado 2) */
.sidebar.expanded {
  width:240px; min-width:240px;
  margin:0;
  border-radius:0 20px 20px 0;
  height:100%;
  box-shadow:4px 0 16px rgba(0,0,0,0.08);
  align-self:stretch;
}

/* ── PANEL PRINCIPAL ─────────────────────────────────────────────── */
.main {
  flex:1; display:flex; flex-direction:column;
  overflow:hidden; min-width:0;
  background:#fff;
  /* Cuando sidebar está expandida (anclada), el panel se une a sus bordes derechos */
  transition: margin 0.35s cubic-bezier(0.4,0,0.2,1),
              border-radius 0.35s cubic-bezier(0.4,0,0.2,1);
}

/* Panel cuando sidebar EXPANDIDA (anclada) */
.sidebar.expanded ~ .main {
  margin:0;
  border-radius:0;
  box-shadow:none;
}

/* Panel cuando sidebar COLAPSADA (flotante) */
.sidebar.collapsed ~ .main {
  margin:12px 12px 12px 10px;
  border-radius:20px;
  box-shadow:0 2px 8px rgba(0,0,0,0.06);
}
.sidebar-logo {
  padding:18px 16px 14px; border-bottom:1px solid rgba(255,255,255,0.10);
  white-space:nowrap; overflow:hidden; cursor:default; display:flex; align-items:center;
  justify-content:space-between; transition:background 0.15s;
  background: #24375b;
}
.sidebar.collapsed .sidebar-logo { 
  padding:18px 8px 14px; 
  justify-content:center;
  cursor:default;
  background: #24375b;
}
/* Hamburger button in collapsed mode (replaces AR text) */
.sidebar-hamburger {
  display:none; flex-direction:column; align-items:center; justify-content:center;
  width:40px; height:40px; border-radius:10px; cursor:pointer;
  background:rgba(255,255,255,0.08); border:none; gap:5px; padding:0;
  transition: background 0.15s;
}
.sidebar-hamburger:hover { background:rgba(255,255,255,0.15); }
.sidebar-hamburger span {
  display:block; width:20px; height:2px; background:rgba(255,255,255,0.85); border-radius:2px;
}
.sidebar.collapsed .sidebar-hamburger { display:flex; }
/* Chevron collapse button (expanded mode) – fully inside header */
.sidebar-toggle-float {
  width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.12);
  border:1px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0;
  transition: background 0.15s;
}
.sidebar-toggle-float:hover { background:rgba(255,255,255,0.22); }
.sidebar.collapsed .sidebar-toggle-float { display:none; }
.sidebar-logo .inst { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.45); font-weight:500; margin-bottom:3px; }
.sidebar-logo .title { font-size:14px; font-weight:700; color:#fff; line-height:1.3; }
.sidebar-logo .sub { font-size:11px; color:rgba(255,255,255,0.5); margin-top:2px; font-weight:400; }
.sidebar.collapsed .sidebar-logo .logo-text { display:none; }
.sidebar.expanded .sidebar-logo .logo-text { display:flex; flex-direction:column; }
.nav-section {
  padding:16px 12px 8px; font-size:9px; letter-spacing:2px; text-transform:uppercase;
  color:rgba(255,255,255,0.3); font-weight:600; white-space:nowrap; overflow:hidden;
  transition: opacity 0.2s;
}
.sidebar.collapsed .nav-section { opacity:0; height:0; padding:0; margin:0; }
/* Nav item – expanded: horizontal icon+label; collapsed: vertical icon+mini-label (Teams-style) */
.nav-item {
  display:flex; align-items:center; gap:10px; padding:10px 16px; margin:2px 8px;
  border-radius:8px; cursor:pointer; font-size:13px; font-weight:500;
  color:rgba(255,255,255,0.6); transition:all 0.15s ease; white-space:nowrap; position:relative;
}
.nav-item:hover { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.9); }
.nav-item.active { 
  background:#3d5a8a; 
  color:#fff; 
  border-radius: 16px;
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 70%;
  background: #7a9fd4;
  border-radius: 0 2px 2px 0;
}
.nav-item svg { flex-shrink:0; opacity:0.8; }
.nav-item.active svg { opacity:1; }
.nav-item .nav-label-full { 
  transition: opacity 0.15s ease, max-width 0.28s ease;
  overflow: hidden; white-space: nowrap;
}
.nav-item .nav-label-short { display:none; /* hidden expanded */ }
.sidebar.collapsed .nav-item {
  flex-direction:column; align-items:center; justify-content:center;
  padding:10px 6px; margin:2px 6px; gap:4px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s ease;
  transform-origin: center bottom;
  will-change: transform;
}
.sidebar.collapsed .nav-item.active {
  border-radius: 16px;
  padding:8px 6px 7px 6px;
}
.sidebar.collapsed .nav-item.active::before {
  left: 0;
  width: 3px;
  height: 60%;
}
.sidebar.collapsed .nav-item .nav-label-full { display:none; }
.sidebar.collapsed .nav-item .nav-label-short {
  display:block; font-size:11px; font-weight:600; color:rgba(255,255,255,0.55);
  line-height:1.2; text-align:center; letter-spacing:0;
  margin-top: 2px;
  transition: font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sidebar.collapsed .nav-item svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 22px; height: 22px;
}
.sidebar.collapsed .nav-item:hover { background: rgba(61,90,138,0.65); color:#fff; }
.sidebar.collapsed .nav-item.active .nav-label-short { color:#fff; }
.sidebar.collapsed .nav-item:hover .nav-label-short { color:#fff; }
.nav-item .tooltip { display:none; /* removed for Teams-style */ }
.sidebar-footer {
  padding:12px 16px 16px; border-top:1px solid rgba(255,255,255,0.08);
  font-size:11px; color:rgba(255,255,255,0.3); text-align:center; white-space:nowrap; overflow:hidden;
}
.sidebar.collapsed .sidebar-footer span { display:none; }
.sidebar.collapsed .sidebar-footer img { width:30px !important; height:30px !important; }
.sidebar-manual {
  display:flex; align-items:center; gap:10px; padding:10px 16px; margin:2px 8px;
  border-radius:8px; cursor:pointer; font-size:13px; font-weight:500;
  color:rgba(255,255,255,0.6); transition:all 0.15s ease; white-space:nowrap;
}
.sidebar-manual:hover { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.9); }
.sidebar.collapsed .sidebar-manual { 
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  padding:10px 6px; 
  margin:2px 6px;
  gap: 4px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s ease;
  transform-origin: center bottom;
  will-change: transform;
}
.sidebar.collapsed .sidebar-manual svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 22px; height: 22px;
}
.sidebar.collapsed .sidebar-manual:hover { background: rgba(61,90,138,0.65); color:#fff; }
.sidebar.collapsed .sidebar-manual:hover .manual-label-short {
  color: rgba(255,255,255,0.9);
}
.sidebar.collapsed .sidebar-manual .nav-label-full { display:none; }
.sidebar.collapsed .sidebar-manual .manual-label-short {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  line-height: 1.2;
  text-align: center;
  letter-spacing: 0;
  max-width: 68px;
  margin-top: 2px;
}
.sidebar.expanded .sidebar-manual .manual-label-short { display: none; }

/* Dark mode toggle row */
.sidebar-darkrow {
  display:flex; align-items:center; gap:8px; padding:8px 16px; margin:2px 8px;
  border-radius:8px; white-space:nowrap; overflow:hidden;
}
.sidebar.collapsed .sidebar-darkrow { 
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  padding:10px 6px; 
  margin:2px 6px;
  gap: 4px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center bottom;
  will-change: transform;
  border-radius: 8px;
}
.sidebar.collapsed .dark-icon-btn svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 22px; height: 22px;
}
.sidebar.collapsed .sidebar-darkrow:hover {
  background: rgba(61,90,138,0.65);
}
.sidebar.collapsed .sidebar-darkrow:hover .dark-mode-label-short {
  color: rgba(255,255,255,0.9);
}
.sidebar.collapsed .dark-label { display:none; }
.sidebar.collapsed .dark-switch { display:none; }
.sidebar.collapsed .dark-icon-btn {
  display: flex !important;
  padding: 0;
  pointer-events: none;
}
.sidebar.collapsed .dark-mode-label-short {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  line-height: 1.2;
  text-align: center;
  letter-spacing: 0;
  max-width: 68px;
  margin-top: 2px;
  transition: color 0.15s ease;
}
.sidebar.expanded .dark-icon-btn { display:none; }
.sidebar.expanded .dark-mode-label-short { display: none; }
.dark-icon-btn {
  background:none; border:none; cursor:pointer; padding:3px;
  display:flex; align-items:center; justify-content:center;
  border-radius:6px; transition:background 0.15s;
}
.dark-icon-btn:hover { background:rgba(255,255,255,0.1); }
.dark-label { font-size:12px; color:rgba(255,255,255,0.5); flex:1; }
.dark-switch { position:relative; display:inline-block; width:36px; height:20px; flex-shrink:0; }
.dark-switch input { opacity:0; width:0; height:0; }
.dark-slider {
  position:absolute; cursor:pointer; inset:0;
  background:rgba(255,255,255,0.3); border-radius:20px; transition:.3s;
}
.dark-slider:before {
  content:""; position:absolute; height:14px; width:14px;
  left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.3s;
}
.dark-switch input:checked + .dark-slider { background:#2563eb; }
.dark-switch input:checked + .dark-slider:before { transform:translateX(16px); }

/* ═══════════════════════════════════════════
   DARK MODE — body.dark
═══════════════════════════════════════════ */
body.dark { background:#0B1120 !important; color:#CBD5E1; }
body.dark .app { background:#0B1120; }

/* Layout */
body.dark .page-content { background:#0F1623; }
body.dark .sidebar.collapsed ~ .main { background:#1A2236; }
body.dark .sidebar.expanded ~ .main  { background:#0F1623; }
body.dark .main { background:#1A2236; }

/* Topbar */
body.dark .topbar { background:#1A2236; border-color:#2A3548; box-shadow:0 2px 8px rgba(0,0,0,0.15); }
body.dark .topbar-title { color:#E2E8F0; }
body.dark .topbar-badge { background:#1E3A6E; color:#93C5FD; border-color:#1E3A6E; }

/* Buttons */
body.dark .btn-secondary { background:#212E45; color:#CBD5E1; border-color:#2A3548 !important; }
body.dark .btn-secondary:hover { background:#2A3548; }
body.dark .btn-ghost { background:transparent; color:#94A3B8; }
body.dark .btn-ghost:hover { background:#212E45; color:#CBD5E1; }

/* Page headers */
body.dark .page-header h1 { color:#E2E8F0; }
body.dark .page-header p { color:#64748B; }

/* Stat cards */
body.dark .stat-card { background:#1A2236; border-color:#2A3548; box-shadow:none; }
body.dark .stat-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.3); }
body.dark .stat-value { color:#E2E8F0; }
body.dark .stat-label { color:#94A3B8; }
body.dark .stat-sub { color:#64748B; }

/* Cards (dashboard widgets) */
body.dark .card { background:#1A2236; border-color:#2A3548; box-shadow:none; }
body.dark .card-header { border-color:#2A3548; background:#1A2236; }
body.dark .card-title { color:#E2E8F0; }

/* Recent list */
body.dark .recent-item { border-color:#2A3548; }
body.dark .recent-item:hover { background:#212E45; }
body.dark .recent-name { color:#E2E8F0; }
body.dark .recent-meta { color:#64748B; }
body.dark .recent-avatar { background:#1E3A6E; color:#93C5FD; }

/* Table card wrapper */
body.dark .table-card { background:#1A2236; border-color:#2A3548; box-shadow:none; }
body.dark .table-header { background:#1A2236; border-color:#2A3548; }
body.dark .table-footer { background:#1A2236; border-color:#2A3548; color:#64748B; }

/* Search + filters */
body.dark .search-box { background:#0F1623; border-color:#2A3548; }
body.dark .search-box input { color:#CBD5E1; }
body.dark .search-box input::placeholder { color:#4B5563; }
body.dark .filter-select { background:#0F1623; border-color:#2A3548; color:#CBD5E1; }

/* Table */
body.dark table { background:#1A2236; }
body.dark table thead th { background:#212E45; color:#94A3B8; border-color:#2A3548; }
body.dark table tbody tr { border-color:#2A3548; }
body.dark table tbody tr:hover { background:#212E45; }
body.dark table tbody td { color:#CBD5E1; border-color:#2A3548; }
body.dark .td-name { color:#E2E8F0; }
body.dark .td-id { color:#93C5FD; }

/* Badges */
body.dark .badge-green  { background:#064E3B; color:#6EE7B7; }
body.dark .badge-yellow { background:#451A03; color:#FCD34D; }
body.dark .badge-blue   { background:#1E3A6E; color:#93C5FD; }
body.dark .badge-gray   { background:#1E293B; color:#94A3B8; }
body.dark .badge-red    { background:#450A0A; color:#FCA5A5; }

/* Action buttons */
body.dark .action-btn   { background:#212E45; color:#94A3B8; }
body.dark .ab-edit      { background:#1E3A6E; color:#93C5FD; }
body.dark .ab-edit:hover { background:#1D4ED8; color:#fff; }
body.dark .ab-view      { background:#064E3B; color:#6EE7B7; }
body.dark .ab-view:hover { background:#065F46; }

/* Modal */
body.dark .modal-overlay { background:rgba(0,0,0,0.75); }
body.dark .modal { background:#1A2236; }
body.dark .modal-header { border-color:#2A3548; background:#1A2236; }
body.dark .modal-header h2 { color:#E2E8F0; }
body.dark .modal-header .sub { color:#64748B; }
body.dark .modal-body { background:#1A2236; }
body.dark .modal-footer { background:#151F30; border-color:#2A3548; }

/* Forms */
body.dark .section-divider { color:#60A5FA; border-color:#2A3548; }
body.dark .section-divider::before { background:#3B82F6; }
body.dark .form-label { color:#94A3B8; }
body.dark .form-input,
body.dark .form-select,
body.dark .form-textarea { background:#0F1623; border-color:#2A3548; color:#CBD5E1; }
body.dark .form-input:focus,
body.dark .form-select:focus,
body.dark .form-textarea:focus { border-color:#3B82F6; background:#0F1623; box-shadow:0 0 0 3px rgba(59,130,246,0.15); }
body.dark .form-input::placeholder,
body.dark .form-textarea::placeholder { color:#4B5563; }
body.dark .checkbox-row span { color:#94A3B8; }

/* Documents section */
body.dark .doc-item { background:#212E45; border-color:#2A3548; }
body.dark .doc-item .doc-name { color:#CBD5E1; }
body.dark .doc-item .doc-type { color:#64748B; }
body.dark .doc-add { background:transparent; border-color:#2A3548; color:#64748B; }
body.dark .doc-add:hover { border-color:#3B82F6; color:#60A5FA; background:rgba(59,130,246,0.08); }

/* Close button */
body.dark .close-btn { background:#212E45; color:#94A3B8; }
body.dark .close-btn:hover { background:#450A0A; color:#FCA5A5; }

/* Page content scrolls inside main */
.topbar-title { font-size:16px; font-weight:700; color:${NAV_BLUE}; flex:1; }
.topbar-badge { background:${LIGHT_ACCENT}; color:${ACCENT}; font-size:11px; font-weight:600; padding:4px 10px; border-radius:20px; border:1px solid #BFDBFE; }
.topbar-btn {
  display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px;
  font-size:12px; font-weight:600; cursor:pointer; border:none; transition:all 0.15s;
}
.btn-primary { background:#2563eb; color:#fff; box-shadow:0 2px 8px rgba(37,99,235,0.3); }
.btn-primary:hover { background:#1D4ED8; transition:background-color 120ms ease; }
.btn-secondary { background:#fff; color:${NAV_BLUE}; border:1.5px solid #D1DAE8 !important; }
.btn-secondary:hover { background:${BG}; }
.btn-danger { background:#FEE2E2; color:#DC2626; border:1px solid #FECACA !important; }
.btn-danger:hover { background:#FCA5A5; }
.btn-ghost { background:transparent; color:#64748B; padding:6px 10px; }
.btn-ghost:hover { background:#F1F5F9; color:${NAV_BLUE}; }
.page-content { flex:1; overflow-y:auto; padding:24px; background:${BG}; width:100%; max-width:none; box-sizing:border-box; }
.page-content > div { width:100%; max-width:none; }

/* CARDS */
.stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
.stat-card { background:#fff; border-radius:12px; padding:18px 20px; border:1px solid #E5EAF2; box-shadow:0 1px 4px rgba(0,0,0,0.04); transition:box-shadow 0.15s; }
.stat-card:hover { box-shadow:0 4px 16px rgba(11,37,69,0.08); }
.stat-label { font-size:11px; font-weight:600; color:#94A3B8; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:8px; }
.stat-value { font-size:28px; font-weight:700; color:${NAV_BLUE}; line-height:1; }
.stat-sub { font-size:11px; color:#94A3B8; margin-top:4px; }
.stat-icon { font-size:22px; margin-bottom:8px; }

/* TABLE */
.table-card { background:#fff; border-radius:12px; border:1px solid #E5EAF2; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.04); width:100%; }
.table-header { padding:16px 20px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #F0F4F9; flex-wrap:wrap; }
.search-box { flex:1; display:flex; align-items:center; gap:8px; background:${BG}; border:1.5px solid #E5EAF2; border-radius:8px; padding:8px 12px; min-width:200px; }
.search-box input { border:none; background:transparent; outline:none; font-size:13px; color:#374151; width:100%; font-family:'DM Sans',sans-serif; }
.search-box input::placeholder { color:#9CA3AF; }
.filter-select { padding:8px 12px; border-radius:8px; border:1.5px solid #E5EAF2; background:${BG}; font-size:12px; color:#374151; cursor:pointer; font-family:'DM Sans',sans-serif; outline:none; }
table { width:100%; border-collapse:collapse; }
thead th { background:#F8FAFD; padding:10px 14px; font-size:11px; font-weight:600; color:#64748B; text-align:left; letter-spacing:0.3px; text-transform:uppercase; border-bottom:1.5px solid #E5EAF2; white-space:nowrap; }
tbody tr { border-bottom:1px solid #F0F4F9; transition:background 0.1s; }
tbody tr:hover { background:#FAFBFF; }
tbody tr:last-child { border-bottom:none; }
td { padding:12px 14px; font-size:13px; color:#374151; white-space:nowrap; max-width:180px; overflow:hidden; text-overflow:ellipsis; }
.td-id { font-family:'DM Sans',sans-serif; font-size:12px; color:${ACCENT}; font-weight:600; }
.td-name { font-weight:600; color:${NAV_BLUE}; }
.badge { display:inline-flex; align-items:center; padding:3px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.badge-status { min-width:72px; text-align:center; justify-content:center; }
.badge-green { background:#D1FAE5; color:#065F46; }
.badge-yellow { background:#FEF3C7; color:#92400E; }
.badge-blue { background:#DBEAFE; color:#1E40AF; }
.badge-gray { background:#F1F5F9; color:#475569; }
.badge-red { background:#FEE2E2; color:#991B1B; }
.action-btn { padding:5px 10px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; border:none; transition:all 0.12s; display:inline-flex; align-items:center; gap:4px; }
.ab-edit { background:${LIGHT_ACCENT}; color:${ACCENT}; }
.ab-edit:hover { background:#DBEAFE; }
.ab-view { background:#F0FDF4; color:#16A34A; }
.ab-view:hover { background:#DCFCE7; }

/* MODAL */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; animation:fadeIn 0.2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.modal { background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.25); width:100%; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; animation:slideUp 0.22s ease; }
.modal-sm { max-width:500px; }
.modal-md { max-width:720px; }
.modal-lg { max-width:960px; }
.modal-header { padding:20px 24px 16px; border-bottom:1px solid #F0F4F9; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:#fff; z-index:1; }
.modal-header h2 { font-size:16px; font-weight:700; color:${NAV_BLUE}; }
.modal-header .sub { font-size:12px; color:#94A3B8; margin-top:2px; }
.modal-body { padding:20px 24px; overflow-y:auto; flex:1; }
.modal-footer { padding:16px 24px; border-top:1px solid #F0F4F9; display:flex; align-items:center; justify-content:flex-end; gap:8px; position:sticky; bottom:0; background:#fff; }

/* FORM */
.form-grid { display:grid; gap:16px; }
.form-grid-2 { grid-template-columns:1fr 1fr; }
.form-grid-3 { grid-template-columns:1fr 1fr 1fr; }
.form-group { display:flex; flex-direction:column; gap:5px; }
.form-group.span-2 { grid-column:span 2; }
.form-group.span-3 { grid-column:span 3; }
.form-label { font-size:11px; font-weight:600; color:#64748B; text-transform:uppercase; letter-spacing:0.4px; }
.form-label .req { color:${ACCENT}; }
.form-input,.form-select,.form-textarea { padding:9px 12px; border-radius:8px; border:1.5px solid #E2E8F0; background:${BG}; font-size:13px; color:#1E2A3B; outline:none; font-family:'DM Sans',sans-serif; transition:border-color 0.15s,box-shadow 0.15s; }
.form-input:focus,.form-select:focus,.form-textarea:focus { border-color:#2563eb; background:#fff; box-shadow:0 0 0 3px rgba(37,99,235,0.1); transition:border-color 120ms ease, box-shadow 120ms ease; }
.form-textarea { resize:vertical; min-height:70px; }
.section-divider { font-size:11px; font-weight:700; color:${MID_BLUE}; letter-spacing:1px; text-transform:uppercase; padding:12px 0 8px; border-bottom:2px solid ${LIGHT_ACCENT}; margin:4px 0 12px; display:flex; align-items:center; gap:8px; }
.section-divider::before { content:''; width:3px; height:14px; background:${ACCENT}; border-radius:2px; }

/* DOCS */
.doc-item { display:flex; align-items:center; gap:10px; padding:8px 12px; background:${BG}; border-radius:8px; margin-bottom:6px; border:1px solid #E5EAF2; }
.doc-item .doc-name { flex:1; font-size:12px; color:#374151; font-weight:500; }
.doc-item .doc-type { font-size:11px; color:#94A3B8; }
.doc-add { display:flex; align-items:center; gap:8px; padding:8px 12px; background:transparent; border:1.5px dashed #CBD5E1; border-radius:8px; cursor:pointer; font-size:12px; color:#64748B; transition:all 0.15s; width:100%; }
.doc-add:hover { border-color:${ACCENT}; color:${ACCENT}; background:${LIGHT_ACCENT}; }

/* DASHBOARD */
.recent-list { display:flex; flex-direction:column; gap:0; }
.recent-item { display:flex; align-items:center; gap:12px; padding:12px 16px; cursor:pointer; transition:background 0.12s; border-bottom:1px solid #F0F4F9; }
.recent-item:hover { background:#FAFBFF; }
.recent-item:last-child { border-bottom:none; }
.recent-avatar { width:34px; height:34px; border-radius:50%; background:${LIGHT_ACCENT}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:${ACCENT}; flex-shrink:0; }
.recent-name { font-size:13px; font-weight:600; color:${NAV_BLUE}; }
.recent-meta { font-size:11px; color:#94A3B8; }
.recent-ctrl { font-size:10px; color:${ACCENT}; font-weight:600; }
.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.grid-2-1 { display:grid; grid-template-columns:2fr 1fr; gap:20px; align-items:stretch; }
.card { background:#fff; border-radius:12px; border:1px solid #E5EAF2; box-shadow:0 1px 4px rgba(0,0,0,0.04); overflow:hidden; }
.card-header { padding:14px 18px; border-bottom:1px solid #F0F4F9; display:flex; align-items:center; justify-content:space-between; }
.card-title { font-size:13px; font-weight:700; color:${NAV_BLUE}; }
.close-btn { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; border:none; background:#F1F5F9; color:#64748B; font-size:16px; transition:all 0.12s; }
.close-btn:hover { background:#FEE2E2; color:#DC2626; }
.checkbox-row { display:flex; align-items:center; gap:8px; cursor:pointer; }
.checkbox-row input { accent-color:${ACCENT}; width:15px; height:15px; }
.checkbox-row span { font-size:13px; color:#374151; font-weight:500; }
.table-footer { padding:12px 18px; border-top:1px solid #F0F4F9; font-size:12px; color:#94A3B8; display:flex; align-items:center; justify-content:space-between; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:10px; }
::-webkit-scrollbar-thumb:hover { background:#94A3B8; }
.empty-state { text-align:center; padding:50px 20px; color:#94A3B8; }
.empty-state .icon { font-size:40px; margin-bottom:12px; }
.empty-state p { font-size:14px; font-weight:500; }
.page-header { margin-bottom:20px; }
.page-header h1 { font-size:22px; font-weight:700; color:${NAV_BLUE}; }
.page-header p { font-size:13px; color:#64748B; margin-top:3px; }
.inline-actions { display:flex; gap:4px; align-items:center; }

/* ── NOTIFICATION SYSTEM (iOS/Glassmorphism) ──────────────────────── */
.notif-overlay {
  position:fixed; inset:0; z-index:9000;
  display:flex; align-items:center; justify-content:center;
  padding:20px;
  animation: notif-fade-in 0.18s ease;
}
.notif-overlay.dismissable { cursor:pointer; }
@keyframes notif-fade-in { from{opacity:0} to{opacity:1} }
@keyframes notif-scale-in {
  from { opacity:0; transform: scale(0.88) translateY(-14px); }
  to   { opacity:1; transform: scale(1)   translateY(0); }
}
@keyframes notif-scale-out {
  from { opacity:1; transform: scale(1)   translateY(0); }
  to   { opacity:0; transform: scale(0.88) translateY(-10px); }
}
.notif-backdrop {
  position:absolute; inset:0;
  background: rgba(11, 17, 32, 0.4);
}
.notif-card {
  position:relative; z-index:1;
  width:100%; max-width:320px;
  border-radius:20px;
  padding:0;
  overflow:hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12);
  animation: notif-scale-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
}
.notif-card.exiting {
  animation: notif-scale-out 0.18s ease forwards;
}
body.dark .notif-card {
  background: #1A2236;
  border: 1px solid rgba(255,255,255,0.10);
}
.notif-icon-row {
  display:flex; justify-content:center;
  padding: 28px 24px 0;
}
.notif-icon-circle {
  width:56px; height:56px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:26px;
  background: rgba(30,42,59,0.06);
  color: #1E2A3B;
}
body.dark .notif-icon-circle {
  background: rgba(226,232,240,0.06);
  color: #E2E8F0;
}
.notif-body {
  padding: 14px 24px 20px;
  text-align: center;
}
.notif-title {
  font-size: 16px; font-weight: 700; line-height: 1.3;
  color: #1E2A3B; margin-bottom: 6px;
}
body.dark .notif-title { color: #E2E8F0; }
.notif-message {
  font-size: 13px; line-height: 1.5;
  color: #64748B;
}
body.dark .notif-message { color: #94A3B8; }
.notif-actions {
  border-top: 1px solid rgba(0,0,0,0.07);
  display:flex;
}
body.dark .notif-actions { border-top-color: rgba(255,255,255,0.08); }
.notif-btn {
  flex:1; padding:14px 12px;
  font-size:14px; font-weight:600;
  background:transparent; border:none; cursor:pointer;
  transition: background 0.12s;
  font-family:'DM Sans',sans-serif;
}
.notif-btn:hover { background: rgba(0,0,0,0.04); }
body.dark .notif-btn:hover { background: rgba(255,255,255,0.06); }
.notif-btn + .notif-btn { border-left: 1px solid rgba(0,0,0,0.07); }
body.dark .notif-btn + .notif-btn { border-left-color: rgba(255,255,255,0.08); }
.notif-btn.primary   { color: #2563eb; }
.notif-btn.danger    { color: #DC2626; }
.notif-btn.cancel    { color: #64748B; }
body.dark .notif-btn.primary { color: #60A5FA; }
body.dark .notif-btn.danger  { color: #FCA5A5; }
body.dark .notif-btn.cancel  { color: #94A3B8; }

/* Toast (non-blocking snackbar) — aparece en la parte SUPERIOR */
.toast-container {
  position:fixed; top:76px; left:50%; transform:translateX(-50%);
  z-index:9100; display:flex; flex-direction:column; gap:8px;
  pointer-events:none;
  align-items:center;
}
.toast {
  pointer-events:auto;
  display:flex; align-items:center; gap:12px;
  padding:12px 18px 12px 18px; border-radius:14px;
  font-size:13px; font-weight:500;
  max-width:460px; min-width:240px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
  animation: notif-scale-in 0.26s cubic-bezier(0.34,1.56,0.64,1);
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
}
body.dark .toast {
  background: #1A2236;
  border-color: rgba(255,255,255,0.12);
}

.toast-dot { font-size:18px; flex-shrink:0; color: #1E2A3B; }
body.dark .toast-dot { color: #E2E8F0; }
.toast-text { flex:1; color:#1E2A3B; line-height:1.4; }
body.dark .toast-text { color:#E2E8F0; }
.toast.exiting { animation: notif-scale-out 0.18s ease forwards; }
`;
