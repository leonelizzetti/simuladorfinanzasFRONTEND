document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('numDoc').value;
    const nombres = document.getElementById('nombres').value;
    const apellidos = document.getElementById('apellidos').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const rol = document.getElementById('rol').value;
    
    const errorMessage = document.getElementById('errorMessage');
    const btnSubmit = document.getElementById('btnSubmit');

    if (password !== confirmPassword) {
        errorMessage.innerText = "Las contraseñas no coinciden.";
        errorMessage.style.display = "block";
        return;
    }

    btnSubmit.innerText = "Registrando...";
    btnSubmit.style.opacity = "0.7";
    btnSubmit.disabled = true;
    errorMessage.style.display = "none";

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                nombres: nombres,
                apellidos: apellidos,
                correo: correo,
                telefono: telefono,
                rol: rol,
                estado: "activo"
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("¡Cuenta creada exitosamente!");
            window.location.href = 'index.html';
        } else {
            errorMessage.innerText = "❌ " + (data.mensaje || "Error al crear la cuenta");
            errorMessage.style.display = "block";
        }
    } catch (error) {
        errorMessage.innerText = "⚠️ Mira la consola (F12) para ver el error exacto.";
        errorMessage.style.display = "block";
    } finally {
        btnSubmit.innerText = "Registrarme";
        btnSubmit.style.opacity = "1";
        btnSubmit.disabled = false;
    }
});