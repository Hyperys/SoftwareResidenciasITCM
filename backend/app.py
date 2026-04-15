import os, sys
from flask import Flask, jsonify
from routes.carreras   import bp as carreras_bp
from routes.empresas   import bp as empresas_bp
from routes.asesores   import bp as asesores_bp
from routes.residentes import bp as residentes_bp
from routes.proyectos  import bp as proyectos_bp
from routes.backup     import bp_backup
from database import get_connection

# Detectar si corre como .exe de PyInstaller o como script normal
if getattr(sys, 'frozen', False):
    # Empaquetado — los archivos están en sys._MEIPASS
    BASE_DIR   = sys._MEIPASS
    STATIC_DIR = os.path.join(BASE_DIR, 'proyecto', 'dist')
else:
    # Desarrollo — ruta normal relativa a app.py
    BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIR = os.path.join(BASE_DIR, '..', 'proyecto', 'dist')

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')

app.register_blueprint(carreras_bp)
app.register_blueprint(empresas_bp)
app.register_blueprint(asesores_bp)
app.register_blueprint(residentes_bp)
app.register_blueprint(proyectos_bp)
app.register_blueprint(bp_backup)


@app.route('/api/dashboard/stats')
def dashboard_stats():
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) AS total FROM residentes")
        total = cursor.fetchone()['total']
        cursor.execute("SELECT COUNT(*) AS c FROM residentes WHERE estado='cerrado'")
        cerrados = cursor.fetchone()['c']
        cursor.execute("SELECT COUNT(*) AS e FROM empresas")
        empresas = cursor.fetchone()['e']
        return jsonify({
            "total_residentes": total,
            "cerrados":         cerrados,
            "activos":          total - cerrados,
            "total_empresas":   empresas
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'):
        return jsonify({"error": "Not found"}), 404
    full = os.path.join(app.static_folder, path)
    if path and os.path.exists(full):
        return app.send_static_file(path)
    return app.send_static_file('index.html')


@app.errorhandler(404)
def not_found(e):
    try:
        return app.send_static_file('index.html')
    except Exception:
        return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=5000)
