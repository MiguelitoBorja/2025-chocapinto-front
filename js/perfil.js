import { API_URL } from "./env.js";
import { showNotification } from "../componentes/notificacion.js";
import { showLoader, hideLoader } from "../componentes/loader.js";
import { mostrarConfirmacion } from "../componentes/confirmacion.js";

const LOGIN_URL = "../html/index.html";

// Configuración de avatares por nivel (estáticos JPG hasta nivel 3, GIF animados desde nivel 4)
const AVATARS_POR_NIVEL = {
    // 🌟 Nivel 1 - Iniciales (básicos)
    1: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg'
    ],
    
    // 📚 Nivel 2 - Aventureros
    2: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg'
    ],
    
    // ⚔️ Nivel 3 - Héroes clásicos
    3: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg',
        'ElfaArquera.jpg',
        'Mago.jpg'
    ],
    
    // 🎭 Nivel 4 - Personajes especiales + primer GIF
    4: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg',
        'ElfaArquera.jpg',
        'Mago.jpg',
        'Hechizera.jpg',
        'Vampiro.jpg',
        'ola.gif' // Primer GIF desbloqueado
    ],
    
    // 🏆 Nivel 5 - Tier épico (GIFs de LOTR)
    5: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg',
        'ElfaArquera.jpg',
        'Mago.jpg',
        'Hechizera.jpg',
        'Vampiro.jpg',
        'ola.gif',
        'for_frodo.gif',
        'gandalf_no.gif'
    ],
    
    // 💀 Nivel 6 - Dark theme
    6: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg',
        'ElfaArquera.jpg',
        'Mago.jpg',
        'Hechizera.jpg',
        'Vampiro.jpg',
        'SilverShroud.jpg',
        'Cyborg.jpg',
        'ola.gif',
        'for_frodo.gif',
        'gandalf_no.gif',
        'golum.gif'
    ],
    
    // ⚡ Nivel 7 - Ultra épico
    7: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg',
        'ElfaArquera.jpg',
        'Mago.jpg',
        'Hechizera.jpg',
        'Vampiro.jpg',
        'SilverShroud.jpg',
        'Cyborg.jpg',
        'ola.gif',
        'for_frodo.gif',
        'gandalf_no.gif',
        'golum.gif',
        'modo_oso.gif',
        'speed.gif'
    ],
    
    // 🌟 Nivel 8 - Legendarios deportivos
    8: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg',
        'ElfaArquera.jpg',
        'Mago.jpg',
        'Hechizera.jpg',
        'Vampiro.jpg',
        'SilverShroud.jpg',
        'Cyborg.jpg',
        'ola.gif',
        'for_frodo.gif',
        'gandalf_no.gif',
        'golum.gif',
        'modo_oso.gif',
        'speed.gif',
        'messi.gif',
        'River.png' // Easter egg para fans de River
    ],
    
    // 👑 Nivel 9+ - TODOS desbloqueados
    9: [
        'DetectiveHombre.jpg',
        'DetectiveMujer.jpg',
        'AventureroFantasia.jpg',
        'Exploradora.jpg',
        'ElfaArquera.jpg',
        'Mago.jpg',
        'Hechizera.jpg',
        'Vampiro.jpg',
        'SilverShroud.jpg',
        'Cyborg.jpg',
        'ola.gif',
        'for_frodo.gif',
        'gandalf_no.gif',
        'golum.gif',
        'modo_oso.gif',
        'speed.gif',
        'messi.gif',
        'cr7.gif',
        'River.png'
    ]
};
// Sistema de recompensas por nivel
const RECOMPENSAS_POR_NIVEL = {
    1: { marco: null, insignia: null, tipo: 'estatico' },
    2: { marco: null, insignia: null, tipo: 'estatico' },
    3: { marco: null, insignia: '📖 Lector Iniciado', tipo: 'estatico' },
    4: { marco: 'bronce', insignia: '📖 Lector Iniciado', tipo: 'gif' },
    5: { marco: 'bronce', insignia: '📚 Bibliófilo', tipo: 'gif' },
    6: { marco: 'plata', insignia: '📚 Bibliófilo', tipo: 'gif' },
    7: { marco: 'plata', insignia: '🔥 Lector Apasionado', tipo: 'gif' },
    8: { marco: 'oro', insignia: '🔥 Lector Apasionado', tipo: 'gif-epico' },
    9: { marco: 'oro', insignia: '⚡ Maestro Literario', tipo: 'gif-epico' },
    10: { marco: 'diamante', insignia: '👑 Leyenda de Booksy', tipo: 'gif-legendario' }
};

// Función para obtener recompensas del nivel actual
function obtenerRecompensas(nivel) {
    // Si el nivel es mayor a 10, usar las recompensas de nivel 10
    const nivelKey = nivel > 10 ? 10 : nivel;
    return RECOMPENSAS_POR_NIVEL[nivelKey] || RECOMPENSAS_POR_NIVEL[1];
}

//Inicializador de pagina - mostrar loader inicial
showLoader("Iniciando perfil...");


// --- 2. MANEJO DE SECCIONES (Editar Perfil / Cambiar Contraseña / Mis Clubes) ---

function switchSection(targetId) {
    // Oculta todas las secciones
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    // Desactiva todos los botones de navegación
    document.querySelectorAll('.sidebar-actions button').forEach(btn => {
        btn.classList.remove('active-btn');
    });

    // Muestra la sección deseada
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
    
    // Activa el botón de navegación correspondiente
    // NOTA: Asegúrate de que todos los botones tengan el atributo data-target
    const navButton = document.querySelector(`.sidebar-actions button[data-target="${targetId}"]`);
    if (navButton) {
        navButton.classList.add('active-btn');
    }

    // NUEVA LÓGICA: Si es la sección de clubes, carga los datos.
    if (targetId === 'my-clubs') {
        loadMyClubs();
    }
    
    // Limpia el formulario de contraseña al cambiar de sección
    if (targetId === 'edit-profile') {
        document.getElementById('passwordForm').reset();
    }
}

// Event listeners para los botones de la barra lateral
document.getElementById('showEditProfileBtn').addEventListener('click', () => switchSection('edit-profile'));
document.getElementById('showChangePasswordBtn').addEventListener('click', () => switchSection('change-password'));
document.getElementById('showMyClubsBtn').addEventListener('click', () => switchSection('my-clubs')); // <--- NUEVO EVENT LISTENER

// Event listener para el botón Cancelar de cambiar contraseña
document.getElementById('cancelPasswordBtn').addEventListener('click', () => switchSection('edit-profile'));


// --- 3. LÓGICA DE CARGA DE DATOS INICIALES ---

document.addEventListener("DOMContentLoaded", async () => {
    const currentUsername = localStorage.getItem("username");
    if (!currentUsername) {
        hideLoader();
        window.location.href = LOGIN_URL;
        return;
    }
    
    // Al cargar, siempre mostrar la sección de edición por defecto
    switchSection('edit-profile');

    try {
        // Cambiar mensaje del loader para carga de datos
        showLoader("Cargando datos del perfil...");
        
        const res = await fetch(`${API_URL}/user/${currentUsername}`);
        const data = await res.json();
        
        console.log(data);
        if (data.success && data.user) {
            const username = data.user.username;
            const email = data.user.email || "Email no disponible";
            const role = data.user.role || "No asignado";
            
            // Guardar userId en localStorage si no existe
            if (data.user.id && !localStorage.getItem("userId")) {
                localStorage.setItem("userId", data.user.id.toString());
            }
            
            // Sidebar
            document.getElementById("sidebar-name").textContent = username; 
            document.getElementById("info-role").textContent = role;
            document.getElementById("info-email").textContent = email;

            // Formulario de Edición
            document.getElementById("username").value = username;
            document.getElementById("email").value = email;
            
            // Cargar avatar actual
            await cargarAvatarActual();
            
            // Simular un pequeño delay para mejor UX
            setTimeout(() => {
                hideLoader();
            }, 500);
        } else {
            hideLoader();
            showNotification("error", data.message || "Error al cargar los datos del perfil.");
        }
    } catch (error) {
        hideLoader();
        showNotification("error", "Error de conexión al cargar datos del perfil.");
    }
});


// --- 4. LÓGICA DE ACTUALIZACIÓN DE PERFIL (Solo Username) ---

// Se eliminó la lógica de contraseña de este formulario, ya que debe estar separada.
document.getElementById("perfilForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentUsername = localStorage.getItem("username");
    const newUsername = document.getElementById("username").value;

    try {
        // Mostrar loader durante la actualización
        showLoader("Actualizando perfil...");
        
        const res = await fetch(`${API_URL}/updateUser`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentUsername, newUsername })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("username", data.user.username);
            showLoader("Perfil actualizado! Recargando...");
            showNotification("success", "Usuario actualizado con éxito");
            // Recarga para actualizar el sidebar
            setTimeout(() => {
                hideLoader();
                window.location.reload();
            }, 1000); 
        } else {
            hideLoader();
            showNotification("error", data.message || "Error al actualizar el usuario");
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        hideLoader();
        showNotification("error", "Error de conexión con el servidor");
    }
});


// --- 5. LÓGICA DE ACTUALIZACIÓN DE CONTRASEÑA (NUEVA FUNCIÓN) ---
document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentUsername = localStorage.getItem("username");
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        showNotification("error", "La nueva contraseña y la confirmación no coinciden.");
        return;
    }

    // Validación de seguridad (ejemplo)
    const minLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    if (!minLength || !hasUpper) {
        showNotification("error", "La nueva contraseña debe tener al menos 8 caracteres y una mayúscula.");
        return;
    }
    
    // **Asegúrate de que este endpoint /changePassword esté implementado en tu backend.**
    try {
        // Mostrar loader durante el cambio de contraseña
        showLoader("Cambiando contraseña...");
        
        const res = await fetch(`${API_URL}/changePassword`, { 
            method: "POST", // Usar POST o PUT para esta operación
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentUsername, currentPassword, newPassword })
        });

        const data = await res.json();

        if (data.success) {
            showLoader("Contraseña cambiada! Redirigiendo...");
            showNotification("success", "Contraseña cambiada con éxito. Serás redirigido al inicio.");
            document.getElementById("passwordForm").reset();
            // Redirige al inicio o al login para forzar reautenticación
            setTimeout(() => {
                hideLoader();
                window.location.href = "main.html";
            }, 1000); 

        } else {
            hideLoader();
            showNotification("error", data.message || "Error al cambiar la contraseña. Verifica tu contraseña actual.");
        }
    } catch (error) {
        hideLoader();
        showNotification("error", "Error de conexión con el servidor");
    }
});


// --- 6. LÓGICA DE ELIMINAR CUENTA (Mantenida) ---

document.getElementById("deleteAccountBtn").addEventListener("click", () => {
    mostrarConfirmacion(
        "Eliminar cuenta",
        "¿Seguro que querés eliminar tu cuenta? <br><br><strong>Esta acción no se puede deshacer.</strong>",
        async () => {
            const username = localStorage.getItem("username");
            
            try {
                // Mostrar loader durante la eliminación
                showLoader("Eliminando cuenta...");
                
                const res = await fetch(`${API_URL}/deleteUser`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username })
                });
                
                const data = await res.json();
                
                if (data.success) {
                    showLoader("Cuenta eliminada! Redirigiendo...");
                    showNotification("success", "Cuenta eliminada correctamente");
                    localStorage.removeItem("username");
                    localStorage.removeItem("role");
                    
                    setTimeout(() => {
                        hideLoader();
                        window.location.href = LOGIN_URL;
                    }, 1500);
                } else {
                    hideLoader();
                    showNotification("error", data.message || "No se pudo eliminar la cuenta");
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
                hideLoader();
                showNotification("error", "Error de conexión con el servidor");
            }
        },
        null,
        {
            confirmText: "Eliminar cuenta",
            cancelText: "Cancelar",
            confirmClass: "green-btn"
        }
    );
});


document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      confirmarCerrarSesion();
    });
  }

});

function confirmarCerrarSesion() {
  mostrarConfirmacion(
    "Cerrar sesión",
    "¿Estás seguro de que querés cerrar sesión?",
    cerrarSesion,
    null,
    {
      confirmText: "Cerrar sesión",
      cancelText: "Cancelar",
      confirmClass: "green-btn"
    }
  );
}

function cerrarSesion() {
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  window.location.href = LOGIN_URL;
}

// --- 7. LÓGICA DE CARGA DE MIS CLUBES (NUEVA FUNCIÓN) ---

async function loadMyClubs() {
    showLoader("Cargando tus clubes...");
    const currentUsername = localStorage.getItem("username");
    const clubsListContainer = document.getElementById("clubs-list");
    clubsListContainer.innerHTML = ''; // Limpia el contenido anterior
    

    try {
        // Este FETCH requiere el endpoint /user/{username}/clubs en tu backend
        const res = await fetch(`${API_URL}/user/${currentUsername}/clubs`);
        
        if (!res.ok) {
            throw new Error(`Error en la API: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.success && data.clubs) {
            const clubs = data.clubs;
        

            if (clubs.length === 0) {
                clubsListContainer.innerHTML = '<p class="no-clubs-message">Aún no estás suscrito a ningún club. ¡Busca uno!</p>';
            } else {
                clubs.forEach(club => {
                    // Determinar el texto de rol a mostrar
                    const roleText = club.role === 'OWNER' ? 'Dueño del Club' : club.role;
                    const clubCard = `
                        
                        <div class="club-card-row">

                            <img class="club-photo-small"
                                src="${club.imagen || '../images/default-club.png'}"
                                alt="Foto del club">

                            <div class="club-info">
                                <h3 class="club-name">${club.name}</h3>

                                <p class="club-detail"><strong>Rol:</strong> ${roleText}</p>
                                <p class="club-detail"><strong>Se unió el:</strong> ${new Date(club.joinedAt).toLocaleDateString()}</p>

                                <button class="btn-primary-club club-button"
                                    onclick="window.location.href='club_lectura.html?clubId=${club.id}'">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle;">
                                        <path d="M5 12h14"/>
                                        <path d="m12 5 7 7-7 7"/>
                                    </svg>
                                    Ir al Club
                                </button>
                            </div>

                        </div>
                    
                    `;
                    clubsListContainer.innerHTML += clubCard;
                });
            }
            
            hideLoader();
        } else {
            hideLoader();
            clubsListContainer.innerHTML = '<p class="error-message">No se pudo cargar la lista de clubes.</p>';
            showNotification("error", data.message || "Error al obtener los datos de los clubes.");
        }
    } catch (error) {
        console.error("Error en loadMyClubs:", error);
        hideLoader();
        clubsListContainer.innerHTML = '<p class="error-message">Error de conexión con el servidor. Por favor, verifica el endpoint.</p>';
        showNotification("error", "Error de conexión al cargar los clubes.");
    }
}

// Funciones del Modal de Avatar
async function abrirModalAvatar() {
    const modal = document.getElementById('modalSeleccionAvatar');
    if (!modal) return;
    
    // Obtener el nivel actual del usuario
    const userLevel = await obtenerNivelUsuario();
    
    if (userLevel === null) {
        showNotification("error", "No se pudo obtener tu nivel actual");
        return;
    }
    
    // Generar el HTML del modal con avatares filtrados por nivel
    generarGridAvataresPorNivel(userLevel);
    
    modal.style.display = 'flex';
    marcarAvatarActual();
}

function cerrarModalAvatar() {
    const modal = document.getElementById('modalSeleccionAvatar');
    if (modal) {
        modal.style.display = 'none';
        // Quitar selección visual
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
}

// Función para obtener el nivel actual del usuario
async function obtenerNivelUsuario() {
    try {
        const currentUsername = localStorage.getItem("username");
        if (!currentUsername) return null;
        
        const res = await fetch(`${API_URL}/user/${currentUsername}`);
        const data = await res.json();
        
        if (data.success && data.user && data.user.level) {
            return data.user.level;
        }
        return 1; // Nivel por defecto si no se encuentra
    } catch (error) {
        console.error("Error obteniendo nivel del usuario:", error);
        return 1; // Nivel por defecto en caso de error
    }
}

// Función para generar el grid de avatares según el nivel
function generarGridAvataresPorNivel(userLevel) {
    const avatarGrid = document.querySelector('.avatar-grid');
    if (!avatarGrid) return;
    
    // Obtener avatares disponibles para el nivel del usuario
    let avatarsDisponibles = [];
    for (let nivel = 1; nivel <= userLevel; nivel++) {
        if (AVATARS_POR_NIVEL[nivel]) {
            avatarsDisponibles = [...new Set([...avatarsDisponibles, ...AVATARS_POR_NIVEL[nivel]])];
        }
    }
    
    // Si el nivel es muy alto, mostrar todos
    if (userLevel > 10) {
        avatarsDisponibles = Object.values(AVATARS_POR_NIVEL).flat();
        avatarsDisponibles = [...new Set(avatarsDisponibles)]; // Remover duplicados
    }
    
    // Todos los avatares posibles con sus detalles (organizados por nivel de desbloqueo)
    const todosLosAvatares = [
        // Nivel 1 - Básicos
        { archivo: 'DetectiveHombre.jpg', nombre: '🕵️ Detective Hombre', nivelRequerido: 1 },
        { archivo: 'DetectiveMujer.jpg', nombre: '🕵️ Detective Mujer', nivelRequerido: 1 },
        
        // Nivel 2 - Aventureros
        { archivo: 'AventureroFantasia.jpg', nombre: '⚔️ Aventurero', nivelRequerido: 2 },
        { archivo: 'Exploradora.jpg', nombre: '🗺️ Exploradora', nivelRequerido: 2 },
        
        // Nivel 3 - Héroes clásicos
        { archivo: 'ElfaArquera.jpg', nombre: '🏹 Elfa Arquera', nivelRequerido: 3 },
        { archivo: 'Mago.jpg', nombre: '🔮 Mago', nivelRequerido: 3 },
        
        // Nivel 4 - Personajes especiales + primer GIF
        { archivo: 'Hechizera.jpg', nombre: '✨ Hechizera', nivelRequerido: 4 },
        { archivo: 'Vampiro.jpg', nombre: '🧛 Vampiro', nivelRequerido: 4 },
        { archivo: 'ola.gif', nombre: '👋 ¡Hola!', nivelRequerido: 4 },
        
        // Nivel 5 - GIFs LOTR
        { archivo: 'for_frodo.gif', nombre: '⚔️ For Frodo!', nivelRequerido: 5 },
        { archivo: 'gandalf_no.gif', nombre: '🧙 You Shall Not Pass', nivelRequerido: 5 },
        
        // Nivel 6 - Dark theme
        { archivo: 'SilverShroud.jpg', nombre: '🦇 Silver Shroud', nivelRequerido: 6 },
        { archivo: 'Cyborg.jpg', nombre: '🤖 Cyborg', nivelRequerido: 6 },
        { archivo: 'golum.gif', nombre: '💍 Gollum', nivelRequerido: 6 },
        
        // Nivel 7 - Ultra épico
        { archivo: 'modo_oso.gif', nombre: '🐻 Modo Oso', nivelRequerido: 7 },
        { archivo: 'speed.gif', nombre: '⚡ Speed', nivelRequerido: 7 },
        
        // Nivel 8 - Legendarios deportivos
        { archivo: 'messi.gif', nombre: '⚽ Messi', nivelRequerido: 8 },
        { archivo: 'River.png', nombre: '🔴⚪ River Plate', nivelRequerido: 8 },
        
        // Nivel 9+ - Máximo nivel
        { archivo: 'cr7.gif', nombre: '👑 CR7', nivelRequerido: 9 }
    ];
    
    // Primero crear el HTML de información del nivel con recompensas
    const recompensasActuales = obtenerRecompensas(userLevel);
    const proximoNivel = userLevel + 1;
    const proximasRecompensas = obtenerRecompensas(proximoNivel);
    
    let infoRecompensasHTML = '';
    if (recompensasActuales.marco || recompensasActuales.insignia) {
        infoRecompensasHTML += '<div class="recompensas-actuales">';
        infoRecompensasHTML += '<strong>🎁 Recompensas desbloqueadas:</strong><br>';
        if (recompensasActuales.marco) {
            const marcoTexto = {
                'bronce': '🥉 Marco de Bronce',
                'plata': '🥈 Marco de Plata', 
                'oro': '🥇 Marco de Oro',
                'diamante': '💎 Marco de Diamante'
            };
            infoRecompensasHTML += `<span class="recompensa-item">${marcoTexto[recompensasActuales.marco]}</span>`;
        }
        if (recompensasActuales.insignia) {
            infoRecompensasHTML += `<span class="recompensa-item">${recompensasActuales.insignia}</span>`;
        }
        infoRecompensasHTML += '</div>';
    }
    
    // Mostrar próximas recompensas
    if (proximoNivel <= 10 && (proximasRecompensas.marco !== recompensasActuales.marco || proximasRecompensas.insignia !== recompensasActuales.insignia)) {
        infoRecompensasHTML += '<div class="proximas-recompensas">';
        infoRecompensasHTML += `<strong>⭐ Próximo nivel (${proximoNivel}):</strong><br>`;
        if (proximasRecompensas.marco && proximasRecompensas.marco !== recompensasActuales.marco) {
            const marcoTexto = {
                'bronce': '🥉 Marco de Bronce',
                'plata': '🥈 Marco de Plata',
                'oro': '🥇 Marco de Oro',
                'diamante': '💎 Marco de Diamante'
            };
            infoRecompensasHTML += `<span class="recompensa-proxima">${marcoTexto[proximasRecompensas.marco]}</span>`;
        }
        if (proximasRecompensas.insignia && proximasRecompensas.insignia !== recompensasActuales.insignia) {
            infoRecompensasHTML += `<span class="recompensa-proxima">${proximasRecompensas.insignia}</span>`;
        }
        infoRecompensasHTML += '</div>';
    }
    
    const levelInfoHTML = `
        <div class="avatar-level-info">
            <h4>🌟 Tu nivel actual: ${userLevel}</h4>
            <p>Avatares disponibles: ${avatarsDisponibles.length} de ${todosLosAvatares.length}</p>
            ${infoRecompensasHTML}
        </div>
    `;
    
    // Luego generar HTML de avatares
    let avatarsHTML = '';
    todosLosAvatares.forEach(avatar => {
        const disponible = avatarsDisponibles.includes(avatar.archivo);
        const clases = `avatar-option ${disponible ? 'available' : 'locked'}`;
        const onClick = disponible ? `seleccionarAvatar('${avatar.archivo}')` : `mostrarAvatarBloqueado('${avatar.nombre}', ${avatar.nivelRequerido})`;
        
        avatarsHTML += `
            <div class="avatar-item">
                <img src="../images/avatars/${avatar.archivo}" 
                     class="${clases}" 
                     onclick="${onClick}" 
                     alt="${avatar.nombre}"
                     title="${disponible ? avatar.nombre : `${avatar.nombre} (Nivel ${avatar.nivelRequerido} requerido)`}">
                ${!disponible ? `<div class="avatar-lock">
                    <i class="fa-solid fa-lock"></i>
                    <span>Nivel ${avatar.nivelRequerido}</span>
                </div>` : ''}
            </div>
        `;
    });
    
    // Insertar la información del nivel antes del grid
    const modalContent = avatarGrid.parentElement;
    
    // Verificar si ya existe el panel de información y eliminarlo
    const existingInfo = modalContent.querySelector('.avatar-level-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Insertar la nueva información antes del grid de avatares
    avatarGrid.insertAdjacentHTML('beforebegin', levelInfoHTML);
    
    // Actualizar solo el contenido del grid con los avatares
    avatarGrid.innerHTML = avatarsHTML;
}

// Función para mostrar mensaje cuando se intenta seleccionar un avatar bloqueado
function mostrarAvatarBloqueado(nombreAvatar, nivelRequerido) {
    showNotification("warning", `¡${nombreAvatar} se desbloquea en el Nivel ${nivelRequerido}! Sigue leyendo para alcanzarlo 📚`);
}

function marcarAvatarActual() {
    const currentAvatarImg = document.getElementById('currentAvatarImg');
    if (currentAvatarImg && currentAvatarImg.src) {
        const currentSrc = currentAvatarImg.src;
        const filename = currentSrc.split('/').pop();
        
        document.querySelectorAll('.avatar-option.available').forEach(option => {
            option.classList.remove('selected');
            if (option.src.includes(filename)) {
                option.classList.add('selected');
            }
        });
    }
}

async function seleccionarAvatar(nombreArchivo) {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
        showNotification("error", "No se encontró el ID del usuario");
        return;
    }
    
    try {
        showLoader("Actualizando avatar...");
        
        const res = await fetch(`${API_URL}/users/${userId}/update-avatar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatarName: nombreArchivo })
        });

        const data = await res.json();

        if (data.success) {
            // Actualizar la imagen en la pantalla inmediatamente
            const avatarImg = document.getElementById('currentAvatarImg');
            const defaultIcon = document.getElementById('defaultAvatarIcon');
            
            if (avatarImg && defaultIcon) {
                avatarImg.src = data.avatar;
                avatarImg.style.display = 'block';
                defaultIcon.style.display = 'none';
            }
            
            showNotification("success", "¡Avatar actualizado correctamente!");
            cerrarModalAvatar();
        } else {
            showNotification("error", data.message || "Error al actualizar el avatar");
        }
    } catch (error) {
        console.error("Error al actualizar avatar:", error);
        showNotification("error", "Error de conexión al actualizar el avatar");
    } finally {
        hideLoader();
    }
}

// Función para cargar el avatar actual del usuario
async function cargarAvatarActual() {
    const currentUsername = localStorage.getItem("username");
    if (!currentUsername) return;
    
    try {
        const res = await fetch(`${API_URL}/user/${currentUsername}`);
        const data = await res.json();
        
        if (data.success && data.user) {
            const avatarImg = document.getElementById('currentAvatarImg');
            const defaultIcon = document.getElementById('defaultAvatarIcon');
            const profilePhotoContainer = document.getElementById('profilePhotoContainer');
            
            // Aplicar avatar si existe
            if (data.user.avatar && avatarImg && defaultIcon) {
                avatarImg.src = data.user.avatar;
                avatarImg.style.display = 'block';
                defaultIcon.style.display = 'none';
            }
            
            // Aplicar marco e insignia según el nivel
            const userLevel = data.user.level || 1;
            const recompensas = obtenerRecompensas(userLevel);
            
            // Aplicar marco al contenedor del avatar
            if (profilePhotoContainer) {
                // Limpiar clases de marco anteriores
                profilePhotoContainer.classList.remove('marco-bronce', 'marco-plata', 'marco-oro', 'marco-diamante');
                
                // Aplicar nuevo marco si existe
                if (recompensas.marco) {
                    profilePhotoContainer.classList.add(`marco-${recompensas.marco}`);
                }
            }
            
            // Mostrar insignia en el sidebar
            const sidebarTag = document.getElementById('sidebar-tag');
            if (sidebarTag && recompensas.insignia) {
                const role = data.user.role || 'No asignado';
                sidebarTag.innerHTML = `
                    <div style="margin-bottom: 8px;">
                        <strong>Rol:</strong> <strong id="info-role">${role}</strong>
                    </div>
                    <div class="insignia-badge" title="Insignia de nivel ${userLevel}">
                        ${recompensas.insignia}
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Error al cargar avatar actual:", error);
        // Si hay error, mantener el ícono por defecto
    }
}

// Exponer funciones globalmente para el HTML
window.abrirModalAvatar = abrirModalAvatar;
window.cerrarModalAvatar = cerrarModalAvatar;
window.seleccionarAvatar = seleccionarAvatar;
window.mostrarAvatarBloqueado = mostrarAvatarBloqueado;