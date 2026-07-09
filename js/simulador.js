document.getElementById('simuladorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = document.getElementById('btnSubmit');
    const errorMessage = document.getElementById('errorMessage');
    
    btnSubmit.innerText = "Calculando...";
    btnSubmit.style.opacity = "0.7";
    errorMessage.classList.add('hidden');

    const tipoGracia = document.getElementById('tipoGracia').value;

    const payload = {
        precioVehiculo: parseFloat(document.getElementById('precioVehiculo').value),
        porcCuotaInicial: parseFloat(document.getElementById('porcCuotaInicial').value) / 100,
        porcCuotaFinal: parseFloat(document.getElementById('porcCuotaFinal').value) / 100,
        plazoMeses: parseInt(document.getElementById('plazoMeses').value),
        tipoTasa: document.getElementById('tipoTasa').value,
        tasaInteres: parseFloat(document.getElementById('tasaInteres').value) / 100,
        capTasa: parseInt(document.getElementById('periodoCapitalizacion').value),
        tasaDesgravamen: parseFloat(document.getElementById('seguroDesgravamen').value) / 100,
        montoSeguroVehic: parseFloat(document.getElementById('seguroVehicular').value),
        mesesGraciaTo: tipoGracia === 'Total' ? 1 : 0,
        mesesGraciaPa: tipoGracia === 'Parcial' ? 1 : 0,
        cokAnual: 0.10 
    };

    try {
        const response = await fetch('https://simulador-backend-grupo.onrender.com/simular', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('resultadoSimulacion', JSON.stringify(data.resumen));
            window.location.href = 'resultados.html';
        } else {
            errorMessage.innerText = "Error: " + (data.mensaje || "Revisa los datos ingresados.");
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        errorMessage.innerText = "Error de conexión con el servidor.";
        errorMessage.classList.remove('hidden');
    } finally {
        btnSubmit.innerText = "Generar Cronograma";
        btnSubmit.style.opacity = "1";
    }
});