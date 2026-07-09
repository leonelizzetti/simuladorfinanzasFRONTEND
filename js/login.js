document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const token = grecaptcha.getResponse();

            if (token.length === 0) {
                alert("Por favor, marca el recuadro 'No soy un robot'.");
                return;
            }

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rol = document.querySelector('input[name="role"]:checked').value;
            
            const errorMessage = document.getElementById('errorMessage');
            const btnSubmit = document.getElementById('btnSubmit');

            btnSubmit.innerText = "Iniciando...";
            btnSubmit.style.opacity = "0.7";
            btnSubmit.disabled = true;
            errorMessage.style.display = "none";

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        rol: rol,
                        recaptchaToken: token
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.token) localStorage.setItem('token', data.token);
                    if (data.usuario) {
                        localStorage.setItem('username', data.usuario.username);
                        localStorage.setItem('rol', data.usuario.rol);
                        localStorage.setItem('nombreReal', data.usuario.nombres + " " + data.usuario.apellidos);
                    }
                    
                    if (rol === 'asesor') {
                        window.location.href = 'inicio_asesor.html';
                    } else {
                        window.location.href = 'inicio_cliente.html';
                    }
                } else {
                    errorMessage.innerText = "❌ " + (data.mensaje || "Credenciales incorrectas");
                    errorMessage.style.display = "block";
                    grecaptcha.reset();
                }
            } catch (error) {
                console.error("🚨 ERROR DE CONEXIÓN:", error);
                errorMessage.innerText = "⚠️ Error de conexión con el servidor.";
                errorMessage.style.display = "block";
                grecaptcha.reset();
            } finally {
                btnSubmit.innerText = "Iniciar Sesión";
                btnSubmit.style.opacity = "1";
                btnSubmit.disabled = false;
            }
        });
    }
});