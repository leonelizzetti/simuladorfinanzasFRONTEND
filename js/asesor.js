document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token || rol === 'cliente') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('userNameDisplay').innerText = username.toUpperCase();
    }
});

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

document.getElementById('clienteDataForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const clientData = {
        dni: document.getElementById('clientDni').value,
        nombres: document.getElementById('clientNombres').value,
        apellidos: document.getElementById('clientApellidos').value,
        correo: document.getElementById('clientCorreo').value
    };

    localStorage.setItem('currentClientData', JSON.stringify(clientData));

    window.location.href = 'simulador.html';
});