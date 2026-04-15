import mysql.connector
import os, sys, logging

if getattr(sys, 'frozen', False):
    log_path = os.path.join(os.path.dirname(sys.executable), 'residencias_error.log')
else:
    log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'residencias_error.log')

logging.basicConfig(filename=log_path, level=logging.DEBUG,
    format='%(asctime)s %(levelname)s %(message)s')

# ─── CONFIGURACIÓN DE BASE DE DATOS ──────────────────────────────────────────
# Copia este archivo como database.py y rellena con tus datos reales.
# NUNCA subas database.py al repositorio (está en .gitignore).
# ─────────────────────────────────────────────────────────────────────────────

DB_CONFIG = {
    'host':     'localhost',
    'port':     3306,
    'user':     'TU_USUARIO_MYSQL',       # ejemplo: 'root' o 'hitos_app'
    'password': 'TU_CONTRASEÑA_MYSQL',    # tu contraseña real aquí
    'database': 'residencias_tecnm_madero',
    'use_pure': True
}

def get_connection():
    try:
        logging.debug(f"Conectando: {DB_CONFIG['host']}:{DB_CONFIG['port']} db={DB_CONFIG['database']}")
        conn = mysql.connector.connect(**DB_CONFIG)
        logging.debug("Conexion exitosa")
        return conn
    except mysql.connector.Error as err:
        logging.error(f"Error de conexion: {err}")
        raise Exception(f"Error de conexion: {err}")
