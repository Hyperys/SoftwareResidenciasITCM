# Guía de Contribución — SoftwareResidenciasITCM

## Flujo de trabajo (Git Flow simplificado)

```
main ← solo vía Pull Request
  └── feature/nombre-de-feature
  └── fix/descripcion-del-bug
  └── chore/tarea-de-mantenimiento
```

### 1. Crear rama de trabajo

```bash
# Actualiza main primero
git checkout main
git pull origin main

# Crea tu rama
git checkout -b feature/nombre-descriptivo
```

**Convención de nombres de rama**:
| Prefijo | Uso |
|---|---|
| `feature/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `chore/` | Mantenimiento, dependencias, configuración |
| `docs/` | Documentación |
| `refactor/` | Refactoring sin cambio de comportamiento |

### 2. Convención de commits (Conventional Commits)

```
<tipo>(alcance): descripción corta en español

feat(residentes): agregar filtro por carrera en tabla
fix(api): corregir error 500 en endpoint de documentos
chore(deps): actualizar flask a 3.x
docs(readme): agregar instrucciones de setup
refactor(App.jsx): extraer componente ResidenteModal
```

**Tipos válidos**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

### 3. Abrir Pull Request

- **Base**: `main`
- **Título**: mismo formato que commits (`feat(módulo): descripción`)
- **Descripción**: qué cambia, por qué, cómo probarlo
- Resuelve todos los comentarios del reviewer antes de merge

### 4. Checklist antes de solicitar review

- [ ] El código compila/corre sin errores
- [ ] La funcionalidad fue probada manualmente
- [ ] No hay `console.log` de debug olvidados
- [ ] No se incluyó `database.py`, `.env`, ni archivos de `expedientespdf/`
- [ ] El `.gitignore` no fue modificado sin justificación

---

## Setup de entorno de desarrollo

Ver `.mcp.md` — sección "Setup rápido (nuevo colaborador)".
