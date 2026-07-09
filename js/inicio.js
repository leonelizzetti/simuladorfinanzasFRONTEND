document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const username = localStorage.getItem('username');
    const nombreReal = localStorage.getItem('nombreReal') || username; 

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const topUserName = document.getElementById('topUserName');
    if (topUserName) topUserName.innerText = nombreReal;

    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) welcomeMessage.innerText = `Bienvenido, ${nombreReal}`;

    const tablaSimulaciones = document.getElementById('tablaSimulaciones');
    
    if (tablaSimulaciones && rol === 'cliente') {
        const simDataStr = localStorage.getItem('resultadoSimulacion');
        
        if (simDataStr) {
            const data = JSON.parse(simDataStr);
            const monto = parseFloat(data.monto_financiar);
            
            document.getElementById('countGuardadas').innerText = "1"; 
            document.getElementById('countEnviadas').innerText = "1";
            document.getElementById('countAprobados').innerText = "0";
            document.getElementById('statPendientes').innerText = "1";
            document.getElementById('statTotal').innerText = "1";

            document.getElementById('bestOptionAmount').innerText = data.moneda === 'Soles' ? `S/ ${monto.toLocaleString('es-PE')}` : `$ ${monto.toLocaleString('en-US')}`;
            document.getElementById('bestOptionTCEA').innerText = `Tasa int: ${data.tasaInteres}%`;

            tablaSimulaciones.innerHTML = `
                <tr class="hover:bg-gray-50 transition">
                    <td class="px-4 py-4 font-medium text-gray-800">Auto Cotizado</td>
                    <td class="px-4 py-4 text-gray-600">${data.moneda || 'Soles'}</td>
                    <td class="px-4 py-4 font-semibold text-gray-800">${data.moneda === 'Soles' ? 'S/' : '$'} ${monto.toLocaleString('es-PE')}</td>
                    <td class="px-4 py-4">
                        <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">Pendiente</span>
                    </td>
                    <td class="px-4 py-4">
                        <a href="resultados.html" class="text-blue-600 hover:text-blue-800 font-medium text-sm">Ver Detalle</a>
                    </td>
                </tr>
            `;
        } else {
            document.getElementById('countGuardadas').innerText = "0"; 
            document.getElementById('countEnviadas').innerText = "0";
            document.getElementById('countAprobados').innerText = "0";
            document.getElementById('statPendientes').innerText = "0";
            document.getElementById('statTotal').innerText = "0";
            document.getElementById('bestOptionAmount').innerText = "S/ 0.00";
            document.getElementById('bestOptionTCEA').innerText = "-";

            tablaSimulaciones.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-10 text-gray-500 text-sm">No tienes simulaciones recientes. ¡Crea una nueva!</td>
                </tr>
            `;
        }
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});