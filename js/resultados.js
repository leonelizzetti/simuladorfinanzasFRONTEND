document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const resultadoStr = localStorage.getItem('resultadoSimulacion');

    if (!token || !resultadoStr) {
        window.location.href = 'index.html';
        return;
    }

    if (username) {
        document.getElementById('userNameDisplay').innerText = username.toUpperCase();
    }

    const data = JSON.parse(resultadoStr);

    const formatoMoneda = (num) => {
        return parseFloat(num).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatoPorcentaje = (num) => {
        return (parseFloat(num) * 100).toFixed(2) + '%';
    };

    const mon = data.moneda === 'Dolares' ? '$ ' : 'S/ ';

    document.getElementById('valMonto').innerText = mon + formatoMoneda(data.monto_financiar || 0);
    document.getElementById('valTcea').innerText = formatoPorcentaje(data.tcea || 0);
    document.getElementById('valVan').innerText = mon + formatoMoneda(data.van || 0);
    document.getElementById('valTir').innerText = formatoPorcentaje(data.tir || 0);

    const tbody = document.getElementById('cronogramaBody');
    tbody.innerHTML = '';

    if (data.cronograma && Array.isArray(data.cronograma)) {
        data.cronograma.forEach(fila => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 transition";
            tr.innerHTML = `
                <td class="px-6 py-4 font-bold text-gray-900">${fila.numero}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.saldo_inicial)}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.amortizacion)}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.interes)}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.seguro_desgravamen)}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.seguro_vehicular)}</td>
                <td class="px-6 py-4 font-bold text-blue-700">${formatoMoneda(fila.cuota)}</td>
                <td class="px-6 py-4 font-semibold text-gray-600">${formatoMoneda(fila.flujo)}</td>
                <td class="px-6 py-4">${formatoMoneda(fila.saldo_final)}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-8 text-center text-red-500">No se pudo generar el cronograma. Verifica los datos enviados.</td></tr>`;
    }
});

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});