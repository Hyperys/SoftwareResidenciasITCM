import React, { useState, useMemo, useEffect, useRef, createContext, useContext, useCallback } from "react";

const NAV_BLUE = "#24375b";
const MID_BLUE = "#1c3256";
const ACCENT = "#2f4d80";
const LIGHT_ACCENT = "#EFF6FF";
const BG = "#F4F6FB";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
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
  from { opacity:0; transform: scale(0.82) translateY(12px); }
  to   { opacity:1; transform: scale(1)   translateY(0); }
}
@keyframes notif-scale-out {
  from { opacity:1; transform: scale(1)   translateY(0); }
  to   { opacity:0; transform: scale(0.88) translateY(8px); }
}
.notif-backdrop {
  position:absolute; inset:0;
  background: rgba(0,0,0,0.32);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.notif-card {
  position:relative; z-index:1;
  width:100%; max-width:320px;
  border-radius:20px;
  padding:0;
  overflow:hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12);
  animation: notif-scale-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
  /* Light mode glass */
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(28px) saturate(1.8);
  -webkit-backdrop-filter: blur(28px) saturate(1.8);
  border: 1px solid rgba(255,255,255,0.55);
}
.notif-card.exiting {
  animation: notif-scale-out 0.18s ease forwards;
}
body.dark .notif-card {
  background: rgba(26,34,54,0.82);
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
}
.notif-icon-circle.success { background: rgba(16,185,129,0.15); }
.notif-icon-circle.error   { background: rgba(239,68,68,0.15); }
.notif-icon-circle.warning { background: rgba(245,158,11,0.15); }
.notif-icon-circle.info    { background: rgba(37,99,235,0.15); }
.notif-icon-circle.confirm { background: rgba(37,99,235,0.12); }
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

/* Toast (non-blocking snackbar) */
.toast-container {
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  z-index:9100; display:flex; flex-direction:column; gap:8px;
  pointer-events:none;
}
.toast {
  pointer-events:auto;
  display:flex; align-items:center; gap:10px;
  padding:11px 16px; border-radius:14px;
  font-size:13px; font-weight:500;
  max-width:420px; min-width:220px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  animation: notif-scale-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
}
body.dark .toast {
  background: rgba(30,42,64,0.9);
  border-color: rgba(255,255,255,0.10);
}
.toast.success .toast-dot { color:#10B981; }
.toast.error   .toast-dot { color:#EF4444; }
.toast.warning .toast-dot { color:#F59E0B; }
.toast.info    .toast-dot { color:#3B82F6; }
.toast-dot { font-size:16px; flex-shrink:0; }
.toast-text { flex:1; color:#1E2A3B; }
body.dark .toast-text { color:#E2E8F0; }
.toast.exiting { animation: notif-scale-out 0.18s ease forwards; }
`;

const DOCS_TYPES = [
    "Solicitud de residencia", "Carta de presentación", "Constancia de servicio social",
    "Anteproyecto", "Autorización de anteproyecto", "Asignación de asesor",
    "1er. reporte de asesoría", "2do. reporte de asesoría", "3er. reporte de asesoría",
    "Evaluación final", "Reporte final (PDF)", "Práctica del reporte final con firmas",
    "Carta de liberación o terminación", "Otro"
];

/* ══════════════════════════════════════════════════════════════
   NOTIFICATION SYSTEM
   useNotification() → { notify, confirm, alert }
   ══════════════════════════════════════════════════════════════ */

const NotifContext = createContext(null);

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

function NotifProvider({ children }) {
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
                                {t.type === 'success' ? '●' : t.type === 'error' ? '●' : t.type === 'warning' ? '●' : '●'}
                            </span>
                            <span className="toast-text">{t.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </NotifContext.Provider>
    );
}

function useNotification() {
    const ctx = useContext(NotifContext);
    if (!ctx) throw new Error('useNotification must be used within NotifProvider');
    return ctx;
}


function Icon({ n }) {
    const icons = {
        dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
        projects: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
        residents: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        advisors: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11h-6" /><path d="M19 8v6" /></svg>,
        companies: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        careers: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
        reports: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
        search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
        plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
        backup: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
        doc: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
        trash: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>,
        check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
        open: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
        chevronLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
        chevronRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
    };
    return icons[n] || null;
}

function Modal({ show, onClose, title, sub, size = "md", children, footer }) {
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={`modal modal-${size}`}>
                <div className="modal-header">
                    <div><h2>{title}</h2>{sub && <div className="sub">{sub}</div>}</div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}


/* ===== ADVISOR MODAL ===== */
function AdvisorModal({ show, onClose, advisor, onSaved }) {
    const { notify, alert, confirm } = useNotification();
    const emptyForm = {
        nombres: '', apellidos: '', tipo: 'interno', departamento: '',
        puesto: '', correo: '', telefono: '', extension: '',
        habilitado: true, empresa_id: null
    };
    const [form, setForm] = useState(emptyForm);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setForm(advisor ? {
                nombres: advisor.nombres || '',
                apellidos: advisor.apellidos || '',
                tipo: advisor.tipo || 'interno',
                departamento: advisor.departamento || '',
                puesto: advisor.puesto || '',
                correo: advisor.correo || '',
                telefono: advisor.telefono || '',
                extension: advisor.extension || '',
                habilitado: advisor.habilitado !== false,
                empresa_id: advisor.empresa_id || null
            } : emptyForm);
        }
    }, [show, advisor]);

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
            const url = advisor ? `/api/asesores/${advisor.id}` : '/api/asesores';
            const method = advisor ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) { await alert(data.error || "Error al guardar"); setLoading(false); return; }
            notify("Asesor guardado correctamente", "success");
            onSaved && onSaved();
            onClose();
        } catch (e) {
            await alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const eliminar = async () => {
        const ok = await confirm(`¿Eliminar al asesor ${form.nombres} ${form.apellidos}? Esta acción no se puede deshacer.`);
        if (!ok) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/asesores/${advisor.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) { await alert(data.error || "Error al eliminar"); setLoading(false); return; }
            notify("Asesor eliminado", "info");
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
            title={advisor ? "Editar asesor" : "Nuevo asesor"}
            sub={advisor ? `ID: ${advisor.id}` : "Complete los campos requeridos"}
            footer={<>
                {advisor && (
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


/* ===== ADVISOR SELECTION MODAL (para formulario de residentes) ===== */
function AdvisorSelectionModal({ show, onClose, onSelect, filterEmpresa }) {
    const [asesores, setAsesores] = useState([]);
    const [search, setSearch] = useState("");
    const [showNew, setShowNew] = useState(false);

    useEffect(() => {
        if (show) {
            fetch('/api/asesores')
                .then(r => r.json())
                .then(data => setAsesores(Array.isArray(data) ? data : []))
                .catch(() => setAsesores([]));
        }
    }, [show]);

    const filtered = asesores.filter(a => {
        const matchSearch = !search ||
            `${a.nombres} ${a.apellidos}`.toLowerCase().includes(search.toLowerCase());
        const matchEmpresa = !filterEmpresa || a.empresa_nombre === filterEmpresa;
        return matchSearch && matchEmpresa;
    });

    return (
        <>
            <Modal show={show && !showNew} onClose={onClose}
                title={filterEmpresa ? `Asesores — ${filterEmpresa}` : "Seleccionar asesor"} size="md"
                footer={<>
                    <button className="topbar-btn btn-secondary"
                        style={{ border: "1.5px solid #D1DAE8", marginRight: "auto" }}
                        onClick={() => setShowNew(true)}>
                        <Icon n="plus" /> Añadir nuevo asesor
                    </button>
                    <button className="topbar-btn btn-ghost" onClick={onClose}>Cancelar</button>
                </>}>
                <div className="search-box" style={{ marginBottom: 14 }}>
                    <Icon n="search" />
                    <input placeholder="Buscar asesor por nombre..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>Tipo</th><th>Empresa / Depto</th><th>Puesto</th><th></th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No se encontraron asesores
                                </td></tr>
                            ) : filtered.map(a => (
                                <tr key={a.id}>
                                    <td className="td-name">{a.nombres} {a.apellidos}</td>
                                    <td>
                                        <span className={`badge ${a.tipo === "interno" ? "badge-blue" : "badge-yellow"}`}>
                                            {a.tipo === "interno" ? "Interno" : "Externo"}
                                        </span>
                                    </td>
                                    <td>{a.tipo === "interno" ? a.departamento : a.empresa_nombre}</td>
                                    <td>{a.puesto}</td>
                                    <td>
                                        <button className="action-btn ab-edit"
                                            onClick={() => { onSelect && onSelect(a); onClose(); }}>
                                            Seleccionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
            <AdvisorModal show={showNew} onClose={() => setShowNew(false)}
                onSaved={() => setShowNew(false)} />
        </>
    );
}

/* ===== DASHBOARD ===== */
function Dashboard({ setPage }) {
    const [showBackup, setShowBackup] = useState(false);
    const [backupDone, setBackupDone] = useState(false);
    const [backupMsg, setBackupMsg] = useState('');
    const [backupErrs, setBackupErrs] = useState([]);
    const [backupLoading, setBackupLoading] = useState(false);
    const [stats, setStats] = useState({ total: '—', cerrados: '—', activos: '—', empresas: '—' });
    const [recientes, setRecientes] = useState([]);

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(r => r.json())
            .then(d => setStats({
                total: d.total_residentes ?? '—',
                cerrados: d.cerrados ?? '—',
                activos: d.activos ?? '—',
                empresas: d.total_empresas ?? '—'
            }))
            .catch(() => { });
        fetch('/api/residentes')
            .then(r => r.json())
            .then(d => setRecientes(Array.isArray(d) ? d.slice(0, 5) : []))
            .catch(() => { });
    }, []);

    const doBackup = async () => {
        setBackupLoading(true); setBackupErrs([]);
        try {
            const res = await fetch('/api/backup', { method: 'POST' });
            const data = await res.json();
            setBackupMsg(data.ruta || ''); setBackupErrs(data.errores || []); setBackupDone(true);
        } catch (e) {
            setBackupErrs(['Error de conexión']); setBackupDone(true);
        } finally { setBackupLoading(false); }
    };
    return (
        <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="page-header" style={{ marginBottom: 0 }}><h1>Panel de administración</h1><p>Archivo de residencias · TECNM Ciudad Madero</p></div>
                <button className="topbar-btn btn-secondary" onClick={() => { setShowBackup(true); setBackupDone(false); }}><Icon n="backup" /> Copia de seguridad</button>
            </div>
            <div className="stat-grid">
                {[
                    { icon: "👤", label: "Total residentes", val: stats.total, sub: "Registrados en el sistema" },
                    { icon: "✅", label: "Expedientes cerrados", val: stats.cerrados, sub: "Completados" },
                    { icon: "⏳", label: "En proceso", val: stats.activos, sub: "Activos actualmente" },
                    { icon: "🏢", label: "Empresas", val: stats.empresas, sub: "En catálogo" }
                ].map((s, i) => (
                    <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-label">{s.label}</div><div className="stat-value">{s.val}</div><div className="stat-sub">{s.sub}</div></div>
                ))}
            </div>
            <div className="grid-2-1">
                <div className="card">
                    <div className="card-header"><span className="card-title">Modificados recientemente</span>
                        <button className="topbar-btn btn-primary" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => setPage("residents")}><Icon n="plus" /> Nuevo expediente</button>
                    </div>
                    <div className="recent-list">
                        {recientes.length === 0
                            ? <div style={{ padding: "20px 16px", color: "#94A3B8", fontSize: 13, textAlign: "center" }}>No hay expedientes registrados</div>
                            : recientes.map((r, i) => (
                                <div className="recent-item" key={i} onClick={() => setPage("residents")}>
                                    <div className="recent-avatar">{(r.nombres || '?').charAt(0)}{(r.apellidos || '?').charAt(0)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div className="recent-name">{r.nombre_completo}</div>
                                        <div className="recent-meta">{r.empresa || '—'} · {r.semestre}</div>
                                    </div>
                                    <div className="recent-ctrl">[{r.num_control}]</div>
                                    <span className={`badge badge-status ${r.estado === 'cerrado' ? 'badge-green' : 'badge-yellow'}`}>
                                        {r.estado === 'cerrado' ? 'Cerrado' : 'Activo'}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="table-footer"><span>Mostrando {recientes.length} registros recientes</span><button className="action-btn ab-view" onClick={() => setPage("residents")}>Ver todos →</button></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
                    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}><div className="card-header"><span className="card-title">Catálogo de empresas</span></div><div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1, justifyContent: "center" }}><button className="topbar-btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setPage("companies")}>Ver empresas</button></div></div>
                    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}><div className="card-header"><span className="card-title">Carreras</span></div><div style={{ padding: "12px 16px", flex: 1, display: "flex", alignItems: "center" }}><button className="topbar-btn btn-secondary" style={{ width: "100%", justifyContent: "center", border: "1.5px solid #D1DAE8" }} onClick={() => setPage("careers")}>Ver carreras</button></div></div>
                    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}><div className="card-header"><span className="card-title">Informes y reportes</span></div><div style={{ padding: "12px 16px", flex: 1, display: "flex", alignItems: "center" }}><button className="topbar-btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setPage("reports")}>Panel de reportes</button></div></div>
                </div>
            </div>
            <Modal show={showBackup} onClose={() => { setShowBackup(false); setBackupDone(false); }}
                title="Copia de seguridad" size="sm"
                footer={<>
                    <button className="topbar-btn btn-ghost" onClick={() => { setShowBackup(false); setBackupDone(false); }}>
                        {backupDone ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!backupDone && (
                        <button className="topbar-btn btn-primary" onClick={doBackup} disabled={backupLoading}>
                            <Icon n="backup" /> {backupLoading ? 'Creando respaldo...' : 'Iniciar respaldo'}
                        </button>
                    )}
                </>}>
                {!backupDone ? (
                    <div>
                        <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "12px 14px", marginBottom: 14, border: "1px solid #BFDBFE", fontSize: 13, color: "#1E40AF" }}>
                            <strong>El respaldo incluye:</strong>
                            <ul style={{ margin: "8px 0 0 16px", padding: 0, fontSize: 12 }}>
                                <li>Dump completo de la base de datos MySQL</li>
                                <li>Copia de todos los PDFs en expedientespdf/</li>
                            </ul>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>
                            Se guardará en: <code style={{ color: "#2563eb" }}>backup/backup_YYYY-MM-DD_HH-MM/</code>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>{backupErrs.filter(e => !e.includes('omite')).length === 0 ? '✅' : '⚠️'}</div>
                        <div style={{ fontWeight: 700, color: "#065F46", fontSize: 15, marginBottom: 6 }}>Respaldo completado</div>
                        <div style={{ fontSize: 11, color: "#64748B", wordBreak: "break-all", marginBottom: 8 }}>{backupMsg}</div>
                        {backupErrs.length > 0 && (
                            <div style={{ background: "#FEF3C7", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#92400E", textAlign: "left" }}>
                                {backupErrs.map((e, i) => <div key={i}>⚠ {e}</div>)}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

/* ===== RESIDENT MODAL ===== */
function ResidentModal({ show, onClose, resident, onSaved, isProjectMode = false }) {
    const { notify, alert, confirm } = useNotification();
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
    const [selAdvisor, setSelAdvisor] = useState(null);
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
        else if (selAdvisor === 'revisor')
            upd('revisor_id', a.id), upd('revisor', `${a.nombres} ${a.apellidos}`);
        setSelAdvisor(null);
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
            <Modal show={show && !selAdvisor && !elimModal && !showEmpModal} onClose={onClose}
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
                                    onClick={() => { upd('empresa_id', ''); upd('empresa_nombre', ''); }}>✕</button>
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

                {/* ASESORES */}
                <div className="section-divider">Asesores</div>
                <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
                    {[
                        { key: 'interno', label: 'Asesor interno', val: form.asesor_interno },
                        { key: 'externo', label: 'Asesor externo', val: form.asesor_externo },
                        { key: 'revisor', label: 'Revisor', val: form.revisor }
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
                                        onClick={() => { upd(`${a.key}_id`, null); upd(a.key === 'revisor' ? 'revisor' : `asesor_${a.key}`, ''); }}>✕</button>
                                )}
                            </div>
                        </div>
                    ))}
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
            <AdvisorSelectionModal
                show={!!selAdvisor}
                onClose={() => setSelAdvisor(null)}
                onSelect={handleSelectAdvisor} />

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


/* ===== RESIDENTS PAGE ===== */
function Residents() {
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
                                        {r.estado === 'cerrado' ? '✓ Cerrado' : '● Activo'}
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
            <ResidentModal
                show={!!modal}
                onClose={() => setModal(null)}
                resident={modal === 'new' ? null : modal}
                onSaved={cargarResidentes}
            />
        </div>
    );
}


/* ===== COMPANY MODAL ===== */
function CompanyModal({ show, onClose, company, onSaved }) {
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



/* ===== COMPANIES PAGE ===== */
function Companies() {
    const { alert } = useNotification();
    const [empresas, setEmpresas] = useState([]);
    const [modal, setModal] = useState(null);
    const [advisorModal, setAdvisorModal] = useState(null);
    const [search, setSearch] = useState("");
    const [giroF, setGiroF] = useState("");

    const cargarEmpresas = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (giroF) params.append('giro', giroF);
        fetch(`/api/empresas?${params}`)
            .then(r => r.json())
            .then(data => setEmpresas(Array.isArray(data) ? data : []))
            .catch(() => setEmpresas([]));
    };

    useEffect(() => { cargarEmpresas(); }, [search, giroF]);

    const abrirEditar = (e) => {
        fetch(`/api/empresas/${e.id}`)
            .then(r => r.json())
            .then(data => setModal(data))
            .catch(() => alert("Error al cargar empresa"));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Catálogo de empresas</h1>
                <p>Empresas receptoras del programa de residencias</p>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar por nombre o RFC..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="filter-select" value={giroF}
                        onChange={e => setGiroF(e.target.value)}>
                        <option value="">Todos los giros</option>
                        <option value="publica">Pública</option>
                        <option value="privada">Privada</option>
                        <option value="industrial">Industrial</option>
                        <option value="servicios">Servicios</option>
                        <option value="otro">Otro</option>
                    </select>
                    <button className="topbar-btn btn-primary" onClick={() => setModal("new")}>
                        <Icon n="plus" /> Añadir empresa
                    </button>
                </div>
                <div style={{ overflowX: "auto", background: "#fff" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th><th>RFC</th><th>Giro</th><th>Correo</th>
                                <th>Teléfono</th><th>Dirección</th><th>Ubicación</th>
                                <th>CP</th><th>Habilitada</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empresas.length === 0 ? (
                                <tr><td colSpan={10} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No hay empresas registradas
                                </td></tr>
                            ) : empresas.map(e => (
                                <tr key={e.id}>
                                    <td className="td-name" title={e.nombre}>{e.nombre}</td>
                                    <td className="td-id">{e.rfc}</td>
                                    <td><span className="badge badge-blue">{e.giro}</span></td>
                                    <td style={{ color: "#2563eb", fontSize: 12 }}>{e.correo || "—"}</td>
                                    <td>{e.telefono}</td>
                                    <td title={e.direccion}>{e.direccion}</td>
                                    <td>{e.ciudad}, {e.estado_geo}</td>
                                    <td>{e.codigo_postal}</td>
                                    <td>
                                        <span className={`badge ${e.habilitada ? "badge-green" : "badge-red"}`}>
                                            {e.habilitada ? "✓" : "✗"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="inline-actions">
                                            <button className="action-btn ab-edit"
                                                onClick={() => abrirEditar(e)}>Editar</button>
                                            <button className="action-btn ab-view"
                                                onClick={() => setAdvisorModal(e.nombre)}>
                                                Ver asesores
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <span>Número de registros: {empresas.length}</span>
                </div>
            </div>
            <CompanyModal
                show={!!modal}
                onClose={() => setModal(null)}
                company={modal === "new" ? null : modal}
                onSaved={cargarEmpresas}
            />
            <AdvisorSelectionModal
                show={!!advisorModal}
                onClose={() => setAdvisorModal(null)}
                filterEmpresa={advisorModal}
            />
        </div>
    );
}


/* ===== ASESORES PAGE ===== */
function Asesores() {
    const { alert } = useNotification();
    const [asesores, setAsesores] = useState([]);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState("");
    const [tipoF, setTipoF] = useState("");

    const cargarAsesores = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (tipoF) params.append('tipo', tipoF);
        fetch(`/api/asesores?${params}`)
            .then(r => r.json())
            .then(data => setAsesores(Array.isArray(data) ? data : []))
            .catch(() => setAsesores([]));
    };

    useEffect(() => { cargarAsesores(); }, [search, tipoF]);

    const abrirEditar = (a) => {
        fetch(`/api/asesores/${a.id}`)
            .then(r => r.json())
            .then(data => setModal(data))
            .catch(() => alert("Error al cargar asesor"));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Catálogo de asesores</h1>
                <p>Asesores internos y externos del programa de residencias</p>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar por nombre de asesor..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="filter-select" value={tipoF}
                        onChange={e => setTipoF(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="interno">Internos</option>
                        <option value="externo">Externos</option>
                    </select>
                    <button className="topbar-btn btn-primary" onClick={() => setModal("new")}>
                        <Icon n="plus" /> Nuevo asesor
                    </button>
                </div>
                <div style={{ overflowX: "auto", background: "#fff" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th><th>Tipo</th><th>Departamento</th>
                                <th>Puesto</th><th>Correo</th><th>Teléfono</th>
                                <th>Ext.</th><th>Habilitado</th>
                                <th>Última mod.</th><th>Fecha registro</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asesores.length === 0 ? (
                                <tr><td colSpan={11} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                    No hay asesores registrados
                                </td></tr>
                            ) : asesores.map(a => (
                                <tr key={a.id}>
                                    <td className="td-name" title={`${a.nombres} ${a.apellidos}`}>
                                        {a.nombres} {a.apellidos}
                                    </td>
                                    <td>
                                        <span className={`badge ${a.tipo === "interno" ? "badge-blue" : "badge-yellow"}`}>
                                            {a.tipo === "interno" ? "Interno" : "Externo"}
                                        </span>
                                    </td>
                                    <td title={a.departamento}>{a.departamento || "—"}</td>
                                    <td title={a.puesto}>{a.puesto || "—"}</td>
                                    <td style={{ color: "#2563eb", fontSize: 12 }}>{a.correo}</td>
                                    <td>{a.telefono}</td>
                                    <td>{a.extension || "—"}</td>
                                    <td>
                                        <span className={`badge ${a.habilitado ? "badge-green" : "badge-red"}`}>
                                            {a.habilitado ? "✓ Sí" : "✗ No"}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 11 }}>
                                        {a.fecha_modificacion
                                            ? new Date(a.fecha_modificacion).toLocaleDateString('es-MX')
                                            : "—"}
                                    </td>
                                    <td style={{ fontSize: 11 }}>
                                        {a.fecha_registro
                                            ? new Date(a.fecha_registro).toLocaleDateString('es-MX')
                                            : "—"}
                                    </td>
                                    <td>
                                        <button className="action-btn ab-edit"
                                            onClick={() => abrirEditar(a)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <span>Número de registros: {asesores.length}</span>
                </div>
            </div>

            <AdvisorModal
                show={!!modal}
                onClose={() => setModal(null)}
                advisor={modal === "new" ? null : modal}
                onSaved={cargarAsesores}
            />
        </div>
    );
}

/* ===== WORKLOAD DASHBOARD COMPONENT ===== */
function WorkloadDashboard({ asesores }) {
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

    // Calcular métricas
    const asesoresConProyectos = asesores.map(asesor => ({
        ...asesor,
        proyectos: proyectosPorAsesor[asesor.id] || [],
        numProyectos: (proyectosPorAsesor[asesor.id] || []).length
    })).filter(a => a.habilitado);

    const totalProyectos = asesoresConProyectos.reduce((sum, a) => sum + a.numProyectos, 0);
    const numAsesores = asesoresConProyectos.length;
    const promedioProyectos = numAsesores > 0 ? (totalProyectos / numAsesores).toFixed(1) : 0;

    // Ordenar por cantidad de proyectos (descendente)
    const asesoresOrdenados = [...asesoresConProyectos].sort((a, b) => b.numProyectos - a.numProyectos);

    // Calcular max para escala de barras
    const maxProyectos = Math.max(...asesoresOrdenados.map(a => a.numProyectos), 1);

    // Función para determinar color según carga
    const getColorCarga = (numProyectos) => {
        if (numProyectos >= 7) return { bg: '#EF4444', label: 'Alta' }; // Rojo
        if (numProyectos >= 4) return { bg: '#F59E0B', label: 'Media' }; // Amarillo
        if (numProyectos >= 1) return { bg: '#10B981', label: 'Baja' }; // Verde
        return { bg: '#CBD5E1', label: 'Sin carga' }; // Gris
    };

    return (
        <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: '#EFF6FF', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 24
                    }}>
                        ⚙️
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total Projects
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#24375b', lineHeight: 1 }}>
                            {totalProyectos}
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: '#EFF6FF', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 24
                    }}>
                        👥
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Active Advisors
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#24375b', lineHeight: 1 }}>
                            {numAsesores}
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: '#EFF6FF', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 24
                    }}>
                        📊
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Average Load
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#24375b', lineHeight: 1 }}>
                            {promedioProyectos}
                        </div>
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
                            <div key={asesor.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                paddingTop: idx === 0 ? 0 : 12,
                                paddingBottom: 12,
                                borderBottom: idx < asesoresOrdenados.length - 1 ? '1px solid #F0F4F9' : 'none'
                            }}>
                                <div style={{
                                    width: 180,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#24375b',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {asesor.nombres} {asesor.apellidos}
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        height: 32,
                                        width: `${barWidth}%`,
                                        background: colorInfo.bg,
                                        borderRadius: 6,
                                        minWidth: asesor.numProyectos > 0 ? 40 : 0,
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                    <span style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#374151',
                                        minWidth: 70
                                    }}>
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
                        const colorInfo = getColorCarga(asesor.numProyectos);

                        return (
                            <div key={asesor.id} style={{
                                borderBottom: idx < asesoresOrdenados.length - 1 ? '1px solid #F0F4F9' : 'none',
                                paddingTop: idx === 0 ? 24 : 16,
                                paddingBottom: 16
                            }}>
                                <div
                                    onClick={() => setExpandedAdvisor(isExpanded ? null : asesor.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#9cb7e0ff'} //color al pasar el mouse
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 18 }}>
                                            {isExpanded ? '▽' : '▷'}
                                        </span>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#24375b' }}>
                                                {asesor.nombres} {asesor.apellidos}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                                {asesor.numProyectos} {asesor.numProyectos === 1 ? 'proyecto activo' : 'proyectos activos'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        background: asesor.numProyectos >= 7 ? '#FEE2E2' :
                                            asesor.numProyectos >= 4 ? '#FEF3C7' :
                                                asesor.numProyectos >= 1 ? '#D1FAE5' : '#F1F5F9',
                                        color: asesor.numProyectos >= 7 ? '#DC2626' :
                                            asesor.numProyectos >= 4 ? '#D97706' :
                                                asesor.numProyectos >= 1 ? '#059669' : '#64748B'
                                    }}>
                                        {asesor.numProyectos >= 7 ? '🔴 Carga alta' :
                                            asesor.numProyectos >= 4 ? '🟡 Carga media' :
                                                asesor.numProyectos >= 1 ? '🟢 Disponible' : '⚪ Sin carga'}
                                    </div>
                                </div>

                                {isExpanded && asesor.proyectos.length > 0 && (
                                    <div style={{
                                        marginTop: 12,
                                        paddingLeft: 42,
                                        paddingRight: 12
                                    }}>
                                        <div style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#64748B',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            marginBottom: 8
                                        }}>
                                            Proyectos activos:
                                        </div>
                                        {asesor.proyectos.map((proyecto, pIdx) => (
                                            <div key={proyecto.id} style={{
                                                fontSize: 13,
                                                color: '#374151',
                                                paddingTop: 6,
                                                paddingBottom: 6,
                                                display: 'flex',
                                                gap: 8
                                            }}>
                                                <span style={{ color: '#94A3B8' }}>•</span>
                                                <span>
                                                    <strong style={{ color: '#24375b' }}>{proyecto.nombre}</strong>
                                                    {' - '}
                                                    <span>{proyecto.estudiante}</span>
                                                    {' - '}
                                                    <span className="badge badge-blue" style={{ fontSize: 10, padding: '2px 6px' }}>
                                                        {proyecto.carrera}
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isExpanded && asesor.proyectos.length === 0 && (
                                    <div style={{
                                        marginTop: 12,
                                        paddingLeft: 42,
                                        fontSize: 13,
                                        color: '#94A3B8',
                                        fontStyle: 'italic'
                                    }}>
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


/* ===== CAREERS PAGE ===== */
function Careers() {
    const { notify } = useNotification();
    const [carreras, setCarreras] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [editando, setEditando] = useState(null);   // carrera obj o null
    const [showSpec, setShowSpec] = useState(null);   // carrera obj
    const [especialidades, setEspecialidades] = useState([]);
    const [search, setSearch] = useState("");
    const [formNombre, setFormNombre] = useState("");
    const [formHabilitada, setFormHabilitada] = useState(true);
    const [formEsp, setFormEsp] = useState("");     // nueva especialidad
    const [loading, setLoading] = useState(false);

    const cargarCarreras = () => {
        fetch('/api/carreras/habilitadas')
            .then(r => r.json())
            .then(data => setCarreras(Array.isArray(data) ? data : []))
            .catch(() => setCarreras([]));
    };

    useEffect(() => { cargarCarreras(); }, []);

    const cargarEspecialidades = (carreraId) => {
        fetch(`/api/especialidades/${carreraId}`)
            .then(r => r.json())
            .then(data => setEspecialidades(Array.isArray(data) ? data : []))
            .catch(() => setEspecialidades([]));
    };

    const abrirNueva = () => {
        setEditando(null);
        setFormNombre("");
        setFormHabilitada(true);
        setShowAdd(true);
    };

    const abrirEditar = (c) => {
        setEditando(c);
        setFormNombre(c.nombre);
        setFormHabilitada(c.habilitada !== false);
        setShowAdd(true);
    };

    const guardarCarrera = () => {
        if (!formNombre.trim()) return;
        setLoading(true);
        // Para v1.0 solo muestra confirmación — endpoint POST/PUT de carreras
        // puede agregarse al backend si se requiere crear desde UI
        notify(`Carrera "${formNombre}" guardada (requiere endpoint POST /api/carreras)`, 'info');
        setLoading(false);
        setShowAdd(false);
        cargarCarreras();
    };

    const filtered = useMemo(() => {
        if (!search) return carreras;
        const s = search.toLowerCase();
        return carreras.filter(c => c.nombre.toLowerCase().includes(s));
    }, [search, carreras]);

    return (
        <div>
            <div className="page-header">
                <h1>Carreras y especialidades</h1>
                <p>Catálogo de carreras habilitadas en el sistema</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon">🎓</div>
                    <div className="stat-label">Total de carreras</div>
                    <div className="stat-value">{carreras.length}</div>
                    <div className="stat-sub">Registradas en el sistema</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-label">Especialidades totales</div>
                    <div className="stat-value">{especialidades.length || "—"}</div>
                    <div className="stat-sub">Selecciona una carrera para ver</div>
                </div>
            </div>
            <div className="table-card">
                <div className="table-header">
                    <div className="search-box">
                        <Icon n="search" />
                        <input placeholder="Buscar carrera..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="topbar-btn btn-primary" onClick={abrirNueva}>
                        <Icon n="plus" /> Añadir carrera
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Habilitada</th>
                            <th>Fecha de registro</th>
                            <th>Última modificación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: "center", color: "#94A3B8", padding: 24 }}>
                                No hay carreras registradas
                            </td></tr>
                        ) : filtered.map(c => (
                            <tr key={c.id}>
                                <td className="td-name" title={c.nombre}>{c.nombre}</td>
                                <td>
                                    <span className={`badge ${c.habilitada ? "badge-green" : "badge-red"}`}>
                                        {c.habilitada ? "✓ Habilitada" : "✗ Deshabilitada"}
                                    </span>
                                </td>
                                <td style={{ fontSize: 11 }}>
                                    {c.fecha_registro
                                        ? new Date(c.fecha_registro).toLocaleDateString('es-MX')
                                        : "—"}
                                </td>
                                <td style={{ fontSize: 11 }}>
                                    {c.fecha_modificacion
                                        ? new Date(c.fecha_modificacion).toLocaleDateString('es-MX')
                                        : "—"}
                                </td>
                                <td>
                                    <div className="inline-actions">
                                        <button className="action-btn ab-edit"
                                            onClick={() => abrirEditar(c)}>Editar</button>
                                        <button className="action-btn ab-view"
                                            onClick={() => { setShowSpec(c); cargarEspecialidades(c.id); }}>
                                            Ver especialidades
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="table-footer">
                    <span>Número de registros: {filtered.length}</span>
                </div>
            </div>

            {/* Modal nueva/editar carrera */}
            <Modal show={showAdd} onClose={() => setShowAdd(false)}
                title={editando ? "Editar carrera" : "Nueva carrera"} size="sm"
                footer={<>
                    <button className="topbar-btn btn-ghost" onClick={() => setShowAdd(false)}>
                        Cancelar
                    </button>
                    <button className="topbar-btn btn-primary" onClick={guardarCarrera} disabled={loading}>
                        <Icon n="check" /> {loading ? "Guardando..." : "Guardar"}
                    </button>
                </>}>
                <div className="form-grid" style={{ gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">
                            Nombre de la carrera <span className="req">*</span>
                        </label>
                        <input className="form-input"
                            placeholder="Ej. Ingeniería en Sistemas Computacionales"
                            value={formNombre}
                            onChange={e => setFormNombre(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-row">
                            <input type="checkbox" checked={formHabilitada}
                                onChange={e => setFormHabilitada(e.target.checked)} />
                            <span>Habilitada</span>
                        </label>
                    </div>
                </div>
            </Modal>

            {/* Modal especialidades */}
            <Modal show={!!showSpec} onClose={() => { setShowSpec(null); setEspecialidades([]); }}
                title="Especialidades" sub={showSpec?.nombre} size="sm"
                footer={<button className="topbar-btn btn-ghost"
                    onClick={() => { setShowSpec(null); setEspecialidades([]); }}>
                    Cerrar
                </button>}>
                <div>
                    {especialidades.length === 0
                        ? <p style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: 16 }}>
                            No hay especialidades registradas
                        </p>
                        : especialidades.map(esp => (
                            <div className="doc-item" key={esp.id}>
                                <span className="doc-name">{esp.nombre}</span>
                                <span className="badge badge-green" style={{ fontSize: 10 }}>✓</span>
                            </div>
                        ))
                    }
                    <button className="doc-add" style={{ marginTop: 8 }}>
                        <Icon n="plus" /> Añadir especialidad
                    </button>
                </div>
            </Modal>
        </div>
    );
}

/* ===== PROJECTS PAGE ===== */
function Projects({ darkMode }) {
    const [asesores, setAsesores] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);

    const cargarAsesores = () => {
        fetch('/api/asesores')
            .then(r => r.json())
            .then(data => setAsesores(Array.isArray(data) ? data : []))
            .catch(() => setAsesores([]));
    };

    const cargarProyectos = () => {
        fetch('/api/proyectos')
            .then(r => r.json())
            .then(data => setProyectos(Array.isArray(data) ? data : []))
            .catch(() => setProyectos([]));
    };

    useEffect(() => {
        cargarAsesores();
        cargarProyectos();
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1>Proyectos en progreso</h1>
                <p>Seguimiento y gestión de proyectos de residencias</p>
            </div>

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    className="topbar-btn btn-primary"
                    onClick={() => setShowNewProjectModal(true)}
                >
                    <Icon n="plus" /> Agregar proyecto en progreso
                </button>
            </div>

            <ProjectsWorkloadDashboard
                asesores={asesores}
                proyectos={proyectos}
                darkMode={darkMode}
                onRefreshProyectos={cargarProyectos}
            />

            {/* Reutilizamos ResidentModal en modo proyecto */}
            <ResidentModal
                show={showNewProjectModal}
                onClose={() => setShowNewProjectModal(false)}
                onSaved={() => { cargarAsesores(); cargarProyectos(); }}
                isProjectMode={true}
            />
        </div>
    );
}

/* ===== PROJECTS WORKLOAD DASHBOARD (mejorado) ===== */
function ProjectsWorkloadDashboard({ asesores, proyectos, darkMode, onRefreshProyectos }) {
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
        // badge colors matching residentes badge pattern
        badgeBg: (n) => n >= 7 ? (darkMode ? '#450A0A' : '#FEE2E2')
            : n >= 4 ? (darkMode ? '#451A03' : '#FEF3C7')
                : n >= 1 ? (darkMode ? '#064E3B' : '#D1FAE5')
                    : (darkMode ? '#1E293B' : '#F1F5F9'),
        badgeClr: (n) => n >= 7 ? (darkMode ? '#FCA5A5' : '#DC2626')
            : n >= 4 ? (darkMode ? '#FCD34D' : '#D97706')
                : n >= 1 ? (darkMode ? '#6EE7B7' : '#059669')
                    : (darkMode ? '#94A3B8' : '#64748B'),
        // milestone colors: slightly muted in dark
        mColor: (state) => state === 'completado' ? (darkMode ? '#059669' : '#10B981')
            : state === 'en_progreso' ? (darkMode ? '#B45309' : '#F59E0B')
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
                    { emoji: '⚙️', label: 'Total Projects', val: totalProyectos },
                    { emoji: '👥', label: 'Active Advisors', val: numAsesores },
                    { emoji: '📊', label: 'Average Load', val: promedioProyectos },
                ].map(({ emoji, label, val }) => (
                    <div key={label} style={{ background: d.card, border: `1px solid ${d.cardBdr}`, borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: d.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{emoji}</div>
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
                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.mColor('in-progress') }}></div>
                        <span style={{ color: d.sub }}>En proceso</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.mColor('completed') }}></div>
                        <span style={{ color: d.sub }}>Finalizado</span>
                    </div>
                </div>
            </div>

            {/* Detalle por asesor (Accordion) */}
            <Card>
                <CardHeader title="Detalle por asesor" />
                <div style={{ padding: '0 24px 24px 24px' }}>
                    {asesoresOrdenados.map((asesor, idx) => {
                        const isExpanded = expandedAdvisor === asesor.id;
                        const colorInfo = getColorCarga(asesor.numProyectos);
                        return (
                            <div key={asesor.id} style={{ borderBottom: idx < asesoresOrdenados.length - 1 ? `1px solid ${d.rowDiv}` : 'none', paddingTop: idx === 0 ? 24 : 16, paddingBottom: 16 }}>
                                <div
                                    onClick={() => setExpandedAdvisor(isExpanded ? null : asesor.id)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = d.rowHover}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 18 }}>{isExpanded ? '▽' : '▷'}</span>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: d.hdr }}>{asesor.nombres} {asesor.apellidos}</div>
                                            <div style={{ fontSize: 12, color: d.sub, marginTop: 2 }}>{asesor.numProyectos} {asesor.numProyectos === 1 ? 'proyecto activo' : 'proyectos activos'}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: d.badgeBg(asesor.numProyectos), color: d.badgeClr(asesor.numProyectos) }}>
                                        {asesor.numProyectos >= 7 ? '🔴 Carga alta' : asesor.numProyectos >= 4 ? '🟡 Carga media' : asesor.numProyectos >= 1 ? '🟢 Disponible' : '⚪ Sin carga'}
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
                                                        {/* FolderPlus icon */}
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                            <line x1="12" y1="11" x2="12" y2="17" />
                                                            <line x1="9" y1="14" x2="15" y2="14" />
                                                        </svg>
                                                        Generar Expediente
                                                    </button>
                                                )}

                                                {/* Flujo lineal de hitos */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
                                                    {[1, 2, 3].map((num, mIdx) => {
                                                        const state = getMilestoneState(proyecto, num);
                                                        const color = d.mColor(state);
                                                        const milestoneLabels = { 1: '1er reporte', 2: '2do reporte', 3: 'Reporte final' };
                                                        // Poka-Yoke: bloquear hito si el anterior no está completado
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


/* ===== REPORTS PAGE ===== */
function Reports() {
    return (
        <div>
            <div className="page-header"><h1>Panel de reportes</h1><p>Informes y estadísticas del programa de residencias</p></div>
            <div className="grid-2" style={{ marginBottom: 24 }}>
                {[{ title: "Residentes por semestre", icon: "📊", desc: "Distribución ENE-JUN / AGO-DIC por año" }, { title: "Expedientes por empresa", icon: "🏢", desc: "Ranking de empresas con más residentes" }, { title: "Estado de documentos", icon: "📁", desc: "Avance en entrega de documentos por residente" }, { title: "Reporte de asesores", icon: "👨‍🏫", desc: "Carga de asesoría por docente" }].map((r, i) => (
                    <div className="stat-card" key={i} style={{ cursor: "pointer", display: "flex", gap: 18, alignItems: "center", padding: "22px 24px" }}>
                        <div style={{ fontSize: 38, flexShrink: 0 }}>{r.icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: NAV_BLUE, fontSize: 15 }}>{r.title}</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{r.desc}</div></div>
                        <button className="topbar-btn btn-primary" style={{ marginLeft: "auto", fontSize: 12, padding: "9px 18px", flexShrink: 0 }}>Generar</button>
                    </div>
                ))}
            </div>
            <div className="card" style={{ width: "100%" }}>
                <div className="card-header"><span className="card-title">Filtros para reporte personalizado</span></div>
                <div style={{ padding: "20px 24px" }}>
                    <div className="form-grid form-grid-3" style={{ marginBottom: 18 }}>
                        <div className="form-group"><label className="form-label">Año</label><input className="form-select" placeholder="Año (ej. 2024)" /></div>
                        <div className="form-group"><label className="form-label">Semestre</label><select className="form-select"><option>Todos</option><option>ENE-JUN</option><option>AGO-DIC</option></select></div>
                        <div className="form-group"><label className="form-label">Carrera</label><select className="form-select"><option>Todas</option><option>Ingeniería en Sistemas Computacionales</option><option>Ingeniería Industrial</option></select></div>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button className="topbar-btn btn-secondary" style={{ border: "1.5px solid #D1DAE8", padding: "10px 20px", fontSize: 13 }}>Vista previa</button>
                        <button className="topbar-btn btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>Exportar PDF</button>
                        <button className="topbar-btn btn-primary" style={{ background: "#16A34A", padding: "10px 20px", fontSize: 13 }}>Exportar Excel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ===== MAIN APP ===== */

const MSF_LOGO_SIZE = 70; // px

// Componente para efecto Dock en modo contraído
function NavDock({ children, isCollapsed }) {
    const [mouseY, setMouseY] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isCollapsed || !containerRef.current) return;

        const handleMouseMove = (e) => {
            const rect = containerRef.current.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            setMouseY(relativeY);
        };

        const handleMouseLeave = () => {
            setMouseY(null);
        };

        const container = containerRef.current;
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isCollapsed]);

    useEffect(() => {
        if (!isCollapsed || !containerRef.current) {
            return;
        }

        const items = containerRef.current.querySelectorAll('.nav-item, .sidebar-manual, .sidebar-darkrow');

        items.forEach((item) => {
            if (!item) return;

            const label = item.querySelector('.nav-label-short, .manual-label-short, .dark-mode-label-short');

            if (mouseY === null) {
                // Reset al tamaño original
                item.style.transform = 'scale(1)';
                if (label) label.style.fontSize = '11px';
                return;
            }

            const rect = item.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const itemCenterY = rect.top + rect.height / 2 - containerRect.top;
            const distance = Math.abs(mouseY - itemCenterY);

            // Configuración del efecto Dock
            const maxScale = 1.5; // Escala máxima del icono bajo el cursor
            const influenceRadius = 120; // Radio de influencia en píxeles

            let scale = 1;
            if (distance < influenceRadius) {
                // Curva de magnificación (más pronunciada cerca del cursor)
                const normalizedDistance = distance / influenceRadius;
                scale = 1 + (maxScale - 1) * Math.pow(1 - normalizedDistance, 2);
            }

            // Aplicar transform
            item.style.transform = `scale(${scale})`;

            // Escalar también el texto
            if (label) {
                const fontSize = 11 + (scale - 1) * 3; // Aumenta proporcionalmente
                label.style.fontSize = `${fontSize}px`;
            }
        });
    }, [mouseY, isCollapsed]);

    if (!isCollapsed) {
        // En modo expandido, renderizar children sin efecto
        return <>{children}</>;
    }

    // En modo contraído, envolver con container para tracking del mouse
    return (
        <div ref={containerRef}>
            {children}
        </div>
    );
}

export default function App() {
    const [page, setPage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const nav = [
        { id: "dashboard", label: "Panel principal", short: "Inicio", icon: "dashboard" },
        { id: "projects", label: "Proyectos en progreso", short: "Proyectos", icon: "projects" },
        { id: "residents", label: "Residentes", short: "Residentes", icon: "residents" },
        { id: "advisors", label: "Asesores", short: "Asesores", icon: "advisors" },
        { id: "companies", label: "Empresas", short: "Empresas", icon: "companies" },
        { id: "careers", label: "Carreras", short: "Carreras", icon: "careers" },
        { id: "reports", label: "Reportes", short: "Reportes", icon: "reports" },
    ];

    const titles = {
        dashboard: "Panel de administración",
        projects: "Proyectos en progreso",
        residents: "Residentes",
        advisors: "Catálogo de asesores",
        companies: "Catálogo de empresas",
        careers: "Carreras y especialidades",
        reports: "Informes y reportes",
    };

    const pageEl = {
        dashboard: <Dashboard setPage={setPage} />,
        projects: <Projects darkMode={darkMode} />,
        residents: <Residents />,
        advisors: <Asesores />,
        companies: <Companies />,
        careers: <Careers />,
        reports: <Reports />,
    };

    return (
        <NotifProvider>
            <>
                <style>{styles}</style>
                <div className="app">

                    {/* ── TOPBAR: ancho completo, siempre en la cima ── */}
                    <div className="topbar">
                        <div className="topbar-title">{titles[page]}</div>
                        <span className="topbar-badge">🎓 TECNM</span>
                    </div>

                    {/* ── FILA INFERIOR: dock flotante + panel de contenido ── */}
                    <div className="body-row">

                        {/* Sidebar / Dock flotante */}
                        <div className={`sidebar ${sidebarOpen ? "expanded" : "collapsed"}`}>
                            {/* Header/logo area */}
                            <div className="sidebar-logo">
                                {/* Collapsed: hamburger button */}
                                <button className="sidebar-hamburger" onClick={() => setSidebarOpen(true)} title="Expandir menú">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </button>
                                {/* Expanded: logo text */}
                                <div className="logo-text">
                                    <div className="inst">TECNM</div>
                                    <div className="title">Archivo de<br />Residencias</div>
                                    <div className="sub">Ciudad Madero</div>
                                </div>
                                {/* Expanded: chevron toggle */}
                                <div className="sidebar-toggle-float" onClick={() => setSidebarOpen(false)} title="Colapsar">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
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
                                {/* Manual de usuario */}
                                <div className="sidebar-manual"
                                    onClick={() => window.open('/manual_usuario.pdf', '_blank')}
                                    title="Manual de usuario">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                    <span className="nav-label-full">Manual de usuario</span>
                                    <span className="manual-label-short">Manual de usuario</span>
                                </div>
                                {/* Modo oscuro */}
                                <div className="sidebar-darkrow" onClick={sidebarOpen ? undefined : () => setDarkMode(d => !d)}>
                                    <button className="dark-icon-btn" onClick={() => setDarkMode(d => !d)} title={darkMode ? "Modo oscuro" : "Modo claro"}>
                                        {darkMode
                                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                                        }
                                    </button>
                                    <span className="dark-mode-label-short">{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                                    <span className="dark-label">{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                                    <label className="dark-switch">
                                        <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
                                        <span className="dark-slider"></span>
                                    </label>
                                </div>
                            </NavDock>
                            {/* Footer */}
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

                    </div>{/* end body-row */}
                </div>
            </>
        </NotifProvider>
    );
}
