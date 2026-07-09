let miGrafico = null;
let ultimoPayload = null;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('simuladorForm');
    if (form) form.reset();

    const icono = document.getElementById('iconoMoneda');
    if (icono) icono.innerText = 'S/';

    const monedaSelect = document.getElementById('moneda');
    if (monedaSelect) {
        monedaSelect.addEventListener('change', function() {
            const iconoMoneda = document.getElementById('iconoMoneda');
            if (iconoMoneda) iconoMoneda.innerText = this.value === 'Soles' ? 'S/' : '$';
        });
    }

    const tipoGraciaSelect = document.getElementById('tipoGracia');
    if (tipoGraciaSelect) {
        tipoGraciaSelect.addEventListener('change', function() {
            const inputMeses = document.getElementById('mesesGracia');
            if (inputMeses) {
                if (this.value === 'Sin Gracia') {
                    inputMeses.value = 0;
                    inputMeses.disabled = true;
                    inputMeses.classList.add('bg-slate-100', 'text-slate-400');
                } else {
                    inputMeses.disabled = false;
                    inputMeses.classList.remove('bg-slate-100', 'text-slate-400');
                }
            }
        });
    }

    const btnSimular = document.getElementById('btnSimular');
    if (btnSimular) {
        btnSimular.addEventListener('click', async () => {
            const btnGuardar = document.getElementById('btnGuardar');
            const errorMessage = document.getElementById('errorMessage');
            
            btnSimular.innerText = "Calculando...";
            btnSimular.disabled = true;
            if (errorMessage) errorMessage.classList.add('hidden');

            const tipoGraciaElem = document.getElementById('tipoGracia');
            const mesesGraciaElem = document.getElementById('mesesGracia');
            const monedaElem = document.getElementById('moneda');
            const precioVehiculoElem = document.getElementById('precioVehiculo');
            const porcCuotaInicialElem = document.getElementById('porcCuotaInicial');
            const porcCuotaFinalElem = document.getElementById('porcCuotaFinal');
            const plazoMesesElem = document.getElementById('plazoMeses');
            const tipoTasaElem = document.getElementById('tipoTasa');
            const tasaInteresElem = document.getElementById('tasaInteres');
            const periodoCapitalizacionElem = document.getElementById('periodoCapitalizacion');
            const seguroDesgravamenElem = document.getElementById('seguroDesgravamen');
            const seguroVehicularElem = document.getElementById('seguroVehicular');
            const cokAnualElem = document.getElementById('cokAnual');

            const tGracia = tipoGraciaElem ? tipoGraciaElem.value : 'Sin Gracia';
            const mGraciaVal = mesesGraciaElem ? parseInt(mesesGraciaElem.value) || 0 : 0;

            ultimoPayload = {
                moneda: monedaElem ? monedaElem.value : 'Soles',
                precioVehiculo: precioVehiculoElem ? parseFloat(precioVehiculoElem.value) : 0,
                porcCuotaInicial: porcCuotaInicialElem ? parseFloat(porcCuotaInicialElem.value) / 100 : 0,
                porcCuotaFinal: porcCuotaFinalElem ? parseFloat(porcCuotaFinalElem.value) / 100 : 0,
                plazoMeses: plazoMesesElem ? parseInt(plazoMesesElem.value) : 0,
                tipoTasa: tipoTasaElem ? tipoTasaElem.value : 'Efectiva',
                tasaInteres: tasaInteresElem ? parseFloat(tasaInteresElem.value) / 100 : 0,
                capTasa: periodoCapitalizacionElem ? parseInt(periodoCapitalizacionElem.value) : 30,
                tasaDesgravamen: seguroDesgravamenElem ? parseFloat(seguroDesgravamenElem.value) / 100 : 0,
                montoSeguroVehic: seguroVehicularElem ? parseFloat(seguroVehicularElem.value) : 0,
                mesesGraciaTo: tGracia === 'Total' ? mGraciaVal : 0,
                mesesGraciaPa: tGracia === 'Parcial' ? mGraciaVal : 0,
                cokAnual: cokAnualElem ? parseFloat(cokAnualElem.value) / 100 : 0,
                guardar: false
            };

            if (isNaN(ultimoPayload.precioVehiculo) || isNaN(ultimoPayload.plazoMeses)) {
                if (errorMessage) {
                    errorMessage.innerText = "Error: Verifica que los campos numéricos tengan valores válidos.";
                    errorMessage.classList.remove('hidden');
                }
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
                    body: JSON.stringify(ultimoPayload)
                });

                const data = await response.json();

                if (response.ok) {
                    const res = data.resumen;
                    const cronograma = data.cronograma || [];
                    const simbolo = ultimoPayload.moneda === 'Soles' ? 'S/' : '$';

                    const resCuota = document.getElementById('resCuota');
                    const resInteres = document.getElementById('resInteres');
                    const resCuotaFinal = document.getElementById('resCuotaFinal');
                    const resVAN = document.getElementById('resVAN');
                    const resTCEA = document.getElementById('resTCEA');
                    const resTIR = document.getElementById('resTIR');

                    if (resCuota) resCuota.innerText = `${simbolo} ${parseFloat(res.cuotaMensual || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    if (resInteres) resInteres.innerText = `${simbolo} ${parseFloat(res.interesTotal || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    if (resCuotaFinal) resCuotaFinal.innerText = `${simbolo} ${parseFloat(res.montoCuotaFin || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    
                    if (resVAN) {
                        resVAN.innerText = `${simbolo} ${parseFloat(res.van || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        if (res.van < 0) resVAN.classList.add('text-red-500'); else resVAN.classList.remove('text-red-500');
                    }

                    if (resTCEA) resTCEA.innerText = `${(parseFloat(res.tcea || 0) * 100).toFixed(4)}%`;
                    if (resTIR) resTIR.innerText = `${(parseFloat(res.tir || 0) * 100).toFixed(4)}%`;

                    if (btnGuardar) btnGuardar.classList.remove('hidden');
                    
                    if (cronograma.length > 0) {
                        const container = document.getElementById('cronogramaContainer');
                        if (container) container.classList.remove('hidden');
                        const tabla = document.getElementById('tablaCronograma');
                        if (tabla) {
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
                                    <tr class="hover:bg-slate-50 transition">
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
                    }
                } else {
                    if (errorMessage) {
                        errorMessage.innerText = "Error: " + (data.mensaje || "Revisa los datos ingresados.");
                        errorMessage.classList.remove('hidden');
                    }
                }
            } catch (error) {
                console.error(error);
                if (errorMessage) {
                    errorMessage.innerText = "Error de conexión con el servidor.";
                    errorMessage.classList.remove('hidden');
                }
            } finally {
                btnSimular.innerText = "Simular";
                btnSimular.disabled = false;
            }
        });
    }

    const btnGuardar = document.getElementById('btnGuardar');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async () => {
            if (!ultimoPayload) return;
            
            btnGuardar.innerText = "Guardando...";
            btnGuardar.disabled = true;

            ultimoPayload.guardar = true;

            try {
                const response = await fetch(`${API_URL}/simular`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(ultimoPayload)
                });

                if (response.ok) {
                    window.location.href = 'inicio_cliente.html';
                } else {
                    alert("Hubo un problema al guardar la simulación.");
                    btnGuardar.innerText = "Guardar simulación";
                    btnGuardar.disabled = false;
                }
            } catch (error) {
                console.error(error);
                alert("Error de red al guardar la simulación.");
                btnGuardar.innerText = "Guardar simulación";
                btnGuardar.disabled = false;
            }
        });
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

    const canvas = document.getElementById('evolucionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    miGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Saldo Pendiente', data: saldos, borderColor: '#3b82f6', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.3 },
                { label: 'Amort. Acumulada', data: amortizacionData, borderColor: '#22c55e', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.3 },
                { label: 'Interés Acumulado', data: interesData, borderColor: '#eab308', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.3 }
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