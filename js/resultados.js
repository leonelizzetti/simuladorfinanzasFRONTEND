let miGrafico = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('username');
    const nombreReal = localStorage.getItem('nombreReal');
    
    const displayNombre = (nombreReal && nombreReal !== 'null' && nombreReal.trim() !== '') 
        ? nombreReal 
        : (username || 'Usuario');

    const el = document.getElementById('userNameDisplay');
    if (el) el.innerText = displayNombre.toUpperCase();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        await cargarSimulacionPorId(id, token);
    } else {
        const resultadoStr = localStorage.getItem('resultadoSimulacionTemporal');
        if (resultadoStr) {
            renderizarDatos(JSON.parse(resultadoStr));
        } else {
            window.location.href = rol === 'asesor' ? 'inicio_asesor.html' : 'inicio_cliente.html';
        }
    }
});

async function cargarSimulacionPorId(id, token) {
    try {
        const response = await fetch(`${API_URL}/simular/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("No se pudo cargar la simulación");

        const data = await response.json();
        
        if (data.simulacion) {
            data.simulacion.cronograma = data.cronograma; 
            renderizarDatos(data.simulacion);
        } else {
            throw new Error("Formato de datos incorrecto");
        }
        
    } catch (error) {
        console.error(error);
        alert("Error al cargar los detalles.");
        const rol = localStorage.getItem('rol');
        window.location.href = rol === 'asesor' ? 'inicio_asesor.html' : 'inicio_cliente.html';
    }
}

function renderizarDatos(data) {
    const formatoMoneda = (num) => parseFloat(num).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatoPorcentaje = (num) => (parseFloat(num) * 100).toFixed(2) + '%';
    const simbolo = data.moneda === 'Dolares' ? '$' : 'S/';

    const valMonto = document.getElementById('valMonto') || document.getElementById('resMonto');
    const valTcea = document.getElementById('valTcea') || document.getElementById('resTCEA');
    const valVan = document.getElementById('valVan') || document.getElementById('resVAN');
    const valTir = document.getElementById('valTir') || document.getElementById('resTIR');
    const valCuota = document.getElementById('resCuota'); 

    if (valMonto) valMonto.innerText = `${simbolo} ${formatoMoneda(data.monto_financiar || 0)}`;
    if (valTcea) valTcea.innerText = formatoPorcentaje(data.tcea || 0);
    if (valVan) valVan.innerText = `${simbolo} ${formatoMoneda(data.van || 0)}`;
    if (valTir) valTir.innerText = formatoPorcentaje(data.tir || 0);

    const tbody = document.getElementById('cronogramaBody') || document.getElementById('tablaCronograma');
    if (tbody && data.cronograma) {
        tbody.innerHTML = '';
        let primeraCuotaPura = 0;

        data.cronograma.forEach((fila, index) => {
            const sInicial = parseFloat(fila.saldo_inicial || fila.saldoInicial || 0);
            const interes = parseFloat(fila.interes || 0);
            const amort = parseFloat(fila.amortizacion || 0);
            const sDesg = parseFloat(fila.seguro_desgravamen || fila.seguroDesgravamen || 0);
            const sVehic = parseFloat(fila.seguro_vehicular || fila.seguroVehicular || 0);
            const sFinal = parseFloat(fila.saldo_final || fila.saldoFinal || 0);
            const flujoCaja = parseFloat(fila.flujo_caja_neto || fila.flujoCajaNeto || 0);

            const segurosTotal = sDesg + sVehic;
            const cuotaTotal = parseFloat(fila.cuota || 0); 
            const cuotaPura = cuotaTotal - segurosTotal;

            if (index === 0) primeraCuotaPura = cuotaPura;

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 transition border-b border-gray-100";
            tr.innerHTML = `
                <td class="px-4 py-3 font-bold text-gray-900">${fila.num_cuota || fila.numeroCuota || index + 1}</td>
                <td class="px-4 py-3">${formatoMoneda(sInicial)}</td>
                <td class="px-4 py-3">${formatoMoneda(interes)}</td>
                <td class="px-4 py-3">${formatoMoneda(cuotaPura)}</td>
                <td class="px-4 py-3">${formatoMoneda(segurosTotal)}</td>
                <td class="px-4 py-3">${formatoMoneda(amort)}</td>
                <td class="px-4 py-3 font-bold text-blue-700">${formatoMoneda(cuotaTotal)}</td>
                <td class="px-4 py-3">${formatoMoneda(sFinal)}</td>
                <td class="px-4 py-3 font-semibold text-red-600">${formatoMoneda(flujoCaja)}</td>
            `;
            tbody.appendChild(tr);
        });

        if (valCuota) valCuota.innerText = `${simbolo} ${formatoMoneda(primeraCuotaPura)}`;
        
        dibujarGrafico(data.cronograma);
    }
}

function dibujarGrafico(cronograma) {
    const canvas = document.getElementById('evolucionChart');
    if (!canvas) return;

    if (miGrafico) miGrafico.destroy();

    const labels = cronograma.map(c => `Mes ${c.num_cuota || c.numeroCuota}`);
    const saldos = cronograma.map(c => parseFloat(c.saldo_final || c.saldoFinal || 0));
    
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
                legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 }, padding: 15 } }
            },
            scales: {
                x: { display: false },
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
            }
        }
    });
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}