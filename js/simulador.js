let miGrafico = null;

window.addEventListener('load', () => {
    document.getElementById('simuladorForm').reset();
    document.getElementById('iconoMoneda').innerText = 'S/';
});

document.getElementById('moneda').addEventListener('change', function() {
    const icono = document.getElementById('iconoMoneda');
    if (icono) icono.innerText = this.value === 'Soles' ? 'S/' : '$';
});

document.getElementById('tipoGracia').addEventListener('change', function() {
    const inputMeses = document.getElementById('mesesGracia');
    if (this.value === 'Sin Gracia') {
        inputMeses.value = 0;
        inputMeses.disabled = true;
        inputMeses.classList.add('bg-slate-100', 'text-slate-400');
    } else {
        inputMeses.disabled = false;
        inputMeses.classList.remove('bg-slate-100', 'text-slate-400');
    }
});


document.getElementById('btnSimular').addEventListener('click', async () => {
    const btnSimular = document.getElementById('btnSimular');
    const btnGuardar = document.getElementById('btnGuardar');
    const errorMessage = document.getElementById('errorMessage');
    
    btnSimular.innerText = "Calculando...";
    btnSimular.disabled = true;
    errorMessage.classList.add('hidden');

    const tipoGracia = document.getElementById('tipoGracia').value;
    const mesesGraciaVal = parseInt(document.getElementById('mesesGracia').value) || 0;

    const payload = {
        moneda: document.getElementById('moneda').value,
        precioVehiculo: parseFloat(document.getElementById('precioVehiculo').value),
        porcCuotaInicial: parseFloat(document.getElementById('porcCuotaInicial').value) / 100,
        porcCuotaFinal: parseFloat(document.getElementById('porcCuotaFinal').value) / 100,
        plazoMeses: parseInt(document.getElementById('plazoMeses').value),
        tipoTasa: document.getElementById('tipoTasa').value,
        tasaInteres: parseFloat(document.getElementById('tasaInteres').value) / 100,
        capTasa: parseInt(document.getElementById('periodoCapitalizacion').value),
        tasaDesgravamen: parseFloat(document.getElementById('seguroDesgravamen').value) / 100,
        montoSeguroVehic: parseFloat(document.getElementById('seguroVehicular').value),
        mesesGraciaTo: tipoGracia === 'Total' ? mesesGraciaVal : 0,
        mesesGraciaPa: tipoGracia === 'Parcial' ? mesesGraciaVal : 0,
        cokAnual: parseFloat(document.getElementById('cokAnual').value) / 100 
    };

    if (isNaN(payload.precioVehiculo) || isNaN(payload.plazoMeses)) {
        errorMessage.innerText = "Error: Verifica que los campos numéricos tengan valores válidos.";
        errorMessage.classList.remove('hidden');
        btnSimular.innerText = "Simular";
        btnSimular.disabled = false;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/simular`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            const res = data.resumen;
            const cronograma = data.cronograma || [];
            const simbolo = payload.moneda === 'Soles' ? 'S/' : '$';
            document.getElementById('resCuota').innerText = `${simbolo} ${parseFloat(res.cuotaMensual || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resInteres').innerText = `${simbolo} ${parseFloat(res.interesTotal || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resCuotaFinal').innerText = `${simbolo} ${parseFloat(res.montoCuotaFin || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            
            const vanElem = document.getElementById('resVAN');
            vanElem.innerText = `${simbolo} ${parseFloat(res.van || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            if (res.van < 0) vanElem.classList.add('text-red-500'); else vanElem.classList.remove('text-red-500');

            document.getElementById('resTCEA').innerText = `${(parseFloat(res.tcea || 0) * 100).toFixed(4)}%`;
            document.getElementById('resTIR').innerText = `${(parseFloat(res.tir || 0) * 100).toFixed(4)}%`;

            btnGuardar.classList.remove('hidden');
            
            if (cronograma.length > 0) {
                document.getElementById('cronogramaContainer').classList.remove('hidden');
                const tabla = document.getElementById('tablaCronograma');
                tabla.innerHTML = '';
                
                cronograma.forEach(fila => {
                    const num = fila.numeroCuota;
                    const sInicial = fila.saldoInicial;
                    const interes = fila.interes;
                    const cuota = fila.cuota;
                    const amort = fila.amortizacion;
                    const sDesg = fila.seguroDesgravamen || 0;
                    const sVehic = fila.seguroVehicular || 0;
                    const sFinal = fila.saldoFinal;

                    const segurosTotal = sDesg + sVehic;
                    const cuotaTotal = parseFloat(cuota || 0) + segurosTotal;
                    const flujoCaja = fila.flujoCajaNeto || fila.flujo_caja_neto || (cuotaTotal * -1);

                    tabla.innerHTML += `
                        <tr class="hover:bg-slate-50">
                            <td class="py-2 px-2">${num || 0}</td>
                            <td class="py-2 px-2">${parseFloat(sInicial || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="py-2 px-2">${parseFloat(interes || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="py-2 px-2">${parseFloat(cuota || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="py-2 px-2">${segurosTotal.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="py-2 px-2">${parseFloat(amort || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="py-2 px-2 font-semibold text-blue-700">${cuotaTotal.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="py-2 px-2">${parseFloat(sFinal || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="py-2 px-2 font-bold text-red-600">${parseFloat(flujoCaja || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                    `;
                });
                dibujarGrafico(cronograma);
            }

            localStorage.setItem('resultadoSimulacionTemporal', JSON.stringify(res));

        } else {
            errorMessage.innerText = "Error: " + (data.mensaje || "Revisa los datos ingresados.");
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        errorMessage.innerText = "Error de conexión con el servidor.";
        errorMessage.classList.remove('hidden');
    } finally {
        btnSimular.innerText = "Simular";
        btnSimular.disabled = false;
    }
});

document.getElementById('btnGuardar').addEventListener('click', () => {
    const temp = localStorage.getItem('resultadoSimulacionTemporal');
    if(temp) {
        localStorage.setItem('resultadoSimulacion', temp);
        alert("Simulación guardada exitosamente.");
        window.location.href = 'inicio_cliente.html';
    }
});

function dibujarGrafico(cronograma) {
    if (miGrafico) miGrafico.destroy();

    const labels = cronograma.map(c => `Mes ${c.numeroCuota}`);
    const saldos = cronograma.map(c => c.saldoFinal);
    
    let amortAcum = 0;
    let intAcum = 0;
    const amortizacionData = [];
    const interesData = [];

    cronograma.forEach(c => {
        amortAcum += parseFloat(c.amortizacion || 0);
        intAcum += parseFloat(c.interes || 0);
        amortizacionData.push(amortAcum);
        interesData.push(intAcum);
    });

    const ctx = document.getElementById('evolucionChart').getContext('2d');
    miGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Saldo Pendiente',
                    data: saldos,
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Amort. Acumulada',
                    data: amortizacionData,
                    borderColor: '#22c55e',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Interés Acumulado',
                    data: interesData,
                    borderColor: '#eab308',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom', 
                    labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 }, padding: 15 }
                }
            },
            scales: {
                x: { display: false },
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
            }
        }
    });
}