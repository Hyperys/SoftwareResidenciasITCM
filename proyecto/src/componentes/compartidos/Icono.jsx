import React from "react";

// ══════════════════════════════════════════════════════════════
// ICONO — Wrapper de Material Symbols Rounded
// ══════════════════════════════════════════════════════════════

export const ICON_MAP = {
    dashboard:    'grid_view',
    projects:     'task_alt',
    residents:    'groups',
    advisors:     'person_add',
    revisores:    'rate_review',
    companies:    'business',
    careers:      'school',
    reports:      'description',
    search:       'search',
    plus:         'add',
    backup:       'backup',
    doc:          'description',
    trash:        'delete',
    check:        'check',
    open:         'open_in_new',
    chevronLeft:  'chevron_left',
    chevronRight: 'chevron_right',
};

export const ICON_SIZE = {
    dashboard: 18, projects: 18, residents: 18, advisors: 18,
    revisores: 18, companies: 18, careers: 18, reports: 18,
    search: 16, plus: 16, backup: 16, doc: 15,
    trash: 14, check: 15, open: 14, chevronLeft: 18, chevronRight: 18,
};

export function Icon({ n }) {
    const name = ICON_MAP[n];
    if (!name) return null;
    const size = ICON_SIZE[n] || 18;
    return (
        <span
            className="material-symbols-rounded"
            style={{ fontSize: size, lineHeight: 1 }}
        >
            {name}
        </span>
    );
}
