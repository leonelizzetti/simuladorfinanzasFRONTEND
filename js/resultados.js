document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('username');
    if (username) {
        const el = document.getElementById('userNameDisplay');
        if (el) el.innerText = username.toUpperCase();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        await cargarSimulacionPorId(id, token);
    } else {
        const resultadoStr = localStorage.getItem('resultadoSimulacionTemporal');
        if (resultadoStr) {
            renderizarDatos(JSON.parse(resultadoStr));
        } else {
            window.location.href = 'inicio_cliente.html';
        }
    }
});

async function cargarSimulacionPorId(id, token) {
    try {
        const response = await fetch(`${API_URL}/simular/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
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
        window.location.href = 'inicio_cliente.html';
    }
}

function renderizarDatos(data) {
    const formatoMoneda = (num) => 'S/ ' + parseFloat(num).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatoPorcentaje = (num) => (parseFloat(num) * 100).toFixed(2) + '%';
    const mon = data.moneda === 'Dolares' ? '$ ' : 'S/ ';

    // Actualizar tarjetas de resumen
    const valMonto = document.getElementById('valMonto');
    const valTcea = document.getElementById('valTcea');
    const valVan = document.getElementById('valVan');
    const valTir = document.getElementById('valTir');

    if (valMonto) valMonto.innerText = mon + formatoMoneda(data.monto_financiar || 0).replace('S/ ', '');
    if (valTcea) valTcea.innerText = formatoPorcentaje(data.tcea || 0);
    if (valVan) valVan.innerText = mon + formatoMoneda(data.van || 0).replace('S/ ', '');
    if (valTir) valTir.innerText = formatoPorcentaje(data.tir || 0);

    // Llenar cronograma
    const tbody = document.getElementById('cronogramaBody');
    if (tbody && data.cronograma) {
        tbody.innerHTML = '';
        data.cronograma.forEach(fila => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 transition";
            tr.innerHTML = `
                <td class="px-6 py-4 font-bold text-gray-900">${fila.num_cuota || fila.numero}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.saldo_inicial).replace('S/ ', '')}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.amortizacion).replace('S/ ', '')}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.interes).replace('S/ ', '')}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.seguro_desgravamen).replace('S/ ', '')}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.seguro_vehicular).replace('S/ ', '')}</td>
                <td class="px-6 py-4 font-bold text-blue-700">${formatoMoneda(fila.cuota).replace('S/ ', '')}</td>
                <td class="px-6 py-4 font-semibold text-gray-600">${formatoMoneda(fila.flujo_caja_neto || fila.flujo).replace('S/ ', '')}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.saldo_final).replace('S/ ', '')}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}