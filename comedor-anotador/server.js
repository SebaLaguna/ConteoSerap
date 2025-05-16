const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Función para verificar si la matrícula existe en legajos.csv
function verificarMatricula(matriculaIngresada) {
    return new Promise((resolve, reject) => {
        let encontrada = false;

        fs.createReadStream('legajos.csv')
            .pipe(csv())
            .on('data', (row) => {
                console.log('Leyendo fila CSV:', row);
                if (row.user.trim() === String(matriculaIngresada).trim()) {
                    encontrada = true;
                }
            })
            .on('end', () => {
                resolve(encontrada);
            })
            .on('error', reject);
    });
}

// WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Escaneá este QR con WhatsApp Web:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp listo!');
});

client.initialize();

// Ruta para manejar formulario
app.post('/enviar-whatsapp', async (req, res) => {
    const { matricula, telefono } = req.body;
    console.log('Solicitud recibida:', { matricula, telefono });

    try {
        const esValida = await verificarMatricula(matricula);

        if (esValida) {
            const mensaje = `Hola! Tu matrícula ${matricula} ha sido registrada para el comedor.`;

            // Formatear número para WhatsApp
            const numeroFormateado = `598${telefono.replace(/^0+/, '')}`;

            await client.sendMessage(`${numeroFormateado}@c.us`, mensaje);
            res.status(200).json({ mensaje: 'Mensaje enviado correctamente' });
        } else {
            res.status(400).json({ error: 'Matrícula no válida' });
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
