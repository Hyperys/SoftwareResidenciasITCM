import os
from flask import Blueprint, jsonify, request
from database import get_connection

bp = Blueprint('proyectos', __name__, url_prefix='/api')

SELECT_PROYECTOS = """
    SELECT
        r.num_control,
        CONCAT(r.nombres, ' ', r.apellidos) AS nombre_completo,
        r.nombres, r.apellidos, r.sexo, r.correo, r.telefono,
        r.carrera_id, c.nombre               AS carrera,
        r.especialidad_id, e.nombre           AS especialidad,
        r.empresa_id, emp.nombre              AS empresa,
        r.nombre_proyecto, r.departamento, r.horario,
        r.semestre, r.anio, r.fecha_inicio, r.fecha_cierre,
        r.observaciones, r.estado,
        r.es_expediente,
        r.estado_hito1, r.estado_hito2, r.estado_hito3,
        r.asesor_interno_id,
        CASE WHEN ai.id IS NULL THEN NULL
             ELSE CONCAT(ai.nombres,' ',ai.apellidos) END AS asesor_interno,
        r.asesor_externo_id,
        CASE WHEN ae.id IS NULL THEN NULL
             ELSE CONCAT(ae.nombres,' ',ae.apellidos) END AS asesor_externo,
        r.revisor_id,
        CASE WHEN rv.id IS NULL THEN NULL
             ELSE CONCAT(rv.nombres,' ',rv.apellidos) END AS revisor,
        r.fecha_registro, r.fecha_modificacion
    FROM residentes r
    LEFT JOIN carreras       c   ON r.carrera_id        = c.id
    LEFT JOIN especialidades e   ON r.especialidad_id   = e.id
    LEFT JOIN empresas       emp ON r.empresa_id        = emp.id
    LEFT JOIN asesores       ai  ON r.asesor_interno_id = ai.id
    LEFT JOIN asesores       ae  ON r.asesor_externo_id = ae.id
    LEFT JOIN asesores       rv  ON r.revisor_id        = rv.id
    WHERE r.es_expediente = 0
"""


# ── GET /api/proyectos ──────────────────────────────────────────────────────
@bp.route('/proyectos', methods=['GET'])
def get_proyectos():
    search   = request.args.get('search',   '').strip()
    anio     = request.args.get('anio',     '').strip()
    semestre = request.args.get('semestre', '').strip()
    estado   = request.args.get('estado',   '').strip()

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query  = SELECT_PROYECTOS
        params = []
        if search:
            query += """ AND (r.num_control LIKE %s
                          OR CONCAT(r.nombres,' ',r.apellidos) LIKE %s
                          OR r.correo LIKE %s)"""
            params += [f"%{search}%", f"%{search}%", f"%{search}%"]
        if anio:
            query += " AND r.anio = %s"
            params.append(anio)
        if semestre:
            query += " AND r.semestre = %s"
            params.append(semestre)
        if estado:
            query += " AND r.estado = %s"
            params.append(estado)
        query += " ORDER BY r.fecha_registro DESC"
        cursor.execute(query, params)
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


# ── GET /api/proyectos/<num_control> ─────────────────────────────────────────
@bp.route('/proyectos/<num_control>', methods=['GET'])
def get_proyecto(num_control):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(SELECT_PROYECTOS + " AND r.num_control = %s", (num_control,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Proyecto no encontrado"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


# ── POST /api/proyectos ─────────────────────────────────────────────────────
@bp.route('/proyectos', methods=['POST'])
def create_proyecto():
    data = request.get_json()
    num_control = (data.get('num_control') or '').strip()
    if not num_control:
        return jsonify({"error": "N° de control requerido"}), 422

    fecha_inicio_raw = data.get('fecha_inicio') or ''
    if not fecha_inicio_raw:
        return jsonify({"error": "Fecha de inicio requerida"}), 422

    from datetime import datetime
    try:
        if len(fecha_inicio_raw) >= 10 and fecha_inicio_raw[4] == '-':
            fecha_inicio = fecha_inicio_raw[:10]
            anio = int(fecha_inicio[:4])
        else:
            dt = datetime.strptime(fecha_inicio_raw[:16].strip(), '%a, %d %b %Y')
            fecha_inicio = dt.strftime('%Y-%m-%d')
            anio = dt.year
    except Exception:
        fecha_inicio = fecha_inicio_raw[:10]
        anio = int(fecha_inicio[:4]) if fecha_inicio[:4].isdigit() else None
    if not anio:
        return jsonify({"error": "Fecha de inicio inválida"}), 422

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute("SELECT num_control FROM residentes WHERE num_control = %s", (num_control,))
        if cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "El N° de control ya está registrado"}), 409

        cursor.execute("""
            INSERT INTO residentes (
                num_control, nombres, apellidos, sexo, correo, telefono,
                carrera_id, especialidad_id, empresa_id,
                asesor_interno_id, asesor_externo_id, revisor_id,
                nombre_proyecto, departamento, horario,
                semestre, anio, fecha_inicio, fecha_cierre,
                observaciones, estado,
                es_expediente, estado_hito1, estado_hito2, estado_hito3
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            num_control,
            data.get('nombres'), data.get('apellidos'), data.get('sexo'),
            data.get('correo'), data.get('telefono') or '',
            data.get('carrera_id') or None, data.get('especialidad_id') or None,
            data.get('empresa_id') or None,
            data.get('asesor_interno_id') or None,
            data.get('asesor_externo_id') or None,
            data.get('revisor_id') or None,
            data.get('nombre_proyecto'),
            data.get('departamento') or '',
            data.get('horario') or '',
            data.get('semestre'),
            anio, fecha_inicio,
            data.get('fecha_cierre') or None,
            data.get('observaciones') or None,
            data.get('estado', 'activo'),
            0, 'pendiente', 'pendiente', 'pendiente'
        ))

        conn.commit()
        return jsonify({"ok": True, "num_control": num_control}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


# ── PUT /api/proyectos/<num_control> ─────────────────────────────────────────
@bp.route('/proyectos/<num_control>', methods=['PUT'])
def update_proyecto(num_control):
    data = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute(
            "SELECT es_expediente FROM residentes WHERE num_control = %s", (num_control,)
        )
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return jsonify({"error": "Proyecto no encontrado"}), 404
        if row['es_expediente'] == 1:
            conn.rollback()
            return jsonify({"error": "Este registro ya fue convertido a expediente y no puede editarse desde proyectos"}), 409

        fecha_inicio_raw = data.get('fecha_inicio') or ''
        from datetime import datetime
        try:
            if len(fecha_inicio_raw) >= 10 and fecha_inicio_raw[4] == '-':
                fecha_inicio = fecha_inicio_raw[:10]
                anio = int(fecha_inicio[:4])
            else:
                dt = datetime.strptime(fecha_inicio_raw[:16].strip(), '%a, %d %b %Y')
                fecha_inicio = dt.strftime('%Y-%m-%d')
                anio = dt.year
        except Exception:
            fecha_inicio = fecha_inicio_raw[:10]
            anio = int(fecha_inicio[:4]) if fecha_inicio[:4].isdigit() else None

        cursor.execute("""
            UPDATE residentes SET
                nombres=%s, apellidos=%s, sexo=%s, correo=%s, telefono=%s,
                carrera_id=%s, especialidad_id=%s, empresa_id=%s,
                asesor_interno_id=%s, asesor_externo_id=%s, revisor_id=%s,
                nombre_proyecto=%s, departamento=%s, horario=%s,
                semestre=%s, anio=%s, fecha_inicio=%s, fecha_cierre=%s,
                observaciones=%s, estado=%s,
                fecha_modificacion=NOW()
            WHERE num_control=%s
        """, (
            data.get('nombres'), data.get('apellidos'), data.get('sexo'),
            data.get('correo'), data.get('telefono') or '',
            data.get('carrera_id') or None, data.get('especialidad_id') or None,
            data.get('empresa_id') or None,
            data.get('asesor_interno_id') or None,
            data.get('asesor_externo_id') or None,
            data.get('revisor_id') or None,
            data.get('nombre_proyecto'),
            data.get('departamento') or '',
            data.get('horario') or '',
            data.get('semestre'),
            anio, fecha_inicio,
            data.get('fecha_cierre') or None,
            data.get('observaciones') or None,
            data.get('estado', 'activo'),
            num_control
        ))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


# ── PATCH /api/proyectos/<num_control>/hito ──────────────────────────────────
@bp.route('/proyectos/<num_control>/hito', methods=['PATCH'])
def actualizar_hito(num_control):
    data   = request.get_json()
    hito   = data.get('hito')
    estado = data.get('estado')

    estados_validos = ('pendiente', 'en_progreso', 'completado')
    if hito not in (1, 2, 3):
        return jsonify({"error": "Número de hito inválido. Debe ser 1, 2 o 3"}), 422
    if estado not in estados_validos:
        return jsonify({"error": f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"}), 422

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute(
            "SELECT es_expediente, estado_hito1, estado_hito2, estado_hito3 FROM residentes WHERE num_control = %s",
            (num_control,)
        )
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return jsonify({"error": "Proyecto no encontrado"}), 404
        if row['es_expediente'] == 1:
            conn.rollback()
            return jsonify({"error": "Este proyecto ya fue convertido a expediente"}), 409

        if hito == 2 and row['estado_hito1'] != 'completado':
            conn.rollback()
            return jsonify({"error": "El Hito 1 debe estar completado antes de avanzar el Hito 2"}), 409
        if hito == 3 and row['estado_hito2'] != 'completado':
            conn.rollback()
            return jsonify({"error": "El Hito 2 debe estar completado antes de avanzar el Hito 3"}), 409

        campo = f"estado_hito{hito}"
        cursor.execute(
            f"UPDATE residentes SET {campo} = %s, fecha_modificacion = NOW() WHERE num_control = %s",
            (estado, num_control)
        )
        conn.commit()
        return jsonify({"ok": True, "hito": hito, "estado": estado})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


# ── PATCH /api/proyectos/<num_control>/convertir ─────────────────────────────
@bp.route('/proyectos/<num_control>/convertir', methods=['PATCH'])
def convertir_a_expediente(num_control):
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute(
            "SELECT es_expediente, estado_hito3 FROM residentes WHERE num_control = %s",
            (num_control,)
        )
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return jsonify({"error": "Proyecto no encontrado"}), 404
        if row['es_expediente'] == 1:
            conn.rollback()
            return jsonify({"error": "Este proyecto ya fue convertido anteriormente"}), 409
        if row['estado_hito3'] != 'completado':
            conn.rollback()
            return jsonify({"error": "El Hito 3 (Reporte Final) debe estar completado para generar el expediente"}), 409

        cursor.execute(
            "UPDATE residentes SET es_expediente = 1, fecha_modificacion = NOW() WHERE num_control = %s",
            (num_control,)
        )
        conn.commit()
        return jsonify({"ok": True, "num_control": num_control, "mensaje": "Expediente generado correctamente"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


# ── DELETE /api/proyectos/<num_control> ──────────────────────────────────────
@bp.route('/proyectos/<num_control>', methods=['DELETE'])
def delete_proyecto(num_control):
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute(
            "SELECT es_expediente FROM residentes WHERE num_control = %s", (num_control,)
        )
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return jsonify({"error": "Proyecto no encontrado"}), 404
        if row['es_expediente'] == 1:
            conn.rollback()
            return jsonify({"error": "Este registro ya es un expediente y no puede eliminarse desde proyectos"}), 409

        cursor.execute("SELECT COUNT(*) AS total FROM documentos WHERE num_control = %s", (num_control,))
        if cursor.fetchone()['total'] > 0:
            conn.rollback()
            return jsonify({"error": "El registro tiene documentos asociados y no puede eliminarse"}), 409

        cursor.execute("DELETE FROM residentes WHERE num_control = %s", (num_control,))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()
