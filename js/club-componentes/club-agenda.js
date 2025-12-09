import { API_URL } from "../env.js";
import { showNotification } from "../../componentes/notificacion.js";
import { showLoader, hideLoader } from "../../componentes/loader.js";
import { mostrarConfirmacion } from "../../componentes/confirmacion.js";


let sesionesData = [];
let clubIdActual = null;
let userRole = null;
let actualizacionInterval = null;

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
  
  // Iniciar verificación periódica de sesiones (cada minuto)
  iniciarActualizacionAutomatica();
}

/**
 * Inicia la actualización automática de sesiones
 */
function iniciarActualizacionAutomatica() {
  // Limpiar intervalo anterior si existe
  if (actualizacionInterval) {
    clearInterval(actualizacionInterval);
  }
  
  // Verificar cada minuto si hay sesiones que cambiar de estado
  actualizacionInterval = setInterval(() => {
    // Solo actualizar si el modal de agenda está abierto
    const modal = document.getElementById("modalAgenda");
    if (modal && modal.style.display === "flex") {
      verificarYActualizarSesiones();
    }
  }, 60000); // 60 segundos
}

/**
 * Verifica si alguna sesión debe cambiar de estado
 */
function verificarYActualizarSesiones() {
  if (sesionesData.length === 0) return;
  
  const ahora = new Date();
  let hayActualizacion = false;
  
  sesionesData.forEach(sesion => {
    const fechaSesionString = sesion.fechaHora.replace('Z', '');
    const fechaSesion = new Date(fechaSesionString);
    
    // Si la sesión ya pasó y está como PROGRAMADA, necesita actualización
    if (fechaSesion <= ahora && sesion.estado === "PROGRAMADA") {
      hayActualizacion = true;
    }
  });
  
  // Si hay sesiones que necesitan actualización, recargar
  if (hayActualizacion) {
    // Detectar qué vista está activa
    const btnPasadas = document.getElementById("btnSesionesPasadas");
    const tipoActual = btnPasadas && btnPasadas.classList.contains("active") ? "pasadas" : "proximas";
    cargarSesiones(tipoActual);
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
  
  // Detener actualización automática al cerrar
  if (actualizacionInterval) {
    clearInterval(actualizacionInterval);
    actualizacionInterval = null;
  }
}

/**
 * Carga todas las sesiones del club
 */
async function cargarSesiones(tipo = "proximas") {
  try {
    showLoader("Cargando sesiones...");
    
    
    const response = await fetch(`${API_URL}/api/sesiones/club/${clubIdActual}?tipo=${tipo}`

    );

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
  // Parsear fecha sin conversión UTC - remover la Z y tratarla como local
  const fechaString = sesion.fechaHora.replace('Z', '');
  const fecha = new Date(fechaString);
  
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
            ${!isPasada ? `
              <button class="btn-icon" onclick="window.editarSesion(${sesion.id})" title="Editar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            ` : ""}
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
    const response = await fetch(`${API_URL}/club/${clubIdActual}`);

    const data = await response.json();
    
    if (data.success) {
      const select = document.getElementById("sesionLibroId");
      if (select) {
        select.innerHTML = '<option value="">Sesión general (sin libro específico)</option>';
        
        // Filtrar solo libros en estado "leyendo"
        const librosLeyendo = data.club.readBooks.filter(cb => cb.estado === "leyendo");
        
        librosLeyendo.forEach(cb => {
          const option = document.createElement("option");
          option.value = cb.clubBookId;
          option.textContent = cb.title;
          select.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("Error al cargar libros:", error);
  }
}

/**
 * Carga los libros del club para el modal de editar
 */
async function cargarLibrosParaEditar() {
  try {
    const response = await fetch(`${API_URL}/club/${clubIdActual}`);
    const data = await response.json();
    
    if (data.success) {
      const select = document.getElementById("editSesionLibroId");
      if (select) {
        select.innerHTML = '<option value="">Sesión general (sin libro específico)</option>';
        
        // Filtrar solo libros en estado "leyendo"
        const librosLeyendo = data.club.readBooks.filter(cb => cb.estado === "leyendo");
        
        librosLeyendo.forEach(cb => {
          const option = document.createElement("option");
          option.value = cb.clubBookId;
          option.textContent = cb.title;
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
  
  // Obtener fecha local y construir ISO manualmente sin conversión
  const fechaHoraLocal = formData.get("fechaHora"); // "2024-12-08T15:00"
  // Agregar segundos, milisegundos y Z para que el backend lo tome como UTC
  // pero en realidad es la hora local que queremos guardar
  const fechaISO = fechaHoraLocal + ":00.000Z";
  
  const datos = {
    clubId: clubIdActual,
    clubBookId: formData.get("clubBookId") || null,
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    fechaHora: fechaISO,
    lugar: formData.get("lugar"),
    username: localStorage.getItem("username")
  };

  try {
    showLoader("Creando sesión...");
    
    const response = await fetch(`${API_URL}/api/sesiones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
    const response = await fetch(`${API_URL}/api/sesiones/${sesionId}/confirmar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
  mostrarConfirmacion(
    "Eliminar sesión",
    "¿Estás seguro de que deseas eliminar esta sesión?<br><br><strong>Esta acción no se puede deshacer.</strong>",
    async () => {
      try {
        showLoader("Eliminando sesión...");
        
        const response = await fetch(`${API_URL}/api/sesiones/${sesionId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
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
    },
    null,
    {
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      confirmClass: "red-btn"
    }
  );
}

/**
 * Editar una sesión
 */
export async function editarSesion(sesionId) {
  try {
    showLoader("Cargando sesión...");
    
    // Obtener datos de la sesión
    const response = await fetch(`${API_URL}/api/sesiones/${sesionId}`);
    const data = await response.json();
    
    if (data.success) {
      const sesion = data.sesion;
      
      // Cargar libros en el select
      await cargarLibrosParaEditar();
      
      // Llenar el formulario con los datos actuales
      document.getElementById("editSesionId").value = sesion.id;
      document.getElementById("editSesionTitulo").value = sesion.titulo;
      document.getElementById("editSesionLibroId").value = sesion.clubBookId || "";
      
      // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:MM)
      // La fecha viene en formato ISO: "2024-12-08T15:00:00.000Z"
      // Solo tomamos los primeros 16 caracteres para datetime-local
      const fechaISO = sesion.fechaHora;
      document.getElementById("editSesionFechaHora").value = fechaISO.slice(0, 16);
      
      document.getElementById("editSesionLugar").value = sesion.lugar;
      document.getElementById("editSesionDescripcion").value = sesion.descripcion || "";
      
      // Mostrar modal
      const modal = document.getElementById("modalEditarSesion");
      if (modal) {
        modal.style.display = "flex";
      }
    } else {
      showNotification("error", data.message || "Error al cargar sesión");
    }
  } catch (error) {
    console.error("Error al cargar sesión:", error);
    showNotification("error", "Error al cargar la sesión");
  } finally {
    hideLoader();
  }
}

/**
 * Cierra el modal de editar sesión
 */
export function cerrarModalEditarSesion() {
  const modal = document.getElementById("modalEditarSesion");
  if (modal) {
    modal.style.display = "none";
    document.getElementById("formEditarSesion").reset();
  }
}

/**
 * Guarda los cambios de una sesión editada
 */
export async function editarSesionSubmit(event) {
  event.preventDefault();
  
  const sesionId = document.getElementById("editSesionId").value;
  const formData = new FormData(event.target);
  const fechaHoraLocal = formData.get("fechaHora");
  const fechaISO = fechaHoraLocal + ":00.000Z";
  
  const datos = {
    titulo: formData.get("titulo"),
    clubBookId: formData.get("clubBookId") ? parseInt(formData.get("clubBookId")) : null,
    fechaHora: fechaISO,
    lugar: formData.get("lugar"),
    descripcion: formData.get("descripcion"),
    username: localStorage.getItem("username")
  };

  try {
    showLoader("Guardando cambios...");
    
    const response = await fetch(`${API_URL}/api/sesiones/${sesionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const data = await response.json();
    
    if (data.success) {
      showNotification("success", "Sesión actualizada exitosamente");
      cerrarModalEditarSesion();
      cargarSesiones();
    } else {
      showNotification("error", data.message || "Error al actualizar sesión");
    }
  } catch (error) {
    console.error("Error al actualizar sesión:", error);
    showNotification("error", "Error al actualizar la sesión");
  } finally {
    hideLoader();
  }
}

/**
 * Registrar asistencia real - Abre modal con lista de confirmados
 */
export async function registrarAsistenciaSesion(sesionId) {
  try {
    showLoader("Cargando datos de la sesión...");
    
    // Obtener datos de la sesión con confirmaciones y asistencias ya registradas
    const response = await fetch(`${API_URL}/api/sesiones/${sesionId}`);
    const data = await response.json();
    
    if (data.success) {
      const sesion = data.sesion;
      
      // Guardar ID de sesión
      document.getElementById("asistenciaSesionId").value = sesionId;
      
      // Obtener usuarios que confirmaron "ASISTIRE" o "TAL_VEZ"
      const confirmados = sesion.confirmaciones.filter(
        c => c.estado === "ASISTIRE" || c.estado === "TAL_VEZ"
      );
      
      // Obtener IDs de usuarios que ya tienen asistencia registrada
      const asistentesRegistrados = sesion.asistencias.map(a => a.userId);
      
      // Renderizar lista de confirmados con checkboxes
      const listaHTML = confirmados.map(conf => {
        const yaRegistrado = asistentesRegistrados.includes(conf.userId);
        return `
          <div class="confirmado-item" style="display: flex; align-items: center; padding: 12px; border: 1px solid #eaf6ff; border-radius: 8px; margin-bottom: 8px;">
            <input 
              type="checkbox" 
              name="asistentes" 
              value="${conf.userId}" 
              id="asistente_${conf.userId}"
              ${yaRegistrado ? 'checked' : ''}
              style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;"
            >
            <label for="asistente_${conf.userId}" style="display: flex; align-items: center; flex: 1; cursor: pointer; margin: 0;">
              ${conf.user.avatar ? 
                `<img src="${conf.user.avatar}" alt="${conf.user.username}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 12px; object-fit: cover;">` :
                `<div style="width: 32px; height: 32px; border-radius: 50%; background: #2c5a91; color: white; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold;">${conf.user.username[0].toUpperCase()}</div>`
              }
              <div>
                <div style="font-weight: 500;">${conf.user.username}</div>
                <div style="font-size: 12px; color: #636e72;">Confirmó: ${conf.estado === "ASISTIRE" ? "Asistiré" : "Tal vez"}</div>
              </div>
            </label>
          </div>
        `;
      }).join("");
      
      const container = document.getElementById("listaConfirmados");
      if (confirmados.length === 0) {
        container.innerHTML = '<p style="color: #636e72; text-align: center; padding: 20px;">No hay personas que hayan confirmado asistencia</p>';
      } else {
        container.innerHTML = listaHTML;
      }
      
      // Mostrar modal
      const modal = document.getElementById("modalRegistrarAsistencia");
      if (modal) {
        modal.style.display = "flex";
      }
    } else {
      showNotification("error", data.message || "Error al cargar datos de la sesión");
    }
  } catch (error) {
    console.error("Error al cargar datos para asistencia:", error);
    showNotification("error", "Error al cargar los datos");
  } finally {
    hideLoader();
  }
}

/**
 * Cierra el modal de registrar asistencia
 */
export function cerrarModalRegistrarAsistencia() {
  const modal = document.getElementById("modalRegistrarAsistencia");
  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Guarda las asistencias reales marcadas
 */
export async function registrarAsistenciaSubmit(event) {
  event.preventDefault();
  
  const sesionId = document.getElementById("asistenciaSesionId").value;
  const checkboxes = document.querySelectorAll('input[name="asistentes"]:checked');
  const usuariosPresentes = Array.from(checkboxes).map(cb => parseInt(cb.value));
  
  try {
    showLoader("Guardando asistencias...");
    
    const response = await fetch(`${API_URL}/api/sesiones/${sesionId}/asistencia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuariosPresentes,
        username: localStorage.getItem("username")
      })
    });

    const data = await response.json();
    
    if (data.success) {
      showNotification("success", "Asistencias registradas exitosamente");
      cerrarModalRegistrarAsistencia();
      cargarSesiones("pasadas"); // Recargar historial
    } else {
      showNotification("error", data.message || "Error al registrar asistencias");
    }
  } catch (error) {
    console.error("Error al registrar asistencias:", error);
    showNotification("error", "Error al registrar las asistencias");
  } finally {
    hideLoader();
  }
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
  window.cerrarModalEditarSesion = cerrarModalEditarSesion;
  window.editarSesionSubmit = editarSesionSubmit;
  window.registrarAsistenciaSesion = registrarAsistenciaSesion;
  window.cerrarModalRegistrarAsistencia = cerrarModalRegistrarAsistencia;
  window.registrarAsistenciaSubmit = registrarAsistenciaSubmit;
}
