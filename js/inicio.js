document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('username');
    const nombreReal = localStorage.getItem('nombreReal');
    
    const displayNombre = (nombreReal && nombreReal !== 'null' && nombreReal !== 'undefined' && nombreReal.trim() !== '') 
        ? nombreReal 
        : (username || 'Cliente');

    const topUserName = document.getElementById('topUserName');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (topUserName) topUserName.innerText = displayNombre;
    if (welcomeMessage) welcomeMessage.innerText = `Bienvenido, ${displayNombre}`;

    try {
        const response = await fetch(`${API_URL}/simulaciones`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.exito) {
            const simulaciones = data.datos || [];
            
            // FIlTRADO REAL DE ESTADOS
            const aprobados = simulaciones.filter(s => s.estado === 'Aprobado');
            const rechazados = simulaciones.filter(s => s.estado === 'Rechazado');
            const pendientes = simulaciones.filter(s => !s.estado || s.estado === 'Pendiente');

            const countGuardadas = document.getElementById('countGuardadas');
            const countEnviadas = document.getElementById('countEnviadas');
            const countAprobados = document.getElementById('countAprobados');

            const statTotal = document.getElementById('statTotal');
            const statPendientes = document.getElementById('statPendientes');
            const statAprobado = document.getElementById('statAprobado');
            const statRechazado = document.getElementById('statRechazado');
            
            // Llenamos las tarjetas de arriba
            if (countGuardadas) countGuardadas.innerText = simulaciones.length;
            if (countEnviadas) countEnviadas.innerText = simulaciones.length;
            if (countAprobados) countAprobados.innerText = aprobados.length;

            // Llenamos la tablita derecha de estados
            if (statTotal) statTotal.innerText = simulaciones.length;
            if (statPendientes) statPendientes.innerText = pendientes.length;
            if (statAprobado) statAprobado.innerText = aprobados.length;
            if (statRechazado) statRechazado.innerText = rechazados.length;
            
            if (simulaciones.length > 0) {
                const mejorOpcion = simulaciones.reduce((prev, curr) => (parseFloat(prev.tcea) < parseFloat(curr.tcea) ? prev : curr));
                const simbolo = mejorOpcion.moneda === 'Soles' ? 'S/' : '$';
                
                const bestOptionAmount = document.getElementById('bestOptionAmount');
                const bestOptionTCEA = document.getElementById('bestOptionTCEA');
                
                if (bestOptionAmount) bestOptionAmount.innerText = `${simbolo} ${parseFloat(mejorOpcion.monto_financiar).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                if (bestOptionTCEA) bestOptionTCEA.innerText = `TCEA ${(parseFloat(mejorOpcion.tcea) * 100).toFixed(4)}%`;
            }

            const tabla = document.getElementById('tablaSimulaciones');
            if (tabla) {
                tabla.innerHTML = '';
                if (simulaciones.length === 0) {
                    tabla.innerHTML = `<tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Aún no has guardado ninguna simulación.</td></tr>`;
                } else {
                    const recientes = simulaciones.slice(0, 5);
                    recientes.forEach(sim => {
                        const simbolo = sim.moneda === 'Soles' ? 'S/' : '$';
                        const estado = sim.estado || 'Pendiente';
                        const badgeColor = estado === 'Aprobado' ? 'bg-green-100 text-green-700' : estado === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-600';

                        tabla.innerHTML += `
                            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                                <td class="px-4 py-4 font-medium text-gray-800">Auto Cotizado</td>
                                <td class="px-4 py-4 text-gray-600">${sim.moneda}</td>
                                <td class="px-4 py-4 font-bold text-gray-800">${simbolo} ${parseFloat(sim.monto_financiar).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td class="px-4 py-4"><span class="px-2 py-1 ${badgeColor} rounded-md text-[11px] font-bold">${estado}</span></td>
                                <td class="px-4 py-4 text-blue-600 font-medium">
                                    <a href="resultados.html?id=${sim.id_simulacion}" class="hover:underline">Ver <i class="fa-solid fa-arrow-right text-xs"></i></a>
                                </td>
                            </tr>
                        `;
                    });
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
});

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}