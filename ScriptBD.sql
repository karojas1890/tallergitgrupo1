-- Usar la base de datos
USE tiusr24pl_tallergitkrs;
GO

-- Crear tabla con restricciones
CREATE TABLE Participantes (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL,
    Apellido1 NVARCHAR(50) NOT NULL,
    Apellido2 NVARCHAR(50) NULL, -- Permitimos que sea opcional
    Grupo INT NOT NULL CHECK (Grupo BETWEEN 1 AND 5) -- Solo permite valores 1-5
);
GO

-- Insertar datos de ejemplo
INSERT INTO Participantes (Nombre, Apellido1, Apellido2, Grupo)
VALUES 
    ('Jose Alonso', 'Porras','Ramirez', 1),
    ('Vera', 'Valverde', 'Navarro', 1), -- Ejemplo con Apellido2 opcional
    ('Katherine', 'Rojas', 'Salazar', 1);
GO

select * from Participantes 