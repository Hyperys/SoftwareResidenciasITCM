from flask import Blueprint, jsonify, request
from database import get_connection

bp = Blueprint('empresas', __name__, url_prefix='/api/empresas')


@bp.route('', methods=['GET'])
def get_empresas():
    search    = request.args.get('search', '').strip()
    giro   = request.args.get('giro', '').strip() 
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT id, rfc, nombre, giro, correo, telefono, extension,
                   direccion, colonia, codigo_postal, pais, estado_geo,
                   ciudad, habilitada, fecha_registro, fecha_modificacion
            FROM empresas WHERE 1=1
        """
        params = []
        if search:
            query += " AND (nombre LIKE %s OR rfc LIKE %s)"
            params += [f"%{search}%", f"%{search}%"]
        if giro:
            query += " AND giro = %s"
            params.append(giro)
        query += " ORDER BY nombre"
        cursor.execute(query, params)
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/<int:id>', methods=['GET'])
def get_empresa(id):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, rfc, nombre, giro, correo, telefono, extension,
                   direccion, colonia, codigo_postal, pais, estado_geo,
                   ciudad, habilitada, fecha_registro, fecha_modificacion
            FROM empresas WHERE id = %s
        """, (id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Empresa no encontrada"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('', methods=['POST'])
def create_empresa():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM empresas WHERE rfc = %s", (data.get('rfc'),))
        if cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "El RFC ya está registrado"}), 409
        cursor.execute("""
            INSERT INTO empresas (rfc, nombre, giro, correo, telefono, extension,
                                  direccion, colonia, codigo_postal, pais,
                                  estado_geo, ciudad, habilitada)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data.get('rfc'), data.get('nombre'), data.get('giro'),
            data.get('correo'), data.get('telefono'),
            data.get('extension') or None, data.get('direccion'),
            data.get('colonia'), data.get('codigo_postal'),
            data.get('pais'), data.get('estado_geo'), data.get('ciudad'),
            data.get('habilitada', True)
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
def update_empresa(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM empresas WHERE id = %s", (id,))
        if not cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "Empresa no encontrada"}), 404
        cursor.execute("""
            UPDATE empresas
            SET rfc=%s, nombre=%s, giro=%s, correo=%s, telefono=%s,
                extension=%s, direccion=%s, colonia=%s, codigo_postal=%s,
                pais=%s, estado_geo=%s, ciudad=%s, habilitada=%s,
                fecha_modificacion=NOW()
            WHERE id=%s
        """, (
            data.get('rfc'), data.get('nombre'), data.get('giro'),
            data.get('correo'), data.get('telefono'),
            data.get('extension') or None, data.get('direccion'),
            data.get('colonia'), data.get('codigo_postal'),
            data.get('pais'), data.get('estado_geo'), data.get('ciudad'),
            data.get('habilitada', True), id
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
def delete_empresa(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM empresas WHERE id = %s", (id,))
        if not cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "Empresa no encontrada"}), 404
        cursor.execute("SELECT COUNT(*) AS total FROM asesores WHERE empresa_id=%s", (id,))
        if cursor.fetchone()['total'] > 0:
            conn.rollback()
            return jsonify({"error": "No se puede eliminar: tiene asesores asociados"}), 409
        cursor.execute("SELECT COUNT(*) AS total FROM residentes WHERE empresa_id=%s", (id,))
        if cursor.fetchone()['total'] > 0:
            conn.rollback()
            return jsonify({"error": "No se puede eliminar: tiene residentes asociados"}), 409
        cursor.execute("DELETE FROM empresas WHERE id=%s", (id,))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
