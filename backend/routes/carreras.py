from flask import Blueprint, jsonify, request
from database import get_connection

bp = Blueprint('carreras', __name__, url_prefix='/api')


@bp.route('/carreras/habilitadas', methods=['GET'])
def get_carreras_habilitadas():
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, nombre, habilitada, fecha_registro, fecha_modificacion
            FROM carreras
            ORDER BY nombre
        """)
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/carreras', methods=['POST'])
def create_carrera():
    data = request.get_json()
    nombre = (data.get('nombre') or '').strip()
    if not nombre:
        return jsonify({"error": "Nombre requerido"}), 422
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM carreras WHERE nombre = %s", (nombre,))
        if cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "La carrera ya existe"}), 409
        cursor.execute(
            "INSERT INTO carreras (nombre, habilitada) VALUES (%s, %s)",
            (nombre, data.get('habilitada', True))
        )
        nuevo_id = cursor.lastrowid
        conn.commit()
        return jsonify({"ok": True, "id": nuevo_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/carreras/<int:id>', methods=['PUT'])
def update_carrera(id):
    data = request.get_json()
    nombre = (data.get('nombre') or '').strip()
    if not nombre:
        return jsonify({"error": "Nombre requerido"}), 422
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("SELECT id FROM carreras WHERE id = %s", (id,))
        if not cursor.fetchone():
            conn.rollback()
            return jsonify({"error": "Carrera no encontrada"}), 404
        cursor.execute(
            "UPDATE carreras SET nombre=%s, habilitada=%s, fecha_modificacion=NOW() WHERE id=%s",
            (nombre, data.get('habilitada', True), id)
        )
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/especialidades/<int:carrera_id>', methods=['GET'])
def get_especialidades(carrera_id):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, nombre FROM especialidades
            WHERE carrera_id = %s AND habilitada = TRUE
            ORDER BY nombre
        """, (carrera_id,))
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/tipos_documento', methods=['GET'])
def get_tipos_documento():
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, clave, descripcion FROM tipos_documento ORDER BY id")
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
