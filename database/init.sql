-- Crear tipos enumerados
CREATE TYPE estado_maquina AS ENUM (
    'Fuera de servicio',
    'Mantenimiento',
    'Funcionando'
);

CREATE TYPE estado_solicitud AS ENUM (
    'pendiente',
    'tecnico_asignado',
    'prefinalizada',
    'finalizada'
);

CREATE TYPE gravedad_falla AS ENUM (
    'leve',
    'moderada',
    'grave'
);

CREATE TYPE tipo_rol AS ENUM (
    'Administrador',
    'Tecnico',
    'Cliente',
    'SuperAdmin'
);

-- Tabla de roles
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre tipo_rol NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSONB,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre_usuario TEXT NOT NULL UNIQUE,
    contraseña TEXT NOT NULL,
    rol tipo_rol NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    identificador_unico TEXT UNIQUE,
    activo BOOLEAN DEFAULT true,
    codigo_login TEXT
);

-- Tabla de máquinas
CREATE TABLE maquinas (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    estado estado_maquina NOT NULL,
    ubicacion TEXT NOT NULL,
    fecha_compra DATE,
    fecha_garantia DATE
);

-- Tabla de relación máquinas-cliente
CREATE TABLE maquinas_cliente (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT,
    maquina_id BIGINT,
    estado TEXT NOT NULL,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE proveedores (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    informacion_contacto TEXT,
    direccion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de repuestos
CREATE TABLE repuestos (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    proveedor_id BIGINT,
    cantidad INTEGER NOT NULL,
    ubicacion TEXT,
    estado TEXT NOT NULL
);

-- Tabla de recibos
CREATE TABLE recibos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT,
    maquina_id BIGINT,
    fecha_recibo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ingreso NUMERIC DEFAULT 0,
    egreso NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lote_recibo BIGINT NOT NULL,
    CONSTRAINT chk_ingreso_no_negativo CHECK (ingreso >= 0),
    CONSTRAINT chk_egreso_no_negativo CHECK (egreso >= 0)
);

-- Tabla de lotes de recibos
CREATE TABLE lotes_recibos (
    id BIGINT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    fecha_recibo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ingreso NUMERIC DEFAULT 0,
    egreso NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    parte_empresa NUMERIC DEFAULT 0,
    parte_cliente NUMERIC DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cantidad_recibos INTEGER DEFAULT 0,
    CONSTRAINT chk_lotes_ingreso_no_negativo CHECK (ingreso >= 0),
    CONSTRAINT chk_lotes_egreso_no_negativo CHECK (egreso >= 0),
    CONSTRAINT chk_lotes_cantidad_recibos_no_negativo CHECK (cantidad_recibos >= 0)
);

-- Tabla de solicitudes de reparación
CREATE TABLE solicitudes_reparacion (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    maquina_id BIGINT NOT NULL,
    descripcion_falla TEXT NOT NULL,
    gravedad gravedad_falla NOT NULL,
    estado estado_solicitud DEFAULT 'pendiente',
    tecnico_asignado_id BIGINT,
    fecha_hora_reparacion TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observaciones_tecnico TEXT,
    fecha_reparacion_terminada TIMESTAMP WITH TIME ZONE,
    fecha_finalizada TIMESTAMP WITH TIME ZONE
);

-- Tabla de repuestos utilizados
CREATE TABLE repuestos_utilizados (
    id BIGSERIAL PRIMARY KEY,
    solicitud_id BIGINT NOT NULL,
    repuesto_id BIGINT NOT NULL,
    cantidad_utilizada INTEGER NOT NULL,
    fecha_uso TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    relacion_id BIGINT
);

-- Vistas
CREATE VIEW historial_reparaciones AS
SELECT 
    sr.id AS solicitud_id,
    m.nombre AS maquina_nombre,
    m.tipo AS maquina_tipo,
    c.nombre_usuario AS cliente_nombre,
    c.correo AS cliente_correo,
    t.nombre_usuario AS tecnico_nombre,
    t.correo AS tecnico_correo,
    sr.descripcion_falla,
    sr.gravedad,
    sr.estado,
    sr.fecha_hora_reparacion,
    sr.fecha_creacion,
    sr.fecha_reparacion_terminada,
    sr.fecha_finalizada,
    sr.observaciones_tecnico,
    COUNT(ru.id) AS cantidad_repuestos_utilizados,
    SUM(ru.cantidad_utilizada) AS total_repuestos_utilizados
FROM solicitudes_reparacion sr
JOIN maquinas m ON sr.maquina_id = m.id
JOIN usuarios c ON sr.cliente_id = c.id
LEFT JOIN usuarios t ON sr.tecnico_asignado_id = t.id
LEFT JOIN repuestos_utilizados ru ON sr.id = ru.solicitud_id
GROUP BY sr.id, m.nombre, m.tipo, c.nombre_usuario, c.correo, 
         t.nombre_usuario, t.correo, sr.descripcion_falla, 
         sr.gravedad, sr.estado, sr.fecha_hora_reparacion, 
         sr.fecha_creacion, sr.fecha_reparacion_terminada, 
         sr.fecha_finalizada, sr.observaciones_tecnico;

CREATE VIEW detalle_repuestos_utilizados AS
SELECT 
    ru.solicitud_id,
    sr.descripcion_falla,
    m.nombre AS maquina_nombre,
    r.nombre AS repuesto_nombre,
    ru.cantidad_utilizada,
    ru.fecha_uso,
    r.proveedor_id,
    p.nombre AS proveedor_nombre
FROM repuestos_utilizados ru
JOIN solicitudes_reparacion sr ON ru.solicitud_id = sr.id
JOIN maquinas m ON sr.maquina_id = m.id
JOIN repuestos r ON ru.repuesto_id = r.id
LEFT JOIN proveedores p ON r.proveedor_id = p.id
ORDER BY ru.fecha_uso DESC;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_maquinas_cliente_cliente ON maquinas_cliente(cliente_id);
CREATE INDEX idx_maquinas_cliente_maquina ON maquinas_cliente(maquina_id);
CREATE INDEX idx_recibos_fecha ON recibos(fecha_recibo);
CREATE INDEX idx_recibos_lote ON recibos(lote_recibo);
CREATE INDEX idx_lotes_recibos_cliente ON lotes_recibos(cliente_id);
CREATE INDEX idx_lotes_recibos_fecha ON lotes_recibos(fecha_recibo);
CREATE INDEX idx_solicitudes_cliente ON solicitudes_reparacion(cliente_id);
CREATE INDEX idx_solicitudes_maquina ON solicitudes_reparacion(maquina_id);
CREATE INDEX idx_solicitudes_tecnico ON solicitudes_reparacion(tecnico_asignado_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes_reparacion(estado);
CREATE INDEX idx_solicitudes_fecha_creacion ON solicitudes_reparacion(fecha_creacion DESC);
CREATE INDEX idx_repuestos_utilizados_solicitud ON repuestos_utilizados(solicitud_id);
CREATE INDEX idx_repuestos_utilizados_repuesto ON repuestos_utilizados(repuesto_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- Llaves foráneas
ALTER TABLE maquinas_cliente 
ADD CONSTRAINT maquinas_cliente_cliente_id_fkey 
FOREIGN KEY (cliente_id) REFERENCES usuarios(id);

ALTER TABLE maquinas_cliente 
ADD CONSTRAINT maquinas_cliente_maquina_id_fkey 
FOREIGN KEY (maquina_id) REFERENCES maquinas(id);

ALTER TABLE repuestos 
ADD CONSTRAINT repuestos_proveedor_id_fkey 
FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);

ALTER TABLE recibos 
ADD CONSTRAINT recibos_cliente_id_fkey 
FOREIGN KEY (cliente_id) REFERENCES usuarios(id);

ALTER TABLE recibos 
ADD CONSTRAINT recibos_maquina_id_fkey 
FOREIGN KEY (maquina_id) REFERENCES maquinas(id);

ALTER TABLE lotes_recibos 
ADD CONSTRAINT lotes_recibos_cliente_id_fkey 
FOREIGN KEY (cliente_id) REFERENCES usuarios(id);

ALTER TABLE solicitudes_reparacion 
ADD CONSTRAINT solicitudes_reparacion_cliente_id_fkey 
FOREIGN KEY (cliente_id) REFERENCES usuarios(id);

ALTER TABLE solicitudes_reparacion 
ADD CONSTRAINT solicitudes_reparacion_maquina_id_fkey 
FOREIGN KEY (maquina_id) REFERENCES maquinas(id);

ALTER TABLE solicitudes_reparacion 
ADD CONSTRAINT solicitudes_reparacion_tecnico_asignado_id_fkey 
FOREIGN KEY (tecnico_asignado_id) REFERENCES usuarios(id);

ALTER TABLE repuestos_utilizados 
ADD CONSTRAINT repuestos_utilizados_solicitud_id_fkey 
FOREIGN KEY (solicitud_id) REFERENCES solicitudes_reparacion(id);

ALTER TABLE repuestos_utilizados 
ADD CONSTRAINT repuestos_utilizados_repuesto_id_fkey 
FOREIGN KEY (repuesto_id) REFERENCES repuestos(id);

ALTER TABLE notificaciones 
ADD CONSTRAINT notificaciones_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id);


-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES
('SuperAdmin', 'Rol con permisos máximos del sistema, incluye todas las funcionalidades de Administrador con privilegios adicionales'),
('Administrador', 'Acceso completo al sistema, pero sin poder eliminar administradores'),
('Tecnico', 'Puede gestionar reparaciones y mantenimiento'),
('Cliente', 'Puede ver sus máquinas y reportar problemas');

-- Insertar usuarios
INSERT INTO usuarios (nombre_usuario, contraseña, rol, correo, identificador_unico, codigo_login) VALUES
('Jose', 'admin123', 'SuperAdmin', 'joseenrique.funez@gmail.com', 'Admin1', '515848'),
('Kora', 'cliente123', 'Cliente', 'jkora16102018@gmail.com', 'Client1', '515922'),
('Jeon', 'tecnico123', 'Tecnico', 'columnaj44@gmail.com', 'Tech1', '332175'),
('Juan', 'admin123', 'Administrador', 'juanmecanico@gmail.com', 'Admin2', '410511'),
('Claudio', 'cla123', 'Tecnico', 'cposas@gmail.com', 'Tech2', NULL),
('kevin', 'prueba123', 'Cliente', 'kevZelaya@gmail.com', 'Admin3', NULL),
('marco', 'prueba567', 'Tecnico', 'marcKJ@gmail.com', 'Tech3', NULL),
('harold', 'harold123', 'Cliente', 'HaroldCoello@gmail.com', 'Client3', NULL),
('maky', 'Makyna123', 'Cliente', 'makyNas@gmail.com', 'Client4', NULL),
('vladimir', 'prueba123', 'Cliente', 'vladmds@gmail.com', 'Client5', NULL),
('jose montero', 'prueba123', 'Cliente', 'prueba@gmail.com', 'Client6', NULL),
('Enrique', 'enruqie123', 'Cliente', 'EnriqueFC@gmail.com', 'Admin4', NULL),
('salvador', 'nasralla123', 'Cliente', 'NasrallaC@gmail.com', '56dea2fa-952e-49aa-876c-babd965e883f', NULL),
('eliza', 'sadsad', 'Administrador', 'sdsadsad@gmail.com', '96a06468-196c-4b02-91f9-2849b30293ab', NULL),
('quijote', 'quijote123', 'Tecnico', 'quijotexds@gmail.com', '327d4f0f-18b0-4ce0-babe-d3d9d7762cbf', NULL),
('jorge', 'cliente123', 'Tecnico', 'jorge@gmail.com', '8f09099e-04f2-4de9-915b-3749d5c6539d', NULL),
('marco antonio', 'MArctec123', 'Tecnico', 'marco@gmail.com', '5282afff-fae4-425d-b7c2-a6bca033276a', NULL),
('sauceda', 'word123', 'Cliente', 'correo@gmail.com', '496f5067-b3f7-456b-a55b-e17202c3c313', NULL),
('Marta', 'martalagarta', 'Cliente', 'marta@gmail.com', 'ce6b882a-c271-403b-beff-c9830c52f795', NULL),
('zaira', 'zaipi123', 'Cliente', 'zpineda@gmail.com', 'c337e8c2-02a6-4db6-9316-b5d8272d0823', NULL),
('Jose Enrique', 'dcdscdscds', 'Cliente', 'prueba123456789@gmail.com', '6b0fc031-7a42-4434-bd9c-b0c4ccbf87a9', NULL);

-- Insertar máquinas
INSERT INTO maquinas (nombre, tipo, estado, ubicacion, fecha_compra, fecha_garantia) VALUES
('Torno CNC Haas ST-10', 'Torno CNC', 'Funcionando', 'Área de Producción 1', '2023-06-10', '2026-06-10'),
('Fresadora Bridgeport VMC800', 'Fresadora', 'Mantenimiento', 'Área de Producción 2', '2022-11-19', '2025-11-19'),
('Compresor de Aire Ingersoll Rand', 'Compresor', 'Funcionando', 'Taller Central', '2021-08-14', '2024-08-14'),
('Prensa Hidráulica 50T', 'Prensa', 'Funcionando', 'Zona de Ensamble', '2024-02-12', '2027-02-12'),
('Rectificadora Supertec G32P-60', 'Rectificadora', 'Funcionando', 'Área de Rectificado', '2023-03-22', '2026-03-22'),
('Soldadora Lincoln Electric MIG 350', 'Soldadora MIG', 'Funcionando', 'Zona de Soldadura', '2024-01-08', '2027-01-08'),
('Cortadora Láser Trumpf TruLaser 3030', 'Cortadora Láser', 'Mantenimiento', 'Área de Corte', '2022-09-17', '2025-09-17'),
('Pulidora Industrial Makita', 'Pulidora', 'Funcionando', 'Zona de Acabado', '2023-05-14', '2026-05-14'),
('Taladro de Columna Bosch GSB 32-4', 'Taladro', 'Funcionando', 'Taller General', '2023-10-25', '2026-10-25'),
('Máquina de Inyección Arburg Allrounder 370S', 'Inyectora', 'Mantenimiento', 'Área de Moldeo', '2024-04-17', '2027-04-17'),
('Grúa Pórtico 5T', 'Grúa', 'Funcionando', 'Patio de Carga', '2021-12-02', '2024-12-02'),
('Cizalla Hidráulica Durma SBT 3010', 'Cizalla', 'Funcionando', 'Área de Corte', '2022-06-04', '2025-06-04'),
('Centro de Mecanizado Mazak Variaxis i-600', 'Centro de Mecanizado', 'Funcionando', 'Área CNC', '2024-03-10', '2027-03-10'),
('Torno Convencional Atlas 618', 'Torno Manual', 'Mantenimiento', 'Depósito', '2020-08-11', '2023-08-11'),
('Cabina de Pintura SATAjet', 'Cabina de Pintura', 'Funcionando', 'Zona de Pintura', '2023-09-19', '2026-09-19'),
('prueba1', 'poker', 'Fuera de servicio', 'zeleya', '2025-10-25', '2025-11-28'),
('prueba2', 'poker', 'Mantenimiento', 'centenario', '2025-10-27', '2025-12-06'),
('prueba3', 'pinball', 'Mantenimiento', 'cerro', '2025-10-27', '2025-12-19'),
('fvdfvd', 'vdfvdfvfd', 'Funcionando', 'dfvdfv', '2025-11-07', '2025-11-08');

-- Insertar relaciones máquinas-cliente
INSERT INTO maquinas_cliente (cliente_id, maquina_id, estado, fecha_asignacion) VALUES
(2, 1, 'Funcionando', '2025-11-18 14:35:52.561636-06'),
(2, 3, 'Funcionando', '2025-11-18 21:31:39.588-06'),
(2, 4, 'Funcionando', '2025-11-18 21:31:26.579142-06'),
(2, 5, 'Funcionando', '2025-11-19 20:40:04.554541-06'),
(8, 11, 'Asignada', '2025-11-20 19:23:53.265805-06'),
(13, 10, 'Asignada', '2025-11-24 18:27:54.313-06'),
(8, 6, 'Asignada', '2025-11-24 18:27:07.870609-06');

-- Insertar proveedores
INSERT INTO proveedores (nombre, informacion_contacto, direccion, fecha_creacion) VALUES
('TecnoRepuestos S.A.', 'tecnorepuestos@gmail.com | +504 9988-2233', 'Boulevard Morazán, Tegucigalpa, Honduras', '2025-10-15 00:00:00-06'),
('MotoParts HN', 'ventas@motopartshn.com | +504 8855-6677', 'Avenida Circunvalación, San Pedro Sula, Honduras', '2025-09-20 00:00:00-06'),
('Industrias López', 'contacto@industriaslopez.hn | +504 9467-1234', 'Barrio El Centro, Choluteca, Honduras', '2025-08-30 00:00:00-06'),
('Repuestos del Norte', 'repuestosnorte@gmail.com | +504 9678-5566', 'Col. Miramontes, La Ceiba, Honduras', '2025-07-10 00:00:00-06'),
('AutoSuministros Caribe', 'autosuministroscaribe@hn.com | +504 9345-8899', 'Col. Monte Verde, Puerto Cortés, Honduras', '2025-09-05 00:00:00-06'),
('Maquinarias y Herramientas Sula', 'info@mysula.hn | +504 9456-3322', 'Parque Industrial Zip Búfalo, Villanueva, Honduras', '2025-11-01 00:00:00-06'),
('prueba2.2', 'prueba2.2@gmail.com', 'colonia cerro grande', '2025-11-17 12:50:32.80875-06');

-- Insertar repuestos
INSERT INTO repuestos (nombre, proveedor_id, cantidad, ubicacion, estado) VALUES
('Filtro de aceite Honda', 1, 38, 'Estante A1', 'Disponible'),
('Bujía NGK CR8E', 1, 100, 'Estante A2', 'Disponible'),
('Pastillas de freno Yamaha', 2, 31, 'Estante B1', 'Disponible'),
('Cadena de transmisión 428H', 2, 25, 'Estante B2', 'Disponible'),
('Aceite sintético 10W-40', 3, 50, 'Estante C1', 'Disponible'),
('Filtro de aire Toyota', 3, 21, 'Estante C2', 'Disponible'),
('Rodamiento 6203ZZ', 4, 129, 'Estante D1', 'Disponible'),
('Amortiguador trasero Suzuki', 4, 20, 'Estante D2', 'Disponible'),
('Batería 12V 7Ah', 5, 39, 'Estante E1', 'Disponible'),
('Correa de alternador Nissan', 5, 20, 'Estante E2', 'Disponible'),
('Sensor de oxígeno Hyundai', 1, 15, 'Estante F1', 'Disponible'),
('Filtro de combustible Mazda', 6, 2, 'Estante F2', 'Disponible'),
('prueba1.1', 5, 21, 'estante A13', 'En pedido'),
('prueba3.3', 1, 0, 'estante A2', 'Disponible');

-- Insertar solicitudes de reparación
INSERT INTO solicitudes_reparacion (cliente_id, maquina_id, descripcion_falla, gravedad, estado, tecnico_asignado_id, fecha_hora_reparacion, fecha_creacion, fecha_actualizacion, observaciones_tecnico, fecha_reparacion_terminada, fecha_finalizada) VALUES
(2, 4, 'falla en el tablero, no levanta', 'grave', 'finalizada', 3, '2025-11-30 11:51:00-06', '2025-11-26 00:29:03.01294-06', '2025-11-26 06:48:05.68873-06', 'prueba 3', '2025-11-26 06:47:45.959-06', '2025-11-26 06:48:05.682-06'),
(2, 5, 'billete trabado', 'leve', 'finalizada', 3, '2025-11-30 06:48:00-06', '2025-11-26 01:01:56.542238-06', '2025-11-26 06:44:44.83503-06', 'se destrabo el billete, pero se arruino y toco cambiarlo', '2025-11-26 06:43:54.976-06', '2025-11-26 06:44:44.83-06'),
(2, 3, 'hfdgfdgfx', 'moderada', 'finalizada', 3, '2025-11-27 12:30:00-06', '2025-11-26 01:23:24.667728-06', '2025-11-26 06:39:08.478949-06', 'prueba 2', '2025-11-26 06:38:27.899-06', '2025-11-26 06:39:08.472-06'),
(2, 1, 'la palanca se arruino', 'moderada', 'finalizada', 3, '2025-11-28 13:36:00-06', '2025-11-26 01:52:39.4857-06', '2025-11-26 06:37:06.080045-06', 'prueba 1', '2025-11-26 06:15:16.261-06', '2025-11-26 06:37:06.066-06'),
(2, 5, 'falla en tablero', 'grave', 'finalizada', 3, '2025-11-30 12:49:00-06', '2025-11-26 07:43:32.362005-06', '2025-11-26 07:46:19.988362-06', 'ya se soluciono, era un cable desconectado.', '2025-11-26 07:45:55.9-06', '2025-11-26 07:46:19.984-06'),
(2, 4, 'prueba#5', 'moderada', 'finalizada', 3, '2025-11-30 14:10:00-06', '2025-11-26 08:04:39.558474-06', '2025-11-26 08:09:09.758959-06', 'prueba #5, verficando que solo reste uno a la vez', '2025-11-26 08:07:25.876-06', '2025-11-26 08:09:09.755-06'),
(2, 1, 'prueba notifacion', 'leve', 'finalizada', 3, '2025-11-29 13:49:00-06', '2025-11-26 08:56:54.735743-06', '2025-11-26 11:24:00.5172-06', NULL, NULL, NULL),
(2, 3, 'pruednsa', 'moderada', 'finalizada', NULL, NULL, '2025-11-26 09:53:20.364188-06', '2025-11-26 11:24:00.5172-06', NULL, NULL, NULL),
(2, 5, 'falla#1', 'grave', 'finalizada', NULL, NULL, '2025-11-26 10:58:12.96802-06', '2025-11-26 11:24:00.5172-06', NULL, NULL, NULL),
(2, 4, 'cualquier cosa, ya tengo sueño', 'leve', 'finalizada', NULL, NULL, '2025-11-26 11:16:34.878289-06', '2025-11-26 11:24:00.5172-06', NULL, NULL, NULL),
(2, 1, 'prueba#11, porfavor ya da, por el amor de Dios', 'grave', 'finalizada', 3, '2025-11-29 16:11:00-06', '2025-11-26 11:30:49.892377-06', '2025-11-26 12:33:20.012666-06', 'tiene que enviarle una notificacion al cliente para que le de la verificacion', '2025-11-26 12:19:51.184-06', '2025-11-26 12:33:19.998-06'),
(2, 3, 'prueba #12', 'grave', 'finalizada', 3, '2025-11-29 01:47:00-06', '2025-11-26 11:43:22.97042-06', '2025-11-26 20:47:42.369112-06', 'frfer', '2025-11-26 20:47:18.642-06', '2025-11-26 20:47:42.356-06'),
(2, 5, 'dsfsdfdssdhjhgj', 'moderada', 'finalizada', 3, '2025-11-29 20:41:00-06', '2025-11-26 11:50:14.179859-06', '2025-11-26 20:44:11.763877-06', 'efsdfdsf', '2025-11-26 20:43:58.892-06', '2025-11-26 20:44:11.76-06'),
(2, 1, 'cualquier&121', 'moderada', 'finalizada', 3, '2025-11-29 16:39:00-06', '2025-11-26 12:35:01.284903-06', '2025-11-26 12:45:13.462348-06', 'prueba#15 a ver si manda la notificacion al cliente', '2025-11-26 12:37:05.48-06', '2025-11-26 12:45:13.448-06'),
(2, 4, 'snsaudaasa', 'leve', 'finalizada', 3, '2025-11-29 15:49:00-06', '2025-11-26 12:45:48.500161-06', '2025-11-26 12:53:14.116922-06', 'sSDADASDSASVSV', '2025-11-26 12:47:19.962-06', '2025-11-26 12:53:14.098-06'),
(2, 1, 'rfgdvdvdf', 'moderada', 'finalizada', 3, '2025-11-30 17:58:00-06', '2025-11-26 12:53:48.873498-06', '2025-11-26 13:14:04.907303-06', 'gfhfhfg', '2025-11-26 12:55:28.935-06', '2025-11-26 13:14:04.895-06'),
(2, 4, 'aqui probando', 'grave', 'finalizada', 3, '2025-11-30 00:25:00-06', '2025-11-26 20:19:39.389592-06', '2025-11-26 20:24:25.567701-06', 'aqui probando que si dio', '2025-11-26 20:23:49.296-06', '2025-11-26 20:24:25.564-06'),
(2, 1, 'vgdfv', 'moderada', 'finalizada', 3, '2025-11-28 01:42:00-06', '2025-11-26 20:37:24.080551-06', '2025-11-26 20:39:28.751881-06', 'cvxcvcx', '2025-11-26 20:38:37.554-06', '2025-11-26 20:39:28.746-06'),
(2, 4, 'dfsf', 'leve', 'finalizada', 3, '2025-11-30 01:46:00-06', '2025-11-26 20:41:01.483045-06', '2025-11-26 20:42:40.994579-06', 'dfdsfds', '2025-11-26 20:42:23.126-06', '2025-11-26 20:42:40.989-06');

-- Insertar repuestos utilizados
INSERT INTO repuestos_utilizados (solicitud_id, repuesto_id, cantidad_utilizada, fecha_uso) VALUES
(4, 12, 5, '2025-11-26 06:38:30.722553-06'),
(3, 12, 5, '2025-11-26 06:43:55.229986-06'),
(2, 13, 1, '2025-11-26 06:47:46.261284-06'),
(2, 12, 1, '2025-11-26 06:47:46.386492-06'),
(2, 11, 1, '2025-11-26 06:47:46.486856-06'),
(6, 13, 1, '2025-11-26 07:45:56.084512-06'),
(6, 12, 2, '2025-11-26 07:45:56.198367-06'),
(6, 7, 10, '2025-11-26 07:45:56.374669-06'),
(6, 5, 15, '2025-11-26 07:45:56.479376-06'),
(7, 14, 1, '2025-11-26 08:07:26.047565-06'),
(7, 12, 2, '2025-11-26 08:07:26.192412-06'),
(7, 9, 10, '2025-11-26 08:07:26.339001-06'),
(7, 1, 5, '2025-11-26 08:07:26.509487-06'),
(12, 10, 10, '2025-11-26 12:19:53.775493-06'),
(15, 1, 1, '2025-11-26 12:37:05.677053-06'),
(16, 1, 1, '2025-11-26 12:47:20.129305-06'),
(17, 2, 20, '2025-11-26 12:55:30.984368-06'),
(17, 3, 10, '2025-11-26 12:55:31.072531-06'),
(18, 10, 10, '2025-11-26 20:23:49.504961-06'),
(18, 6, 14, '2025-11-26 20:23:49.641064-06'),
(18, 3, 19, '2025-11-26 20:23:49.748328-06'),
(20, 7, 1, '2025-11-26 20:42:23.304611-06'),
(13, 11, 15, '2025-11-26 20:47:21.992008-06'),
(13, 9, 1, '2025-11-26 20:47:22.161589-06');

-- Función para actualizar fecha de actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar lotes de recibos
CREATE OR REPLACE FUNCTION actualizar_lote_recibo()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es DELETE, necesitamos recalcular el lote completo
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM lotes_recibos WHERE id = OLD.lote_recibo;
        
        INSERT INTO lotes_recibos (
            id, cliente_id, fecha_recibo, ingreso, egreso, total, 
            parte_empresa, parte_cliente, cantidad_recibos, fecha_creacion
        )
        SELECT 
            lote_recibo,
            cliente_id,
            MAX(fecha_recibo),
            SUM(ingreso),
            SUM(egreso),
            SUM(total),
            SUM(total) * 0.60 as parte_empresa,
            SUM(total) * 0.40 as parte_cliente,
            COUNT(*),
            MAX(fecha_creacion)
        FROM recibos
        WHERE lote_recibo = OLD.lote_recibo
        GROUP BY lote_recibo, cliente_id;
        
        RETURN OLD;
    ELSE
        DELETE FROM lotes_recibos WHERE id = NEW.lote_recibo;
        
        INSERT INTO lotes_recibos (
            id, cliente_id, fecha_recibo, ingreso, egreso, total,
            parte_empresa, parte_cliente, cantidad_recibos, fecha_creacion
        )
        SELECT 
            lote_recibo,
            cliente_id,
            MAX(fecha_recibo),
            SUM(ingreso),
            SUM(egreso),
            SUM(total),
            SUM(total) * 0.60 as parte_empresa,
            SUM(total) * 0.40 as parte_cliente,
            COUNT(*),
            MAX(fecha_creacion)
        FROM recibos
        WHERE lote_recibo = NEW.lote_recibo
        GROUP BY lote_recibo, cliente_id;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para cambiar estado de máquina al crear solicitud
CREATE OR REPLACE FUNCTION cambiar_estado_maquina_solicitud()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.estado = 'pendiente' THEN
        UPDATE maquinas 
        SET estado = 'Fuera de servicio'::estado_maquina 
        WHERE id = NEW.maquina_id;
        
        UPDATE maquinas_cliente 
        SET estado = 'Fuera de servicio' 
        WHERE maquina_id = NEW.maquina_id AND cliente_id = NEW.cliente_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para cambiar estado de máquina al actualizar solicitud
CREATE OR REPLACE FUNCTION cambiar_estado_maquina_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'finalizada' AND OLD.estado != 'finalizada' THEN
        UPDATE maquinas 
        SET estado = 'Funcionando'::estado_maquina 
        WHERE id = NEW.maquina_id;
        
        UPDATE maquinas_cliente 
        SET estado = 'Funcionando' 
        WHERE maquina_id = NEW.maquina_id AND cliente_id = NEW.cliente_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION crear_notificacion_automatica()
RETURNS TRIGGER AS $$
DECLARE
    admin_id BIGINT;
    cliente_email TEXT;
    tecnico_email TEXT;
    admin_email TEXT;
    maquina_nombre TEXT;
    cliente_nombre TEXT;
    tecnico_nombre TEXT;
BEGIN
    SELECT nombre INTO maquina_nombre FROM maquinas WHERE id = NEW.maquina_id;
    SELECT nombre_usuario, correo INTO cliente_nombre, cliente_email FROM usuarios WHERE id = NEW.cliente_id;
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, relacion_id)
        VALUES (NEW.cliente_id, 'Solicitud de Reparación Creada', 
                'Se ha creado su solicitud de reparación para la máquina ' || maquina_nombre || '. Estado: Pendiente',
                'solicitud_creada', NEW.id);
                
        FOR admin_id IN 
            SELECT id FROM usuarios 
            WHERE rol IN ('SuperAdmin', 'Administrador') 
            AND activo = true
        LOOP
            INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, relacion_id)
            VALUES (admin_id, 'Nueva Solicitud de Reparación', 
                    'El cliente ' || cliente_nombre || ' ha reportado una falla en la máquina ' || maquina_nombre || '. Gravedad: ' || NEW.gravedad,
                    'nueva_solicitud', NEW.id);
        END LOOP;
    END IF;
    
    IF TG_OP = 'UPDATE' AND NEW.tecnico_asignado_id IS NOT NULL AND OLD.tecnico_asignado_id IS NULL THEN
        SELECT nombre_usuario, correo INTO tecnico_nombre, tecnico_email FROM usuarios WHERE id = NEW.tecnico_asignado_id;
        
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, relacion_id)
        VALUES (NEW.cliente_id, 'Técnico Asignado', 
                'Se ha asignado el técnico ' || tecnico_nombre || ' para reparar su máquina ' || maquina_nombre || '. Fecha: ' || TO_CHAR(NEW.fecha_hora_reparacion, 'DD/MM/YYYY HH24:MI'),
                'tecnico_asignado', NEW.id);
                
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, relacion_id)
        VALUES (NEW.tecnico_asignado_id, 'Nueva Orden de Trabajo Asignada', 
                'Se le ha asignado la reparación de la máquina ' || maquina_nombre || ' del cliente ' || cliente_nombre || '. Fecha: ' || TO_CHAR(NEW.fecha_hora_reparacion, 'DD/MM/YYYY HH24:MI'),
                'orden_trabajo', NEW.id);
    END IF;
    
    IF TG_OP = 'UPDATE' AND NEW.estado = 'prefinalizada' AND OLD.estado != 'prefinalizada' THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, relacion_id)
        VALUES (NEW.cliente_id, 'Reparación Completada', 
                'El técnico ha completado la reparación de su máquina ' || maquina_nombre || '. Por favor verifique el funcionamiento.',
                'reparacion_completada', NEW.id);
    END IF;
    
    IF TG_OP = 'UPDATE' AND NEW.estado = 'finalizada' AND OLD.estado != 'finalizada' THEN
        FOR admin_id IN 
            SELECT id FROM usuarios 
            WHERE rol IN ('SuperAdmin', 'Administrador') 
            AND activo = true
        LOOP
            INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, relacion_id)
            VALUES (admin_id, 'Reparación Finalizada', 
                    'La reparación de la máquina ' || maquina_nombre || ' para el cliente ' || cliente_nombre || ' ha sido finalizada exitosamente.',
                    'reparacion_finalizada', NEW.id);
        END LOOP;
        
        IF NEW.tecnico_asignado_id IS NOT NULL THEN
            INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, relacion_id)
            VALUES (NEW.tecnico_asignado_id, 'Reparación Finalizada', 
                    'La reparación de la máquina ' || maquina_nombre || ' ha sido finalizada y aceptada por el cliente.',
                    'reparacion_finalizada', NEW.id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
CREATE TRIGGER trg_actualizar_lote_recibo 
    AFTER INSERT OR DELETE OR UPDATE ON recibos 
    FOR EACH ROW EXECUTE FUNCTION actualizar_lote_recibo();

CREATE TRIGGER trigger_actualizar_fecha_solicitudes 
    BEFORE UPDATE ON solicitudes_reparacion 
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_cambiar_estado_maquina_insert 
    AFTER INSERT ON solicitudes_reparacion 
    FOR EACH ROW EXECUTE FUNCTION cambiar_estado_maquina_solicitud();

CREATE TRIGGER trigger_cambiar_estado_maquina_update 
    AFTER UPDATE ON solicitudes_reparacion 
    FOR EACH ROW EXECUTE FUNCTION cambiar_estado_maquina_actualizacion();

CREATE TRIGGER trigger_notificaciones_solicitudes 
    AFTER INSERT OR UPDATE ON solicitudes_reparacion 
    FOR EACH ROW EXECUTE FUNCTION crear_notificacion_automatica();
