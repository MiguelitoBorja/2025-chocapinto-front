import { API_URL } from "./env.js";

let isLoggingIn = false;

document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Prevenir múltiples clicks
    if (isLoggingIn) return;
    isLoggingIn = true;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
    submitBtn.textContent = 'Iniciando sesión...';
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();

            localStorage.setItem("username", username);
            localStorage.setItem("role", data.role);
            if (data.id) {
                localStorage.setItem("userId", data.id);
            }

            submitBtn.textContent = '✓ Redirigiendo...';
            window.location.href = "main.html";
        } else {
            // Error de credenciales
            document.getElementById("errorMsg").style.display = "block";
            
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.textContent = originalText;
            isLoggingIn = false;
        }
    } catch (error) {
        // Error de conexión
        document.getElementById("errorMsg").textContent = "Error de conexión con el servidor";
        document.getElementById("errorMsg").style.display = "block";
        
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.textContent = originalText;
        isLoggingIn = false;
    }
});