document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const btnSubmit = document.getElementById('btnSubmit');

    btnSubmit.innerText = "Verificando...";
    btnSubmit.style.opacity = "0.7";
    btnSubmit.disabled = true; 
    errorMessage.style.display = "none";

    // Llamada al reCAPTCHA V3
    grecaptcha.ready(function() {
        grecaptcha.execute('6LcxMEstAAAAAA4BUTprxjft4vNMVIXy0RofoZ8K', {action: 'login'})
        .then(async function(token) {
            
            try {
                const response = await fetch('https://simulador-backend-grupo.onrender.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        recaptchaToken: token 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('rol', data.usuario.rol);
                    localStorage.setItem('username', data.usuario.username);
                
                    if(data.usuario.rol === 'CLIENTE') {
                        window.location.href = 'inicio_cliente.html'; 
                    } else {
                        window.location.href = 'inicio_asesor.html';
                    }
                } else {
                    errorMessage.innerText = "❌ " + (data.mensaje || "Error al iniciar sesión");
                    errorMessage.style.display = "block";
                }
            } catch (error) {
                errorMessage.innerText = "⚠️ Error de conexión con el servidor.";
                errorMessage.style.display = "block";
            } finally {
                btnSubmit.innerText = "Iniciar Sesión";
                btnSubmit.style.opacity = "1";
                btnSubmit.disabled = false;
            }

        }).catch(function(err) {
            errorMessage.innerText = "Error en la validación de seguridad.";
            errorMessage.style.display = "block";
            btnSubmit.innerText = "Iniciar Sesión";
            btnSubmit.style.opacity = "1";
            btnSubmit.disabled = false;
        });
    });
});