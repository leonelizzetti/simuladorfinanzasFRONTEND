document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'index.html'; return; }

    const username = localStorage.getItem('username');
    if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').innerText = username.toUpperCase();

    const simData = localStorage.getItem('resultadoSimulacion');
    const formatMoneda = (num) => 'S/ ' + parseFloat(num).toLocaleString('es-PE', {minimumFractionDigits: 2});

    const tbodyMisSim = document.getElementById('tablaMisSimulaciones');
    if (tbodyMisSim) {
        if (simData) {
            const data = JSON.parse(simData);
            tbodyMisSim.innerHTML = `<tr><td class="py-4">#SIM-001</td><td>Auto Seleccionado</td><td>${formatMoneda(data.monto_financiar)}</td><td>${data.cronograma.length} meses</td><td><span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">En Revisión</span></td><td><a href="resultados.html" class="text-blue-600 font-bold hover:underline">Ver Cronograma</a></td></tr>`;
        } else {
            tbodyMisSim.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">No hay simulaciones guardadas</td></tr>`;
        }
    }

    const tbodySol = document.getElementById('tablaSolicitudes');
    if (tbodySol) {
        if (simData) {
            const data = JSON.parse(simData);
            tbodySol.innerHTML = `<tr><td class="py-4">#SOL-099</td><td>Cliente Demo</td><td>Vehículo Estándar</td><td>${formatMoneda(data.monto_financiar)}</td><td><span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">Pendiente</span></td><td><a href="resultados.html" class="text-blue-600 font-bold hover:underline">Evaluar</a></td></tr>`;
        } else {
            tbodySol.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">No hay solicitudes pendientes</td></tr>`;
        }
    }
});

const btnLogout = document.getElementById('btnLogout');
if(btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}