from flask import Blueprint, jsonify, request
from database import get_connection

bp = Blueprint('asesores', __name__, url_prefix='/api/asesores')


@bp.route('', methods=['GET'])
def get_asesores():
    search = request.args.get('search', '').strip()
    tipo   = request.args.get('tipo', '').strip()
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT a.id, a.nombres, a.apellidos, a.tipo,
                   a.departamento, a.puesto, a.correo,
                   a.telefono, a.extension, a.habilitado,
                   a.empresa_id, e.nombre AS empresa_nombre,
                   a.fecha_registro, a.fecha_modificacion
            FROM asesores a
            LEFT JOIN empresas e ON a.empresa_id = e.id
            WHERE 1=1
        """
        params = []
        if search:
            query += " AND CONCAT(a.nombres,' ',a.apellidos) LIKE %s"
            params.append(f"%{search}%")
        if tipo:
            query += " AND a.tipo = %s"
            params.append(tipo)
        query += " ORDER BY a.apellidos, a.nombres"
        cursor.execute(query, params)
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/<int:id>', methods=['GET'])
def get_asesor(id):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id, a.nombres, a.apellidos, a.tipo,
                   a.departamento, a.puesto, a.correo,
                   a.telefono, a.extension, a.habilitado,
                   a.empresa_id, e.nombre AS empresa_nombre,
                   a.fecha_registro, a.fecha_modificacion
            FROM asesores a
            LEFT JOIN empresas e ON a.empresa_id = e.id
            WHERE a.id = %s
        """, (id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Asesor no encontrado"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('', methods=['POST'])
def create_asesor():
    data = request.get_json()
    empresa_id = None if data.get('tipo') == 'interno' else data.get('empresa_id') or None
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        # Verificar correo duplicado dentro de la transacción
        cursor.execute("SELECT id FROM asesores WHERE correo = %s", (data.get('correo'),))
        if cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "El correo ya está registrado"}), 409
        cursor.execute("""
            INSERT INTO asesores
                (empresa_id, nombres, apellidos, tipo, departamento,
                 puesto, correo, telefono, extension, habilitado)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            empresa_id,
            data.get('nombres'), data.get('apellidos'), data.get('tipo'),
            data.get('departamento') or None, data.get('puesto') or None,
            data.get('correo'), data.get('telefono'),
            data.get('extension') or None, data.get('habilitado', True)
        ))
        nuevo_id = cursor.lastrowid
        conn.commit()
        return jsonify({"ok": True, "id": nuevo_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/<int:id>', methods=['PUT'])
def update_asesor(id):
    data = request.get_json()
    empresa_id = None if data.get('tipo') == 'interno' else data.get('empresa_id') or None
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM asesores WHERE id = %s", (id,))
        if not cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "Asesor no encontrado"}), 404
        cursor.execute("""
            UPDATE asesores
            SET empresa_id=%s, nombres=%s, apellidos=%s, tipo=%s,
                departamento=%s, puesto=%s, correo=%s, telefono=%s,
                extension=%s, habilitado=%s, fecha_modificacion=NOW()
            WHERE id=%s
        """, (
            empresa_id,
            data.get('nombres'), data.get('apellidos'), data.get('tipo'),
            data.get('departamento') or None, data.get('puesto') or None,
            data.get('correo'), data.get('telefono'),
            data.get('extension') or None, data.get('habilitado', True),
            id
        ))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/<int:id>', methods=['DELETE'])
def delete_asesor(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM asesores WHERE id = %s", (id,))
        if not cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "Asesor no encontrado"}), 404
        cursor.execute("""
            SELECT COUNT(*) AS total FROM residentes
            WHERE asesor_interno_id=%s OR asesor_externo_id=%s OR revisor_id=%s
        """, (id, id, id))
        if cursor.fetchone()['total'] > 0:
            conn.rollback()
            return jsonify({"error": "No se puede eliminar: tiene expedientes asignados"}), 409
        cursor.execute("DELETE FROM asesores WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
