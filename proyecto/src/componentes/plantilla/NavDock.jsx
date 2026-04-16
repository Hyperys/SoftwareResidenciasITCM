import React, { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// NAV DOCK — Efecto de magnificación tipo macOS Dock
// Se activa solo cuando el sidebar está colapsado (isCollapsed=true)
// ══════════════════════════════════════════════════════════════

export function NavDock({ children, isCollapsed }) {
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
