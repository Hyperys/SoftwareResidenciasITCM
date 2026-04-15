import urllib.request, json, urllib.error

BASE = 'http://127.0.0.1:5000/api'

def req(path, method, body=None):
    data = json.dumps(body).encode() if body else None
    rq = urllib.request.Request(f'{BASE}{path}', data=data, method=method,
                                headers={'Content-Type': 'application/json'} if data else {})
    try:
        r = urllib.request.urlopen(rq)
        return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# Test POST
status, data = req('/proyectos', 'POST', {
    'num_control': '99990002',
    'nombres': 'Test',
    'apellidos': 'Proyecto',
    'sexo': 'H',
    'correo': 'test@test.com',
    'nombre_proyecto': 'Proyecto de Prueba',
    'semestre': 'ENE-JUN',
    'fecha_inicio': '2024-03-01',
    'estado': 'activo'
})
print(f'POST => {status}')
print(json.dumps(data, indent=2, default=str))
