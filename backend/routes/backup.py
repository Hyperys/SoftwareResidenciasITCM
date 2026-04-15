import os, shutil, subprocess
from datetime import datetime
from flask import Blueprint, jsonify
from database import get_connection

bp_backup = Blueprint('backup', __name__, url_prefix='/api')

# Ruta base del proyecto = carpeta padre de donde está app.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@bp_backup.route('/backup', methods=['POST'])
def hacer_backup():
    ahora      = datetime.now().strftime('%Y-%m-%d_%H-%M')
    backup_dir = os.path.join(BASE_DIR, 'backup', f'backup_{ahora}')
    os.makedirs(backup_dir, exist_ok=True)

    errores = []

    # 1. Dump MySQL
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT valor FROM configuracion WHERE clave='db_host' LIMIT 1")
        r = cursor.fetchone(); host = r['valor'] if r else '127.0.0.1'
        cursor.execute("SELECT valor FROM configuracion WHERE clave='db_user' LIMIT 1")
        r = cursor.fetchone(); user = r['valor'] if r else 'root'
        cursor.execute("SELECT valor FROM configuracion WHERE clave='db_pass' LIMIT 1")
        r = cursor.fetchone(); pwd = r['valor'] if r else '250803'
        cursor.execute("SELECT valor FROM configuracion WHERE clave='db_name' LIMIT 1")
        r = cursor.fetchone(); db = r['valor'] if r else 'residencias'
        cursor.close(); conn.close()
    except Exception as e:
        errores.append(f"Config BD: {e}")
        host, user, pwd, db = '127.0.0.1', 'root', '250803', 'residencias'

    dump_path = os.path.join(backup_dir, f'{db}_dump.sql')
    try:
        result = subprocess.run(
            [ r'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe', '-h', host, '-u', user, f'-p{pwd}', db],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode == 0:
            with open(dump_path, 'w', encoding='utf-8') as f:
                f.write(result.stdout)
        else:
            errores.append(f"mysqldump (code {result.returncode}): {result.stderr[:500]}")
            errores.append(f"stdout: {result.stdout[:200]}")
    except FileNotFoundError:
        errores.append("mysqldump no encontrado en PATH")
    except Exception as e:
        errores.append(f"Dump error: {e}")

    # 2. Copiar expedientespdf/
    pdf_src = os.path.join(BASE_DIR, 'expedientespdf')
    pdf_dst = os.path.join(backup_dir, 'expedientespdf')
    if os.path.exists(pdf_src):
        try:
            shutil.copytree(pdf_src, pdf_dst)
        except Exception as e:
            errores.append(f"PDFs: {e}")
    else:
        errores.append("Carpeta expedientespdf no encontrada (se omite)")

    return jsonify({
        "ok": True,
        "ruta": backup_dir,
        "fecha": ahora,
        "errores": errores
    }), 200


@bp_backup.route('/backup/ruta', methods=['GET'])
def get_ruta_backup():
    backup_dir = os.path.join(BASE_DIR, 'backup')
    pdf_dir    = os.path.join(BASE_DIR, 'expedientespdf')
    return jsonify({
        "backup_dir":  backup_dir,
        "pdf_dir":     pdf_dir,
        "base_dir":    BASE_DIR
    })
