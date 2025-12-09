// js/reset-password.js
import { API_URL } from './env.js';
import { showNotification } from '../componentes/notificacion.js';

// Obtener el token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

document.addEventListener('DOMContentLoaded', () => {
  const infoEl = document.getElementById('info');
  
  // Verificar que hay token
  if (!token) {
    if (infoEl) {
      infoEl.style.color = '#d63031';
      infoEl.textContent = 'Error: Token inválido o expirado';
    }
    showNotification('error', 'El enlace de recuperación no es válido');
    
    // Redirigir después de 3 segundos
    setTimeout(() => {
      window.location.href = 'forgot-password.html';
    }, 3000);
    
    // Deshabilitar el formulario
    const form = document.getElementById('reset-form');
    if (form) {
      const inputs = form.querySelectorAll('input, button');
      inputs.forEach(input => input.disabled = true);
    }
    return;
  }
  
  // Si hay token, configurar el formulario
  if (infoEl) {
    infoEl.style.color = '#636e72';
    infoEl.textContent = 'Ingresá tu nueva contraseña';
  }
  
  const form = document.getElementById('reset-form');
  if (form) {
    form.addEventListener('submit', handleResetPassword);
  }
});

async function handleResetPassword(e) {
  e.preventDefault();
  
  const newPassword = document.getElementById('newPassword').value;
  const messageEl = document.getElementById('message');
  const submitBtn = e.target.querySelector('button[type="submit"]');
   console.log('🔑 Token desde URL:', token); // AGREGAR ESTE LOG
  console.log('🔑 Longitud:', token?.length); // AGREGAR ESTE LOG
  
  
  // Validar longitud de contraseña
  if (newPassword.length < 6) {
    messageEl.style.color = '#d63031';
    messageEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }
  
  // Deshabilitar botón
  submitBtn.disabled = true;
  submitBtn.textContent = 'Cambiando...';
  messageEl.textContent = '';
  
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageEl.style.color = '#00b894';
      messageEl.textContent = '✓ Contraseña cambiada exitosamente. Redirigiendo...';
      
      showNotification('success', '¡Contraseña cambiada! Ahora podés iniciar sesión');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      
    } else {
      messageEl.style.color = '#d63031';
      messageEl.textContent = data.message || 'Error al cambiar la contraseña';
      
      showNotification('error', data.message || 'Error al cambiar la contraseña');
      
      submitBtn.disabled = false;
      submitBtn.textContent = 'Cambiar contraseña';
    }
  } catch (error) {
    console.error('Error:', error);
    messageEl.style.color = '#d63031';
    messageEl.textContent = 'Error de conexión. Intenta nuevamente.';
    
    showNotification('error', 'Error de conexión con el servidor');
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Cambiar contraseña';
  }
}