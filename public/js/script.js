document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formRegistro");

    async function validarMatricula(matricula) {
        try {
            const response = await fetch("/legajos.csv");
            const texto = await response.text();
            const lineas = texto.split('\n').map(l => l.trim());
            return lineas.includes(matricula);
        } catch (err) {
            console.error("Error leyendo legajos.csv:", err);
            return false;
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const matricula = document.getElementById("matricula").value.trim();
        const celular = document.getElementById("celular").value.trim();

        // Validaciones
        if (!/^[0-9]+$/.test(matricula)) {
            alert("La matrícula debe contener solo números.");
            return;
        }

        if (!/^09[0-9]{7}$/.test(celular)) {
            alert("El celular debe comenzar con 09 y tener 9 dígitos.");
            return;
        }

        const esValida = await validarMatricula(matricula);

        if (!esValida) {
            alert("Matrícula no autorizada.");
            return;
        }

        const fechaFormateada = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase());

        // Enviar al backend
        fetch("/api/contar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fechaFormateada })
        })
            .then(res => {
                if (!res.ok) throw new Error("Error al actualizar el contador.");
                alert("Registro exitoso.");
                form.reset();
            })
            .catch(err => {
                console.error("Error al contactar con el servidor:", err);
                alert("Error al contactar con el servidor.");
            });
    });
});
