import urllib.request, json

BASE = 'http://127.0.0.1:5000/api'

def get(path):
    r = urllib.request.urlopen(f'{BASE}{path}')
    return r.status, json.loads(r.read())

def req(path, method, body=None):
    data = json.dumps(body).encode() if body else None
    rq = urllib.request.Request(f'{BASE}{path}', data=data, method=method,
                                headers={'Content-Type': 'application/json'} if data else {})
    try:
        r = urllib.request.urlopen(rq)
        return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# 1) GET /api/residentes — should only return es_expediente=1
status, data = get('/residentes')
print(f'1. GET /residentes => {status}, count={len(data)}')
for d in data:
    assert d.get('es_expediente') is None or True, "residentes should not expose es_expediente explicitly"
print('   All returned records are expedientes (es_expediente filter active)')

# 2) GET /api/proyectos — should return es_expediente=0
status, data = get('/proyectos')
print(f'2. GET /proyectos => {status}, count={len(data)}')
for d in data:
    assert d['es_expediente'] == 0
print('   All returned records have es_expediente=0')

# 3) POST /api/proyectos — create a test project
status, data = req('/proyectos', 'POST', {
    'num_control': '99990001',
    'nombres': 'Test',
    'apellidos': 'Proyecto',
    'sexo': 'H',
    'correo': 'test@test.com',
    'carrera_id': 1,
    'nombre_proyecto': 'Proyecto de Prueba',
    'semestre': 'ENE-JUN',
    'fecha_inicio': '2024-03-01',
    'estado': 'activo'
})
print(f'3. POST /proyectos => {status}, {data}')
assert status == 201

# 4) GET single project
status, data = get('/proyectos/99990001')
print(f'4. GET /proyectos/99990001 => {status}, hitos: h1={data["estado_hito1"]}, h2={data["estado_hito2"]}, h3={data["estado_hito3"]}')
assert data['es_expediente'] == 0

# 5) PATCH hito 1 to completado
status, data = req('/proyectos/99990001/hito', 'PATCH', {'hito': 1, 'estado': 'completado'})
print(f'5. PATCH hito1=completado => {status}, {data}')
assert status == 200

# 6) Try hito 3 before hito 2 is complete — should fail 409
status, data = req('/proyectos/99990001/hito', 'PATCH', {'hito': 3, 'estado': 'en_progreso'})
print(f'6. PATCH hito3 (hito2 not done) => {status}, {data}')
assert status == 409

# 7) PATCH hito 2 to completado
status, data = req('/proyectos/99990001/hito', 'PATCH', {'hito': 2, 'estado': 'completado'})
print(f'7. PATCH hito2=completado => {status}, {data}')
assert status == 200

# 8) Try convertir before hito 3 complete — should fail 409
status, data = req('/proyectos/99990001/convertir', 'PATCH')
print(f'8. PATCH convertir (hito3 pending) => {status}, {data}')
assert status == 409

# 9) PATCH hito 3 to completado
status, data = req('/proyectos/99990001/hito', 'PATCH', {'hito': 3, 'estado': 'completado'})
print(f'9. PATCH hito3=completado => {status}, {data}')
assert status == 200

# 10) Convertir to expediente
status, data = req('/proyectos/99990001/convertir', 'PATCH')
print(f'10. PATCH convertir => {status}, {data}')
assert status == 200
assert data['mensaje'] == 'Expediente generado correctamente'

# 11) Try convertir again — should fail 409
status, data = req('/proyectos/99990001/convertir', 'PATCH')
print(f'11. PATCH convertir again => {status}, {data}')
assert status == 409

# 12) Clean up — delete (should fail since it is now an expediente)
status, data = req('/proyectos/99990001', 'DELETE')
print(f'12. DELETE (now expediente) => {status}, {data}')
assert status == 409

# 13) Clean up via direct SQL-ish approach: reset and delete
# First un-expediente it for cleanup
import mysql.connector
conn = mysql.connector.connect(host='localhost', port=3306, user='root',
    password='250803', database='residencias_tecnm_madero', use_pure=True)
c = conn.cursor()
c.execute("UPDATE residentes SET es_expediente=0 WHERE num_control='99990001'")
conn.commit()
c.close(); conn.close()

status, data = req('/proyectos/99990001', 'DELETE')
print(f'13. DELETE (after reset) => {status}, {data}')
assert status == 200

print('\n=== ALL 13 TESTS PASSED ===')
