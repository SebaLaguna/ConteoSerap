console.log('✅ script.js cargado');
document.getElementById('formulario').addEventListener('submit', async function (e) {
  e.preventDefault();

  const matricula = document.getElementById('matricula').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const mensaje = document.getElementById('mensaje');

  try {
    const res = await fetch('/enviar-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula, telefono })
    });

    const data = await res.json();

    if (data.ok) {
      mensaje.textContent = '✅ Registro exitoso. WhatsApp enviado.';
    } else {
      mensaje.textContent = '❌ Error: ' + data.error;
    }
  } catch (err) {
    mensaje.textContent = '❌ Error al comunicarse con el servidor.';
  }
});
