document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token || rol === 'CLIENTE') {
        window.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idSimulacion = urlParams.get('id');

    if (!idSimulacion) {
        window.location.href = 'solicitudes.html';
        return;
    }

    await cargarDetalleSolicitud(idSimulacion, token);
});

async function cargarDetalleSolicitud(id, token) {
    try {
        const response = await fetch(`${API_URL}/simular/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.exito) {
            pintarDatos(data.simulacion);
            dibujarGraficoNativo(data.cronograma);
            configurarBotonesAccion(id, token);
        } else {
            alert("Error al cargar la solicitud");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

function pintarDatos(sim) {
    const formatoMoneda = (num) => 'S/ ' + parseFloat(num).toLocaleString('es-PE', { minimumFractionDigits: 2 });
    
    // Aquí enlazas los IDs de tu HTML con la data que viene de MySQL
    // Ejemplo (asegúrate de ponerle estos id's a los elementos de tu HTML):
    document.getElementById('lblIdSimulacion').innerText = sim.id_simulacion;
    document.getElementById('lblPlazo').innerText = `${sim.plazo_meses} meses`
    document.getElementById('lblMontoFinanciado').innerText = formatoMoneda(sim.monto_financiar);
    document.getElementById('lblTCEA').innerText = (parseFloat(sim.tcea) * 100).toFixed(2) + '%';
    document.getElementById('lblVAN').innerText = formatoMoneda(sim.van);
    document.getElementById('lblTIR').innerText = (parseFloat(sim.tir) * 100).toFixed(2) + '%';
    document.getElementById('lblCuotaMensual').innerText = formatoMoneda(sim.monto_cuota);
    
    // Estado (requiere el cambio en la BD mencionado arriba)
    const estado = sim.estado || 'Pendiente';
    document.getElementById('lblEstado').innerText = estado;
}

function configurarBotonesAccion(id, token) {
    // Lógica para el botón de aprobar
    document.getElementById('btnAprobar').addEventListener('click', () => cambiarEstado(id, 'Aprobado', token));
    // Lógica para el botón de rechazar
    document.getElementById('btnRechazar').addEventListener('click', () => cambiarEstado(id, 'Rechazado', token));
}

async function cambiarEstado(id, nuevoEstado, token) {
    if(!confirm(`¿Seguro que deseas marcar esta solicitud como ${nuevoEstado}?`)) return;

    const response = await fetch(`${API_URL}/simulacion/${id}/estado`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
    });

    if (response.ok) {
        alert(`Solicitud ${nuevoEstado} exitosamente`);
        window.location.reload();
    }
}

function dibujarGraficoNativo(cronograma) {
    const canvas = document.getElementById('evolucionAsesorCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Ajustar dimensiones
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const padding = 20;
    const maxSaldo = Math.max(...cronograma.map(c => c.saldo_final));
    
    // Dibujar línea de evolución de saldo usando Canvas puro
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6'; // Azul Tailwind
    ctx.lineWidth = 3;

    cronograma.forEach((c, i) => {
        const x = padding + (i / (cronograma.length - 1)) * (width - padding * 2);
        // Invertir Y para que los valores altos estén arriba
        const y = height - padding - ((c.saldo_final / maxSaldo) * (height - padding * 2)); 
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
}