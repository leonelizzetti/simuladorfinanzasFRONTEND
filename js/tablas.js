document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    let nombre = localStorage.getItem('nombreReal');
    if (!nombre || nombre === 'null' || nombre === 'undefined' || nombre.trim() === '') {
        nombre = localStorage.getItem('username');
    }
    if (!nombre || nombre === 'null' || nombre === 'undefined' || nombre.trim() === '') {
        nombre = 'Cliente';
    }

    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.innerText = nombre;

    await cargarSimulaciones();
});

async function cargarSimulaciones() {
    try {
        const response = await fetch(`${API_URL}/simulaciones`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        const tabla = document.getElementById('tablaMisSimulaciones');
        
        if (response.ok && data.exito) {
            const simulaciones = data.datos || [];
            
            if (tabla) {
                tabla.innerHTML = '';
                if (simulaciones.length === 0) {
                    tabla.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No hay simulaciones guardadas.</td></tr>`;
                    return;
                }

                simulaciones.forEach(sim => {
                    const simbolo = sim.moneda === 'Soles' ? 'S/' : '$';
                    tabla.innerHTML += `
                        <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                            <td class="px-4 py-4 font-mono text-gray-500 text-xs">#${sim.id_simulacion}</td>
                            <td class="px-4 py-4 font-medium text-gray-800">Auto Cotizado</td>
                            <td class="px-4 py-4 font-bold text-gray-800">${simbolo} ${parseFloat(sim.monto_financiar).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td class="px-4 py-4 text-gray-600">${sim.plazo_meses} Meses</td>
                            <td class="px-4 py-4"><span class="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[11px] font-bold">Guardada</span></td>
                            <td class="px-4 py-4 flex gap-2">
                                <a href="resultados.html?id=${sim.id_simulacion}" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-md transition" title="Ver Detalle">
                                    <i class="fa-solid fa-eye"></i>
                                </a>
                                <button onclick="eliminarSimulacion(${sim.id_simulacion})" class="text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-md transition" title="Eliminar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
}

window.eliminarSimulacion = async function(id) {
    if(!confirm("¿Estás seguro que deseas eliminar esta simulación?")) return;

    try {
        const response = await fetch(`${API_URL}/simulacion/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            cargarSimulaciones();
        } else {
            alert("Hubo un error al eliminar.");
        }
    } catch (error) {
        console.error(error);
    }
};

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}