const express = require('express');
const { Connection, Request } = require('tedious');
const sqlConfig = require('./sqlConfig');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Conexión a SQL Server
function executeSQL(query, parameters = []) {
  return new Promise((resolve, reject) => {
    const connection = new Connection(sqlConfig);
    const results = [];

    connection.on('connect', err => {
      if (err) return reject(err);

      const request = new Request(query, (err, rowCount) => {
        if (err) reject(err);
        else resolve({ rowCount, results });
        connection.close();
      });

      parameters.forEach(param => {
        request.addParameter(param.name, param.type, param.value);
      });

      request.on('row', columns => {
        const row = {};
        columns.forEach(column => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row);
      });

      connection.execSql(request);
    });

    connection.connect();
  });
}

// Crear tabla si no existe (ejecutar solo una vez)
async function createTable() {
  const query = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Participantes')
    CREATE TABLE Participantes (
      ID INT IDENTITY(1,1) PRIMARY KEY,
      Nombre NVARCHAR(50) NOT NULL,
      Apellido1 NVARCHAR(50) NOT NULL,
      Apellido2 NVARCHAR(50),
      Grupo INT NOT NULL CHECK (Grupo BETWEEN 1 AND 5),
      FechaRegistro DATETIME DEFAULT GETDATE()
    )
  `;
  await executeSQL(query);
}

// Endpoint para guardar participantes
app.post('/api/participantes', async (req, res) => {
  try {
    const { nombre, apellido1, apellido2, grupo } = req.body;

    if (!nombre || !apellido1 || !grupo) {
      throw new Error('Nombre, Apellido1 y Grupo son obligatorios');
    }

    const query = `
      INSERT INTO Participantes (Nombre, Apellido1, Apellido2, Grupo)
      VALUES (@Nombre, @Apellido1, @Apellido2, @Grupo)
    `;

    const parameters = [
      { name: 'Nombre', type: require('tedious').TYPES.NVarChar, value: nombre },
      { name: 'Apellido1', type: require('tedious').TYPES.NVarChar, value: apellido1 },
      { name: 'Apellido2', type: require('tedious').TYPES.NVarChar, value: apellido2 || null },
      { name: 'Grupo', type: require('tedious').TYPES.Int, value: grupo }
    ];

    await executeSQL(query, parameters);
    res.json({ success: true, message: 'Registro exitoso' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  try {
    await createTable();
    console.log('Tabla "Participantes" verificada');
  } catch (err) {
    console.error('Error al verificar tabla:', err.message);
  }
});