-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS residencias_tecnm_madero;

-- 2. Usar base de datos
USE residencias_tecnm_madero;

-- 3. TABLAS (Orden por dependencias)

-- Tabla: configuracion
CREATE TABLE configuracion (
    clave VARCHAR(60) PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion VARCHAR(200) NULL
) ENGINE=InnoDB;

-- Tabla: tipos_documento
CREATE TABLE tipos_documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(40) NOT NULL UNIQUE,
    descripcion VARCHAR(200) NOT NULL
) ENGINE=InnoDB;

-- Tabla: carreras
CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    habilitada BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NULL
) ENGINE=InnoDB;

-- Tabla: especialidades
CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    habilitada BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uk_carrera_especialidad (carrera_id, nombre)
) ENGINE=InnoDB;

-- Tabla: empresas
CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfc VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    giro ENUM('publica','privada','industrial','servicios','otro') NOT NULL,
    correo VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    extension VARCHAR(10) NULL,
    direccion VARCHAR(300) NOT NULL,
    colonia VARCHAR(100) NOT NULL,
    codigo_postal CHAR(5) NOT NULL,
    pais VARCHAR(60) NOT NULL,
    estado_geo VARCHAR(60) NOT NULL,
    ciudad VARCHAR(60) NOT NULL,
    habilitada BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NULL,
    INDEX idx_empresa_habilitada (habilitada)
) ENGINE=InnoDB;

-- Tabla: asesores
CREATE TABLE asesores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo ENUM('interno','externo') NOT NULL,
    departamento VARCHAR(100) NULL,
    puesto VARCHAR(100) NULL,
    correo VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    extension VARCHAR(10) NULL,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_asesor_tipo (tipo)
) ENGINE=InnoDB;

-- Tabla: residentes
CREATE TABLE residentes (
    num_control VARCHAR(10) PRIMARY KEY,
    carrera_id INT NOT NULL,
    especialidad_id INT NULL,
    empresa_id INT NULL,
    asesor_interno_id INT NULL,
    asesor_externo_id INT NULL,
    revisor_id INT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    sexo ENUM('H','M','otro') NOT NULL,
    correo VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    nombre_proyecto VARCHAR(200) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    horario VARCHAR(30) NOT NULL,
    semestre ENUM('ENE-JUN','AGO-DIC') NOT NULL,
    anio YEAR NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_cierre DATE NULL,
    observaciones TEXT NULL,
    estado ENUM('activo','cerrado') NOT NULL DEFAULT 'activo',
    es_expediente TINYINT(1) NOT NULL DEFAULT 0,
    estado_hito1 ENUM('pendiente','en_progreso','completado') NOT NULL DEFAULT 'pendiente',
    estado_hito2 ENUM('pendiente','en_progreso','completado') NOT NULL DEFAULT 'pendiente',
    estado_hito3 ENUM('pendiente','en_progreso','completado') NOT NULL DEFAULT 'pendiente',
    ruta_archivos VARCHAR(300) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (asesor_interno_id) REFERENCES asesores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (asesor_externo_id) REFERENCES asesores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (revisor_id) REFERENCES asesores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_residente_estado (estado),
    INDEX idx_residente_semestre (semestre),
    INDEX idx_residente_anio (anio),
    INDEX idx_residente_carrera (carrera_id),
    INDEX idx_residente_es_expediente (es_expediente)
) ENGINE=InnoDB;

-- Tabla: documentos
CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    num_control VARCHAR(10) NOT NULL,
    tipo_doc_id INT NOT NULL,
    nombre_archivo VARCHAR(200) NOT NULL,
    ruta_relativa VARCHAR(300) NOT NULL,
    tamanio_kb INT NULL,
    observaciones TEXT NULL,
    fecha_subida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (num_control) REFERENCES residentes(num_control) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (tipo_doc_id) REFERENCES tipos_documento(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_documento_num_control (num_control)
) ENGINE=InnoDB;

-- Tabla: backups_log
CREATE TABLE backups_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_backup DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ruta_destino VARCHAR(300) NOT NULL,
    tipo ENUM('manual','automatico') NOT NULL,
    tamanio_mb DECIMAL(10,2) NULL,
    exitoso BOOLEAN NOT NULL DEFAULT TRUE,
    notas TEXT NULL
) ENGINE=InnoDB;

-- 4. ÍNDICES ADICIONALES

-- Los índices principales ya se definieron en las sentencias CREATE TABLE para mayor claridad.
-- Aquí se pueden agregar otros si fueran necesarios en el futuro.


-- 5. CATÁLOGO FIJO

-- Configuracion
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('ruta_archivos', 'C:/Residencias/', 'Ruta base para almacenamiento de expedientes'),
('ruta_backup_default', 'C:/Residencias/Backups/', 'Ruta por defecto para backups manuales');

-- Tipos de Documento
INSERT INTO tipos_documento (clave, descripcion) VALUES
('solicitud_residencia', 'Solicitud de residencia'),
('carta_presentacion', 'Carta de presentación'),
('constancia_ss', 'Constancia de servicio social'),
('anteproyecto', 'Anteproyecto'),
('autorizacion_anteproyecto', 'Autorización de anteproyecto'),
('asignacion_asesor', 'Asignación de asesor'),
('reporte_1', '1er reporte de asesoría'),
('reporte_2', '2do reporte de asesoría'),
('reporte_3', '3er reporte de asesoría'),
('evaluacion_final', 'Evaluación final'),
('reporte_final', 'Reporte final'),
('reporte_final_firmas', 'Práctica del reporte final con firmas'),
('carta_liberacion', 'Carta de liberación o terminación'),
('otro', 'Otro');


-- 6. PRUEBA

-- Carreras
INSERT INTO carreras (nombre) VALUES 
('Ingeniería en Sistemas Computacionales'),
('Ingeniería Industrial');

-- Especialidades (asumiendo IDs 1 y 2 para las carreras anteriores)
INSERT INTO especialidades (carrera_id, nombre) VALUES
(1, 'Desarrollo de Software'),
(1, 'Redes y Seguridad'),
(2, 'Manufactura Esbelta'),
(2, 'Logística');

-- Empresas
INSERT INTO empresas (rfc, nombre, giro, correo, telefono, direccion, colonia, codigo_postal, pais, estado_geo, ciudad) VALUES
('PEMX123456789', 'Petróleos Mexicanos', 'industrial', 'contacto@pemex.com', '8331234567', 'Av. Tamaulipas S/N', 'Refinería', '89500', 'México', 'Tamaulipas', 'Ciudad Madero'),
('SOFT987654321', 'SoftTech Solutions', 'servicios', 'hr@softtech.mx', '8339876543', 'Calle 10 #200', 'Centro', '89000', 'México', 'Tamaulipas', 'Tampico');

-- Asesores
-- Asesor Interno 1
INSERT INTO asesores (nombres, apellidos, tipo, departamento, correo, telefono, puesto) VALUES
('Juan', 'Pérez López', 'interno', 'Sistemas y Computación', 'juan.perez@madero.tecnm.mx', '8331112233', 'Docente');

-- Asesor Interno 2
INSERT INTO asesores (nombres, apellidos, tipo, departamento, correo, telefono, puesto) VALUES
('Maria', 'González Ruiz', 'interno', 'Industrial', 'maria.gonzalez@madero.tecnm.mx', '8334445566', 'Jefa de Docencia');

-- Asesor Externo (ligado a empresa 1 - PEMEX)
INSERT INTO asesores (empresa_id, nombres, apellidos, tipo, puesto, correo, telefono) VALUES
(1, 'Carlos', 'Slim Helú', 'externo', 'Gerente de Planta', 'carlos.slim@pemex.com', '8337778899');

-- Residentes
-- Residente 1: Expediente completo
INSERT INTO residentes (
    num_control, carrera_id, especialidad_id, empresa_id, asesor_interno_id, asesor_externo_id, revisor_id,
    nombres, apellidos, sexo, correo, telefono, nombre_proyecto, departamento, horario, semestre, anio, fecha_inicio, estado
) VALUES (
    '21040001', 
    1, -- Ing. Sistemas
    1, -- Desarrollo Software
    2, -- SoftTech
    1, -- Juan Pérez (Interno)
    NULL, -- (Sin externo asignado aun en este ejemplo, o podría ser NULL)
    2, -- Maria González (Revisor)
    'Ana', 'Torres Martínez', 'M', 'anatorres@email.com', '8335551122',
    'Sistema de Gestión de Almacenes Web', 'Desarrollo', '08:00 - 14:00', 'ENE-JUN', 2024, '2024-01-15', 'activo'
);

-- Residente 2: Expediente completo con externo
INSERT INTO residentes (
    num_control, carrera_id, especialidad_id, empresa_id, asesor_interno_id, asesor_externo_id, revisor_id,
    nombres, apellidos, sexo, correo, telefono, nombre_proyecto, departamento, horario, semestre, anio, fecha_inicio, estado
) VALUES (
    '21040002', 
    2, -- Ing. Industrial
    3, -- Manufactura
    1, -- PEMEX
    2, -- Maria González (Interno)
    3, -- Carlos Slim (Externo)
    1, -- Juan Pérez (Revisor)
    'Luis', 'Ramírez Solís', 'H', 'luisramirez@email.com', '8336667788',
    'Optimización de Líneas de Producción', 'Producción', '07:00 - 15:00', 'ENE-JUN', 2024, '2024-01-20', 'activo'
);

-- Residente 3: Expediente inicial (campos opcionales NULL)
INSERT INTO residentes (
    num_control, carrera_id, especialidad_id, empresa_id, asesor_interno_id, asesor_externo_id, revisor_id,
    nombres, apellidos, sexo, correo, telefono, nombre_proyecto, departamento, horario, semestre, anio, fecha_inicio, estado
) VALUES (
    '21040003',
    1, -- Ing. Sistemas
    NULL, NULL, NULL, NULL, NULL,
    'Pedro', 'Infante Cruz', 'H', 'pedro.infante@email.com', '8339990000',
    'Pendiente de Asignación', 'Pendiente', 'Pendiente', 'AGO-DIC', 2024, '2024-08-20', 'activo'
);

-- Marcar como expedientes iniciales de prueba
UPDATE residentes
SET es_expediente = 1
WHERE num_control IN ('21040001', '21040002', '21040003');

-- Documentos
-- Documentos para Residente 1
INSERT INTO documentos (num_control, tipo_doc_id, nombre_archivo, ruta_relativa, tamanio_kb) VALUES
('21040001', 1, 'Solicitud_Residencia_21040001.pdf', '2024/21040001/solicitud.pdf', 150),
('21040001', 4, 'Anteproyecto_21040001.pdf', '2024/21040001/anteproyecto.pdf', 2048),
('21040001', 6, 'Asignacion_Asesor_21040001.pdf', '2024/21040001/asignacion.pdf', 300);

-- Backups Log (ejemplo)
INSERT INTO backups_log (ruta_destino, tipo, tamanio_mb, exitoso, notas) VALUES
('C:/Residencias/Backups/backup_20240213_1200.sql', 'manual', 5.24, TRUE, 'Backup inicial antes de carga masiva');

SELECT * FROM configuracion;

-- backups actualizado a la ruta--
UPDATE configuracion 
SET valor = 'C:\\Users\\Max\\.vscode\\SoftwareResidencias\\expedientespdf'
WHERE clave = 'ruta_archivos';

UPDATE configuracion 
SET valor = 'C:\\Users\\Max\\.vscode\\SoftwareResidencias\\backup'
WHERE clave = 'ruta_backup_default';

SELECT * FROM empresas;