document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const username = localStorage.getItem('username');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const userNameDisplays = document.querySelectorAll('#userNameDisplay');
    userNameDisplays.forEach(el => el.innerText = username ? username.toUpperCase() : 'USUARIO');

    const roleDisplay = document.getElementById('userRoleDisplay');
    if(roleDisplay) roleDisplay.innerText = rol.toUpperCase();

    const tablaCliente = document.getElementById('tablaSimulaciones');
    if (tablaCliente && rol === 'cliente') {
        const simData = localStorage.getItem('resultadoSimulacion');
        if(simData) {
            const data = JSON.parse(simData);
            tablaCliente.innerHTML = `
                <tr>
                    <td>#SIM-001</td>
                    <td>Auto Seleccionado</td>
                    <td>S/ ${data.monto_financiar ? data.monto_financiar.toLocaleString('es-PE') : '0.00'}</td>
                    <td><span class="status-badge revision">En Revisión</span></td>
                    <td><a href="resultados.html" class="action-link">Ver Cronograma</a></td>
                </tr>
            `;
        } else {
            tablaCliente.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #718096;">No tienes simulaciones recientes.</td></tr>`;
        }
    }

    const tablaAdmin = document.getElementById('tablaSolicitudesAdmin');
    if (tablaAdmin && (rol === 'asesor' || rol === 'administrador')) {
        const simData = localStorage.getItem('resultadoSimulacion');
        if(simData) {
            const data = JSON.parse(simData);
            tablaAdmin.innerHTML = `
                <tr>
                    <td>#SOL-099</td>
                    <td>Cliente Registrado</td>
                    <td>Vehículo Estándar</td>
                    <td>S/ ${data.monto_financiar ? data.monto_financiar.toLocaleString('es-PE') : '0.00'}</td>
                    <td><span class="status-badge pendiente">Pendiente</span></td>
                    <td><a href="resultados.html" class="action-link">Evaluar</a></td>
                </tr>
            `;
        } else {
            tablaAdmin.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #718096;">No hay solicitudes nuevas. Registra un cliente primero.</td></tr>`;
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