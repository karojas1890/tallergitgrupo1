document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const apellido1 = document.getElementById('apellido1').value;
    const apellido2 = document.getElementById('apellido2').value;
    const grupo = document.getElementById('grupo').value;

    try {
        const response = await fetch('http://localhost:3000/api/participantes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                apellido1,
                apellido2,
                grupo: parseInt(grupo)
            })
        });

        const result = await response.json();

        mostrarMensaje(
            result.success ? result.message : `Error: ${result.message}`,
            result.success ? 'exito' : 'error'
        );

        if (result.success) {
            document.getElementById('registroForm').reset();
        }
    } catch (error) {
        mostrarMensaje(`Error de conexión: ${error.message}`, 'error');
    }
});

function mostrarMensaje(mensaje, tipo) {
    const divMensaje = document.getElementById('mensaje');
    divMensaje.textContent = mensaje;
    divMensaje.className = tipo;
}