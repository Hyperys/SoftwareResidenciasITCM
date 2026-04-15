import os, shutil
from flask import Blueprint, jsonify, request
from database import get_connection

bp = Blueprint('residentes', __name__, url_prefix='/api')


def _get_ruta_base(cursor):
    # Primary: from configuracion table
    cursor.execute("SELECT valor FROM configuracion WHERE clave = 'ruta_archivos' LIMIT 1")
    row = cursor.fetchone()
    if row and row['valor']:
        return row['valor']
    # Fallback: expedientespdf/ next to backend folder
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, 'expedientespdf')


SELECT_RESIDENTES = """
    SELECT
        r.num_control,
        CONCAT(r.nombres, ' ', r.apellidos)               AS nombre_completo,
        r.nombres, r.apellidos, r.sexo, r.correo, r.telefono,
        r.carrera_id, c.nombre                            AS carrera,
        r.especialidad_id, e.nombre                       AS especialidad,
        r.empresa_id, emp.nombre                          AS empresa,
        r.nombre_proyecto, r.departamento, r.horario,
        r.semestre, r.anio, r.fecha_inicio, r.fecha_cierre,
        r.observaciones, r.estado, r.ruta_archivos,
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
"""


@bp.route('/residentes', methods=['GET'])
def get_residentes():
    search   = request.args.get('search',   '').strip()
    anio     = request.args.get('anio',     '').strip()
    semestre = request.args.get('semestre', '').strip()
    estado   = request.args.get('estado',   '').strip()

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query  = SELECT_RESIDENTES + " WHERE r.es_expediente = 1"
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


@bp.route('/residentes/<num_control>', methods=['GET'])
def get_residente(num_control):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(SELECT_RESIDENTES + " WHERE r.num_control = %s", (num_control,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Residente no encontrado"}), 404
        cursor.execute("""
            SELECT d.id, d.nombre_archivo, d.ruta_relativa,
                   d.tamanio_kb, d.fecha_subida,
                   td.descripcion AS tipo, d.tipo_doc_id
            FROM documentos d
            JOIN tipos_documento td ON d.tipo_doc_id = td.id
            WHERE d.num_control = %s
            ORDER BY d.fecha_subida
        """, (num_control,))
        row['documentos'] = cursor.fetchall()
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


@bp.route('/residentes', methods=['POST'])
def create_residente():
    data = request.get_json()
    num_control = (data.get('num_control') or '').strip()
    if not num_control:
        return jsonify({"error": "N° de control requerido"}), 422

    fecha_inicio_raw = data.get('fecha_inicio') or ''
    if not fecha_inicio_raw:
        return jsonify({"error": "Fecha de inicio requerida para extraer el año"}), 422
    # Handle both 'YYYY-MM-DD' and RFC date strings like 'Mon, 25 Aug 2023 00:00:00 GMT'
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
    carpeta = None
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
                observaciones, estado
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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
            anio,
            fecha_inicio,
            data.get('fecha_cierre') or None,
            data.get('observaciones') or None,
            data.get('estado', 'activo')
        ))

        # Crear carpeta física, guardar ruta_relativa
        ruta_base = _get_ruta_base(cursor)
        ruta_relativa = os.path.join(str(anio), num_control).replace('\\', '/')
        carpeta = os.path.join(ruta_base, str(anio), num_control)
        try:
            os.makedirs(carpeta, exist_ok=True)
        except Exception as e:
            pass  # Si falla disco no rollback, solo no se crea carpeta
        cursor.execute(
            "UPDATE residentes SET ruta_archivos=%s WHERE num_control=%s",
            (ruta_relativa, num_control)
        )

        conn.commit()
        return jsonify({"ok": True, "num_control": num_control}), 201

    except Exception as e:
        conn.rollback()
        if carpeta and os.path.exists(carpeta):
            try: shutil.rmtree(carpeta)
            except: pass
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


@bp.route('/residentes/<num_control>', methods=['PUT'])
def update_residente(num_control):
    data = request.get_json()
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute("SELECT num_control FROM residentes WHERE num_control = %s", (num_control,))
        if not cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "Residente no encontrado"}), 404

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
            anio,
            fecha_inicio,
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


@bp.route('/residentes/<num_control>', methods=['DELETE'])
def delete_residente(num_control):
    eliminar_archivos = request.args.get('eliminar_archivos', 'false').lower() == 'true'
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute("SELECT ruta_archivos FROM residentes WHERE num_control=%s", (num_control,))
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return jsonify({"error": "Residente no encontrado"}), 404

        ruta = row['ruta_archivos']
        cursor.execute("DELETE FROM documentos WHERE num_control=%s", (num_control,))
        cursor.execute("DELETE FROM residentes WHERE num_control=%s", (num_control,))
        conn.commit()

        if eliminar_archivos and ruta and os.path.exists(ruta):
            shutil.rmtree(ruta, ignore_errors=True)

        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


@bp.route('/residentes/<num_control>/documentos', methods=['POST'])
def upload_documento(num_control):
    tipo_doc_id = request.form.get('tipo_doc_id')
    archivo     = request.files.get('archivo')
    if not archivo or not tipo_doc_id:
        return jsonify({"error": "Archivo y tipo requeridos"}), 422

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()

        cursor.execute("SELECT ruta_archivos FROM residentes WHERE num_control=%s", (num_control,))
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return jsonify({"error": "Residente no encontrado"}), 404

        ruta_relativa_dir = row['ruta_archivos'] or ''
        nombre = archivo.filename
        tamanio_kb = 0

        # Resolve absolute path from ruta_relativa
        ruta_base = _get_ruta_base(cursor)
        if ruta_relativa_dir:
            carpeta_abs = os.path.join(ruta_base, ruta_relativa_dir)
        else:
            carpeta_abs = ''

        if carpeta_abs and os.path.exists(carpeta_abs):
            ruta_archivo_abs = os.path.join(carpeta_abs, nombre)
            archivo.save(ruta_archivo_abs)
            tamanio_kb = round(os.path.getsize(ruta_archivo_abs) / 1024, 2)
            ruta_archivo = os.path.join(ruta_relativa_dir, nombre).replace('\\', '/')
        else:
            ruta_archivo = nombre

        cursor.execute("""
            INSERT INTO documentos (num_control, tipo_doc_id, nombre_archivo, ruta_relativa, tamanio_kb)
            VALUES (%s, %s, %s, %s, %s)
        """, (num_control, tipo_doc_id, nombre, ruta_archivo, tamanio_kb))

        conn.commit()
        return jsonify({"ok": True, "id": cursor.lastrowid}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


@bp.route('/documentos/<int:doc_id>', methods=['DELETE'])
def delete_documento(doc_id):
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM documentos WHERE id=%s", (doc_id,))
        if not cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "Documento no encontrado"}), 404
        cursor.execute("DELETE FROM documentos WHERE id=%s", (doc_id,))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()
