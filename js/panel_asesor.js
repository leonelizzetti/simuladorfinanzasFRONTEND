document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token || rol === 'CLIENTE') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('username');
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay && username) {
        userNameDisplay.innerText = username.toUpperCase();
    }

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
            
            // Invocamos explícitamente cada función de actualización
            actualizarInicioAsesor(simulaciones);
            llenarTablaSolicitudes(simulaciones);
            actualizarDirectorioClientes(simulaciones);
            actualizarResultadosAsesor(simulaciones);
        }
    } catch (error) {
        console.error("Error al conectar con la API de simulaciones:", error);
    }
});

function actualizarInicioAsesor(simulaciones) {
    const tbody = document.getElementById('tablaSolicitudesAdmin');
    if (!tbody) return; // Si no estamos en inicio_asesor.html, no hace nada aquí

    const pendientes = simulaciones.filter(s => !s.estado || s.estado === 'Pendiente');
    const aprobados = simulaciones.filter(s => s.estado === 'Aprobado');
    const rechazados = simulaciones.filter(s => s.estado === 'Rechazado');
    const montoTotal = simulaciones.reduce((acc, curr) => acc + parseFloat(curr.monto_financiar || 0), 0);

    setInnerText('statAsesorPendientes', pendientes.length);
    setInnerText('statAsesorAprobados', aprobados.length);
    setInnerText('statAsesorRechazados', rechazados.length);
    setInnerText('statAsesorMontoTotal', 'S/ ' + montoTotal.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2}));

    tbody.innerHTML = '';
    const recientes = simulaciones.slice(0, 6);
    
    if (recientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-4 text-center text-gray-500">No hay solicitudes recientes.</td></tr>`;
        return;
    }

    recientes.forEach(sim => {
        const estado = sim.estado || 'Pendiente';
        const badgeClass = estado === 'Aprobado' ? 'aprobado' : estado === 'Rechazado' ? 'pendiente' : 'revision';
        const simbolo = sim.moneda === 'Soles' ? 'S/' : '$';
        
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition border-b border-gray-100 text-sm">
                <td class="px-5 py-4 font-mono text-xs">#${sim.id_simulacion}</td>
                <td class="px-5 py-4">Cliente #${sim.id_usuario}</td>
                <td class="px-5 py-4 font-medium text-gray-800">Auto Cotizado</td>
                <td class="px-5 py-4 font-bold text-gray-800">${simbolo} ${parseFloat(sim.monto_financiar || 0).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="px-5 py-4"><span class="status-badge ${badgeClass}">${estado}</span></td>
                <td class="px-5 py-4"><a href="detalle_solicitud.html?id=${sim.id_simulacion}" class="text-blue-600 font-bold hover:underline text-xs">Revisar</a></td>
            </tr>
        `;
    });
}

function llenarTablaSolicitudes(simulaciones) {
    const tbody = document.getElementById('tablaSolicitudesAsesor'); 
    if(!tbody) return;

    tbody.innerHTML = '';
    if(simulaciones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">No hay solicitudes registradas</td></tr>`;
        return;
    }

    simulaciones.forEach(sim => {
        const estadoLabel = sim.estado || 'Pendiente';
        const colorEstado = estadoLabel === 'Aprobado' ? 'bg-green-100 text-green-700' : 
                            estadoLabel === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-600';
        const simbolo = sim.moneda === 'Soles' ? 'S/' : '$';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-sm">
                <td class="px-4 py-4 font-mono text-gray-500 text-xs">#${sim.id_simulacion}</td>
                <td class="px-4 py-4">Cliente #${sim.id_usuario}</td>
                <td class="px-4 py-4 font-medium text-gray-800">Auto Cotizado</td>
                <td class="px-4 py-4 font-bold text-gray-800">${simbolo} ${parseFloat(sim.monto_financiar).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="px-4 py-4"><span class="px-2 py-1 ${colorEstado} text-xs font-bold rounded">${estadoLabel}</span></td>
                <td class="px-4 py-4"><a href="detalle_solicitud.html?id=${sim.id_simulacion}" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-md transition font-bold text-xs">Evaluar</a></td>
            </tr>
        `;
    });
}

function actualizarDirectorioClientes(simulaciones) {
    const tbody = document.getElementById('tablaDirectorioClientes');
    if (!tbody) return;

    const aprobados = simulaciones.filter(s => s.estado === 'Aprobado').length;
    const pendientes = simulaciones.filter(s => !s.estado || s.estado === 'Pendiente').length;
    const rechazados = simulaciones.filter(s => s.estado === 'Rechazado').length;

    setInnerText('statClientesTotal', simulaciones.length);
    setInnerText('statClientesAprobados', aprobados);
    setInnerText('statClientesPendientes', pendientes);
    setInnerText('statClientesRechazados', rechazados);

    tbody.innerHTML = '';
    simulaciones.forEach(sim => {
        const estado = sim.estado || 'Pendiente';
        const simbolo = sim.moneda === 'Soles' ? 'S/' : '$';
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 text-sm">
                <td class="px-5 py-4 font-mono text-xs">#${sim.id_simulacion}</td>
                <td class="px-5 py-4 font-medium">Cliente #${sim.id_usuario}</td>
                <td class="px-5 py-4">${sim.moneda}</td>
                <td class="px-5 py-4 font-bold">${simbolo} ${parseFloat(sim.monto_financiar || 0).toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-5 py-4"><span class="px-2 py-1 text-xs font-bold rounded ${estado === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}">${estado}</span></td>
                <td class="px-5 py-4 text-center"><a href="detalle_solicitud.html?id=${sim.id_simulacion}" class="text-blue-600 font-bold hover:underline text-xs">Ver detalles</a></td>
            </tr>
        `;
    });
}

function actualizarResultadosAsesor(simulaciones) {
    const tbody = document.getElementById('tablaUltimosAprobados');
    if (!tbody) return;

    const aprobados = simulaciones.filter(s => s.estado === 'Aprobado');
    const rechazados = simulaciones.filter(s => s.estado === 'Rechazado');
    const montoFinanciado = aprobados.reduce((acc, curr) => acc + parseFloat(curr.monto_financiar || 0), 0);

    setInnerText('statResTotal', simulaciones.length);
    setInnerText('statResAprobados', aprobados.length);
    setInnerText('statResRechazados', rechazados.length);
    setInnerText('statResMonto', 'S/ ' + montoFinanciado.toLocaleString('es-PE', {minimumFractionDigits: 2}));

    tbody.innerHTML = '';
    aprobados.forEach(sim => {
        const simbolo = sim.moneda === 'Soles' ? 'S/' : '$';
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 text-sm">
                <td class="px-5 py-4 font-medium">Cliente #${sim.id_usuario} (#${sim.id_simulacion})</td>
                <td class="px-5 py-4">${simbolo} ${parseFloat(sim.monto_financiar || 0).toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-5 py-4">${(parseFloat(sim.tcea || 0) * 100).toFixed(2)}%</td>
                <td class="px-5 py-4">${sim.plazo_meses} meses</td>
                <td class="px-5 py-4 font-semibold">${simbolo} ${parseFloat(sim.monto_cuota || 0).toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-5 py-4"><span class="bg-green-100 text-green-700 px-2 py-1 text-xs font-bold rounded">Aprobado</span></td>
                <td class="px-5 py-4"><a href="detalle_solicitud.html?id=${sim.id_simulacion}" class="text-blue-600 font-bold hover:underline text-xs">Ver detalle</a></td>
            </tr>
        `;
    });
}

function setInnerText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}