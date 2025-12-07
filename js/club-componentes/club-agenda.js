import { API_URL } from "../env.js";
import { showNotification } from "../../componentes/notificacion.js";
import { showLoader, hideLoader } from "../../componentes/loader.js";

let sesionesData = [];
let clubIdActual = null;
let userRole = null;

/**
 * Inicializa el módulo de agenda
 */
export function initAgenda(clubId, role) {
  clubIdActual = clubId;
  userRole = role;
  
  // Mostrar botón de crear sesión solo para moderadores/owner
  const btnCrearSesion = document.getElementById("btnCrearSesion");
  if (btnCrearSesion && (role === "OWNER" || role === "MODERADOR")) {
    btnCrearSesion.style.display = "block";
  }
}

/**
 * Muestra el modal de agenda
 */
export function mostrarAgenda() {
  const modal = document.getElementById("modalAgenda");
  if (modal) {
    modal.style.display = "flex";
    cargarSesiones();
  }
}

/**
 * Cierra el modal de agenda
 */
export function cerrarModalAgenda() {
  const modal = document.getElementById("modalAgenda");
  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Carga todas las sesiones del club
 */
async function cargarSesiones(tipo = "proximas") {
  try {
    showLoader("Cargando sesiones...");
    
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/sesiones/club/${clubIdActual}?tipo=${tipo}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      sesionesData = data.sesiones;
      renderizarSesiones(tipo);
    } else {
      showNotification("error", data.message || "Error al cargar sesiones");
    }
  } catch (error) {
    console.error("Error al cargar sesiones:", error);
    showNotification("error", "Error al cargar las sesiones");
  } finally {
    hideLoader();
  }
}

/**
 * Renderiza las sesiones en el DOM
 */
function renderizarSesiones(tipo) {
  const container = document.getElementById("sesionesContainer");
  if (!container) return;

  if (sesionesData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>No hay sesiones ${tipo === "proximas" ? "próximas" : "pasadas"}</p>
        ${userRole === "OWNER" || userRole === "MODERADOR" ? 
          `<button class="btn-primary" onclick="window.mostrarModalCrearSesion()">Crear primera sesión</button>` : 
          ""}
      </div>
    `;
    return;
  }

  const html = sesionesData.map(sesion => crearTarjetaSesion(sesion, tipo)).join("");
  container.innerHTML = html;
}

/**
 * Crea el HTML de una tarjeta de sesión
 */
function crearTarjetaSesion(sesion, tipo) {
  const fecha = new Date(sesion.fechaHora);
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const horaFormateada = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const username = localStorage.getItem("username");
  const confirmacionUsuario = sesion.confirmaciones.find(c => c.user.username === username);
  const estadoUsuario = confirmacionUsuario ? confirmacionUsuario.estado : null;

  const isPasada = tipo === "pasadas" || sesion.estado === "COMPLETADA";

  return `
    <div class="sesion-card ${isPasada ? "sesion-pasada" : ""}" data-sesion-id="${sesion.id}">
      <div class="sesion-header">
        <div class="sesion-fecha-hora">
          <div class="sesion-fecha">${fechaFormateada}</div>
          <div class="sesion-hora">🕐 ${horaFormateada}</div>
        </div>
        ${userRole === "OWNER" || userRole === "MODERADOR" ? `
          <div class="sesion-actions">
            <button class="btn-icon" onclick="window.editarSesion(${sesion.id})" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-danger" onclick="window.eliminarSesion(${sesion.id})" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ` : ""}
      </div>

      <div class="sesion-content">
        <h3 class="sesion-titulo">${sesion.titulo}</h3>
        
        ${sesion.clubBook ? `
          <div class="sesion-libro">
            <img src="${sesion.clubBook.book.portada || "../images/BooksyLogo.png"}" alt="${sesion.clubBook.book.title}">
            <div>
              <div class="libro-titulo">${sesion.clubBook.book.title}</div>
              <div class="libro-autor">${sesion.clubBook.book.author || "Autor desconocido"}</div>
            </div>
          </div>
        ` : ""}

        ${sesion.descripcion ? `
          <div class="sesion-descripcion">${sesion.descripcion}</div>
        ` : ""}

        <div class="sesion-lugar">
          📍 ${sesion.lugar}
        </div>

        ${!isPasada ? `
          <div class="sesion-confirmaciones">
            <div class="confirmaciones-resumen">
              <span class="confirmacion-badge confirmacion-asistire">
                ✓ ${sesion.contadores.asistire} Asistirán
              </span>
              <span class="confirmacion-badge confirmacion-talvez">
                ? ${sesion.contadores.talVez} Tal vez
              </span>
              <span class="confirmacion-badge confirmacion-novoy">
                ✗ ${sesion.contadores.noVoy} No van
              </span>
            </div>

            <div class="confirmacion-usuario">
              <button class="btn-confirmacion ${estadoUsuario === "ASISTIRE" ? "active" : ""}" 
                      onclick="window.confirmarAsistenciaSesion(${sesion.id}, 'ASISTIRE')">
                Asistiré
              </button>
              <button class="btn-confirmacion ${estadoUsuario === "TAL_VEZ" ? "active" : ""}"
                      onclick="window.confirmarAsistenciaSesion(${sesion.id}, 'TAL_VEZ')">
                Tal vez
              </button>
              <button class="btn-confirmacion ${estadoUsuario === "NO_VOY" ? "active" : ""}"
                      onclick="window.confirmarAsistenciaSesion(${sesion.id}, 'NO_VOY')">
                No voy
              </button>
            </div>
          </div>
        ` : `
          <div class="sesion-asistencia-real">
            <div class="asistencia-titulo">Asistieron (${sesion.contadores.asistenciaReal}):</div>
            <div class="asistentes-lista">
              ${sesion.asistencias.map(a => `
                <div class="asistente-avatar" title="${a.user.username}">
                  ${a.user.avatar ? 
                    `<img src="${a.user.avatar}" alt="${a.user.username}">` :
                    `<div class="avatar-inicial">${a.user.username[0].toUpperCase()}</div>`
                  }
                </div>
              `).join("")}
            </div>
            ${userRole === "OWNER" || userRole === "MODERADOR" ? `
              <button class="btn-secondary" onclick="window.registrarAsistenciaSesion(${sesion.id})">
                Registrar asistencia
              </button>
            ` : ""}
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Muestra el modal para crear sesión
 */
export function mostrarModalCrearSesion() {
  const modal = document.getElementById("modalCrearSesion");
  if (modal) {
    modal.style.display = "flex";
    cargarLibrosParaSesion();
  }
}

/**
 * Cierra el modal de crear sesión
 */
export function cerrarModalCrearSesion() {
  const modal = document.getElementById("modalCrearSesion");
  if (modal) {
    modal.style.display = "none";
    document.getElementById("formCrearSesion").reset();
  }
}

/**
 * Carga los libros del club para seleccionar en la sesión
 */
async function cargarLibrosParaSesion() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/club/${clubIdActual}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      const select = document.getElementById("sesionLibroId");
      if (select) {
        select.innerHTML = '<option value="">Sesión general (sin libro específico)</option>';
        
        data.club.clubBooks.forEach(cb => {
          const option = document.createElement("option");
          option.value = cb.id;
          option.textContent = cb.book.title;
          select.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("Error al cargar libros:", error);
  }
}

/**
 * Crea una nueva sesión
 */
export async function crearSesion(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const datos = {
    clubId: clubIdActual,
    clubBookId: formData.get("clubBookId") || null,
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    fechaHora: formData.get("fechaHora"),
    lugar: formData.get("lugar"),
    username: localStorage.getItem("username")
  };

  try {
    showLoader("Creando sesión...");
    
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/sesiones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    });

    const data = await response.json();
    
    if (data.success) {
      showNotification("success", "Sesión creada exitosamente");
      cerrarModalCrearSesion();
      cargarSesiones();
    } else {
      showNotification("error", data.message || "Error al crear sesión");
    }
  } catch (error) {
    console.error("Error al crear sesión:", error);
    showNotification("error", "Error al crear la sesión");
  } finally {
    hideLoader();
  }
}

/**
 * Confirma asistencia a una sesión
 */
export async function confirmarAsistenciaSesion(sesionId, estado) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/sesiones/${sesionId}/confirmar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        estado,
        username: localStorage.getItem("username")
      })
    });

    const data = await response.json();
    
    if (data.success) {
      showNotification("success", "Confirmación registrada");
      cargarSesiones();
    } else {
      showNotification("error", data.message || "Error al confirmar asistencia");
    }
  } catch (error) {
    console.error("Error al confirmar asistencia:", error);
    showNotification("error", "Error al confirmar asistencia");
  }
}

/**
 * Cambia entre sesiones próximas y pasadas
 */
export function cambiarVistaAgenda(tipo) {
  const btnProximas = document.getElementById("btnSesionesProximas");
  const btnPasadas = document.getElementById("btnSesionesPasadas");
  
  if (tipo === "proximas") {
    btnProximas.classList.add("active");
    btnPasadas.classList.remove("active");
  } else {
    btnPasadas.classList.add("active");
    btnProximas.classList.remove("active");
  }
  
  cargarSesiones(tipo);
}

/**
 * Elimina una sesión
 */
export async function eliminarSesion(sesionId) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta sesión?")) {
    return;
  }

  try {
    showLoader("Eliminando sesión...");
    
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/sesiones/${sesionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        username: localStorage.getItem("username")
      })
    });

    const data = await response.json();
    
    if (data.success) {
      showNotification("success", "Sesión eliminada exitosamente");
      cargarSesiones();
    } else {
      showNotification("error", data.message || "Error al eliminar sesión");
    }
  } catch (error) {
    console.error("Error al eliminar sesión:", error);
    showNotification("error", "Error al eliminar la sesión");
  } finally {
    hideLoader();
  }
}

/**
 * Editar una sesión (placeholder - implementar según necesidad)
 */
export function editarSesion(sesionId) {
  showNotification("info", "Funcionalidad de edición en desarrollo");
  // TODO: Implementar modal de edición
}

/**
 * Registrar asistencia real (placeholder - implementar según necesidad)
 */
export function registrarAsistenciaSesion(sesionId) {
  showNotification("info", "Funcionalidad de registro de asistencia en desarrollo");
  // TODO: Implementar modal de registro de asistencia
}

// Exportar funciones globales
if (typeof window !== "undefined") {
  window.mostrarAgenda = mostrarAgenda;
  window.cerrarModalAgenda = cerrarModalAgenda;
  window.mostrarModalCrearSesion = mostrarModalCrearSesion;
  window.cerrarModalCrearSesion = cerrarModalCrearSesion;
  window.crearSesion = crearSesion;
  window.confirmarAsistenciaSesion = confirmarAsistenciaSesion;
  window.cambiarVistaAgenda = cambiarVistaAgenda;
  window.eliminarSesion = eliminarSesion;
  window.editarSesion = editarSesion;
  window.registrarAsistenciaSesion = registrarAsistenciaSesion;
}
