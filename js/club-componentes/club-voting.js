import { showNotification } from "../../componentes/notificacion.js";

function initClubVotingComponent() {
    console.log("Inicializando componente de votación del club...");
    
    // Verificar si los elementos existen en el DOM
    const modal = document.getElementById('modalCrearVotacion');
    const openBtn = document.getElementById('btn-crear-votacion');
    
    console.log("Modal encontrado:", !!modal);
    console.log("Botón encontrado:", !!openBtn);
    
    // Inicializar el modal de crear votación
    initCrearVotacionModal();
    
    // El sistema dinámico se inicializará cuando los datos del club estén listos
    // Se llamará desde club-core.js después de cargar window.clubData
    
    // Exponer funciones globalmente si es necesario
    window.abrirModalCrearVotacion = abrirModalCrearVotacion;
    window.initBotonDinamico = initBotonDinamico; // Exponer para llamada externa
    window.actualizarBotonDinamico = actualizarBotonDinamico; // Exponer para actualizaciones
    
    console.log("Componente de votación inicializado correctamente");
}

export function initCrearVotacionModal() {
  console.log("Configurando modal de crear votación...");
  
  const modal = document.getElementById('modalCrearVotacion');
  const openBtn = document.getElementById('btn-crear-votacion');
  const closeBtn = document.getElementById('modal-crear-votacion-close');
  const form = document.getElementById('form-crear-votacion');
  
  if (openBtn) {
    openBtn.addEventListener('click', abrirModalCrearVotacion);
    console.log("Event listener agregado al botón crear votación");
  } else {
    console.error("No se encontró el botón btn-crear-votacion");
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', cerrarModalCrearVotacion);
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      // Si se hace clic en el fondo oscuro
      if (e.target === modal) { 
        cerrarModalCrearVotacion();
      }
    });
  }
  
  if (form) {
    form.addEventListener('submit', handleCrearVotacion);
  }
}

/**
 * Abre el modal y carga los libros "Por Leer"
 */
function abrirModalCrearVotacion() {
  console.log("Abriendo modal para crear votación...");
  
  // Verificar permisos antes de abrir el modal
  const tienePermisos = esModeradorOOwner();
  if (!tienePermisos) {
    console.log("🚫 Usuario sin permisos de moderador/owner - Acceso denegado al modal");
    if (window.showNotification) {
      window.showNotification("error", "Solo los moderadores y owners pueden crear votaciones.");
    } else {
      showNotification("error", "Solo los moderadores y owners pueden crear votaciones.");
    }
    return;
  }
  
  const modal = document.getElementById('modalCrearVotacion');
  const form = document.getElementById('form-crear-votacion');
  const bookListContainer = document.getElementById('votacion-lista-libros');
  
  // Limpiar formulario (por si se abre de nuevo)
  if (form) {
    form.reset();
    
    // Establecer fechas por defecto para facilitar las pruebas
    const now = new Date();
    const fechaVotacion = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días desde ahora
    const fechaLectura = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días desde ahora
    
    const inputNombre = document.getElementById('votacion-nombre');
    const inputFechaVotacion = document.getElementById('votacion-fin-votacion');
    const inputFechaLectura = document.getElementById('votacion-fin-lectura');
    
    if (inputNombre) inputNombre.value = `Lectura ${fechaVotacion.toLocaleDateString()}`;
    if (inputFechaVotacion) inputFechaVotacion.value = fechaVotacion.toISOString().slice(0, 16);
    if (inputFechaLectura) inputFechaLectura.value = fechaLectura.toISOString().slice(0, 16);
  }
  
  if (bookListContainer) {
    bookListContainer.innerHTML = '<div class="loader-simple">Cargando libros...</div>';
  }
  
  if (modal) {
    modal.style.display = 'flex';
  }
  
  // Cargar los libros
  cargarLibrosPorLeer();
}

/**
 * Cierra el modal
 */
function cerrarModalCrearVotacion() {
  const modal = document.getElementById('modalCrearVotacion');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Carga los libros con estado "por leer" desde la API
 */
async function cargarLibrosPorLeer() {
  const bookListContainer = document.getElementById('votacion-lista-libros');
  
  try {
    const clubId = window.getClubId(); // Usar la función global
    
    console.log("Cargando libros por leer del club:", clubId);
    
   
    const debugRes = await fetch(`${window.API_URL}/api/club/${clubId}/libros-debug`);
    const debugData = await debugRes.json();
    
    
    if (debugData.success && debugData.libros) {
      // Filtrar solo libros en estado "por_leer"
      const librosPorLeer = debugData.libros.filter(libro => libro.estado === 'por_leer');
      
      console.log(`Libros por leer encontrados: ${librosPorLeer.length}`);
      console.log('🔍 Estructura completa del primer libro:', JSON.stringify(librosPorLeer[0], null, 2));
      console.log('Libros:', librosPorLeer.map(l => `ID:${l.id} - ${l.title}`));
      
      if (librosPorLeer.length > 0) {
        bookListContainer.innerHTML = librosPorLeer.map(libro => {
          // El endpoint debug tiene la estructura correcta con ClubBook ID
          console.log('📚 Libro desde debug endpoint:', {
            clubBookId: libro.id, // Este es el ClubBook ID correcto
            titulo: libro.titulo,
            autor: libro.autor,
            estado: libro.estado,
            portada: libro.portada  
          });
          
          // Usar el ID del debug endpoint (que es el ClubBook ID correcto)
          const clubBookId = libro.id;
          console.log(libro.portada)
          
          return `
            <div class="book-checkbox-item">
              <input type="checkbox" name="clubBookIds" value="${clubBookId}" id="book-${clubBookId}">
              <div class="book-cover">
                ${libro.portada ? `
                  <img src="${libro.portada}" alt="Portada de ${libro.titulo}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                  <div class="placeholder-cover" style="display: none;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                ` : `
                  <div class="placeholder-cover">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                `}
              </div>
              <label for="book-${clubBookId}">
                <div class="book-info">
                  <strong>${libro.titulo}</strong>
                  <small class="book-author">${libro.autor || 'Autor desconocido'}</small>
                </div>
              </label>
            </div>
          `;
        }).join('');
      } else {
        bookListContainer.innerHTML = '<p class="empty-text">No hay libros en estado "Por Leer" para proponer como opciones de votación. Agrega algunos libros al club primero.</p>';
      }
    } else {
      console.error("Error en la respuesta:", debugData);
      bookListContainer.innerHTML = '<p class="error-text">Error al cargar los libros del club.</p>';
    }
    
  } catch (error) {
    console.error("Error cargando libros por leer:", error);
    bookListContainer.innerHTML = '<p class="error-text">Error al cargar los libros. Intenta de nuevo.</p>';
  }
}

/**
 * Maneja el envío del formulario de creación de votación
 */
async function handleCrearVotacion(e) {
  e.preventDefault(); // Evita que la página se recargue
  console.log("Creando votación...");
  
  const form = document.getElementById('form-crear-votacion');
  
  if (!form) {
    console.error("Formulario no encontrado");
    showNotification("error", "Error: No se pudo encontrar el formulario");
    return;
  }
  
  // 1. Recolectar datos del formulario
  const formData = new FormData(form);
  
  // Debug: Ver todos los datos del form
  console.log("FormData entries:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  
  // Obtener el username del usuario logueado
  const username = localStorage.getItem('username') || 'usuario_test';
  
  const data = {
    nombre: formData.get('votacion-nombre'),
    fechaFinVotacion: formData.get('votacion-fin-votacion'),
    fechaFinLectura: formData.get('votacion-fin-lectura'),
    clubBookIds: formData.getAll('clubBookIds').map(id => parseInt(id)), // Array de IDs
    username: username // Requerido por el backend
  };

  console.log("Datos recolectados:", data);

  // 2. Validar
  if (data.clubBookIds.length === 0) {
    showNotification("alert", "Debes seleccionar al menos un libro para la votación.");
    return;
  }
  if (!data.nombre || !data.fechaFinVotacion || !data.fechaFinLectura) {
    showNotification("alert", `Por favor, completa todos los campos:
- Nombre: ${data.nombre}
- Fecha fin votación: ${data.fechaFinVotacion}
- Fecha fin lectura: ${data.fechaFinLectura}`);
    return;
  }

  console.log("Enviando al backend:", data);

  // 3. LLAMADA A LA API
  try {
    window.showLoader("Creando votación...");
    const clubId = window.getClubId();
    
    console.log("🌐 URL:", `${window.API_URL}/api/club/${clubId}/periodos`);
    console.log("📊 ClubId:", clubId);
    console.log("📄 Payload completo:", JSON.stringify(data, null, 2));
    
    const res = await fetch(`${window.API_URL}/api/club/${clubId}/periodos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    console.log("📡 Response status:", res.status);
    console.log("📡 Response ok:", res.ok);
    
    const resultado = await res.json();
    console.log("📄 Response completa:", resultado);
    
    window.hideLoader();
    
    if (res.ok && resultado.success) {
      if (window.showNotification) {
        window.showNotification("success", "¡Votación creada con éxito!");
      } else {
        showNotification("success", "¡Votación creada con éxito!");
      }
      cerrarModalCrearVotacion();
      
      // Actualizar el botón dinámico inmediatamente
      console.log("🔄 Votación creada exitosamente, actualizando botón dinámico...");
      actualizarBotonDinamico();
      
      // También recargar datos del club si es necesible
      if (typeof window.renderClub === 'function') {
        setTimeout(() => {
          console.log("🔄 Recargando datos del club...");
          window.renderClub();
        }, 500);
      }
    } else {
      console.error("❌ Error del servidor:", resultado);
      showNotification("error", `Error: ${resultado.message || 'Error al crear la votación'}`);
    }
    
  } catch (error) {
    console.error("❌ Error de red:", error);
    window.hideLoader();
    showNotification("error", "Error de conexión con el servidor.");
  }
}

// ========== SISTEMA DE BOTÓN DINÁMICO ==========

/**
 * Inicializa el sistema de botón dinámico que cambia según el estado del club
 */
function initBotonDinamico() {
    console.log("🔄 Inicializando botón dinámico...");
    
    // Actualizar el botón inmediatamente
    actualizarBotonDinamico();
    
    // Actualizar cada 30 segundos para cambios en tiempo real
    // Usar intervalo más frecuente para verificaciones automáticas
    setInterval(actualizarBotonDinamico, 15000); // 15 segundos para detectar vencimientos más rápido
}

/**
 * Actualiza el botón según el estado actual del club
 */
async function actualizarBotonDinamico() {
    try {
        const clubId = window.getClubId();
        if (!clubId) {
            console.error("❌ No se pudo obtener clubId");
            return;
        }
        
        console.log(`🔍 Obteniendo estado actual del club ${clubId}...`);
        
        // Guardar estado anterior para detectar cambios automáticos
        const estadoAnterior = window.ultimoEstadoClub || null;
        
        // Llamar al endpoint de estado actual (que ahora verifica vencimientos automáticamente)
        const url = `${window.API_URL}/api/club/${clubId}/estado-actual`;
        console.log(`🌐 Consultando: ${url}`);
        
        const res = await fetch(url);
        
        console.log(`📡 Response status: ${res.status}`);
        
        if (!res.ok) {
            console.error(`❌ Error HTTP: ${res.status} ${res.statusText}`);
            return;
        }
        
        const data = await res.json();
        
        console.log("📊 Estado del club completo:", JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log(`🎯 Estado encontrado: ${data.estado}`);
            if (data.periodo) {
                console.log(`📋 Período activo: ${data.periodo.nombre} (ID: ${data.periodo.id})`);
            }
            
            // Detectar cambios automáticos de estado
            detectarCambiosAutomaticos(estadoAnterior, data);
            
            // Guardar estado actual para próxima comparación
            window.ultimoEstadoClub = {
                estado: data.estado,
                periodoId: data.periodo?.id || null,
                timestamp: new Date()
            };
            
            actualizarBotonSegunEstado(data.estado, data.periodo);
        } else {
            console.error("❌ Respuesta de error:", data);
        }
        
    } catch (error) {
        console.error("❌ Error actualizando botón dinámico:", error);
    }
}

/**
 * Actualiza la interfaz del botón según el estado
 */
function actualizarBotonSegunEstado(estado, periodo) {
    const botonContainer = document.getElementById('btn-crear-votacion');
    if (!botonContainer) {
        console.error("❌ No se encontró el elemento btn-crear-votacion");
        return;
    }
    
    console.log(`🎯 Actualizando botón para estado: ${estado}`);
    
    // Limpiar eventos anteriores
    const nuevoBoton = botonContainer.cloneNode(true);
    botonContainer.parentNode.replaceChild(nuevoBoton, botonContainer);
    
    switch (estado) {
        case 'INACTIVO':
            console.log("🔘 Configurando botón para estado INACTIVO");
            configurarBotonInactivo(nuevoBoton);
            break;
        case 'VOTACION':
            console.log("🗳️ Configurando botón para estado VOTACION");
            configurarBotonVotacion(nuevoBoton, periodo);
            break;
        case 'LEYENDO':
            console.log("📚 Configurando botón para estado LEYENDO");
            configurarBotonLeyendo(nuevoBoton, periodo);
            break;
        default:
            console.warn("⚠️ Estado desconocido:", estado);
    }
    
    console.log("✅ Botón actualizado correctamente");
}

/**
 * Configura el botón para estado INACTIVO (crear nueva votación)
 */
function configurarBotonInactivo(boton) {
    console.log("🔘 Configurando botón para estado INACTIVO");
    
    // Verificar permisos de moderador/owner
    const tienePermisos = esModeradorOOwner();
    
    if (!tienePermisos) {
        // Si no tiene permisos, ocultar el botón completamente
        console.log("🚫 Usuario sin permisos de moderador/owner - Ocultando botón");
        boton.style.display = 'none';
        return;
    }
    
    // Si tiene permisos, mostrar el botón normalmente
    boton.style.display = 'flex';
    boton.innerHTML = `
        <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2"/>
                <polyline points="9,11 12,8 15,11"/>
                <line x1="12" y1="8" x2="12" y2="21"/>
            </svg>
        </div>
        <span>Crear Votación</span>
    `;
    boton.className = 'quick-action-btn primary';
    boton.onclick = abrirModalCrearVotacion;
    
    console.log(`✅ Botón configurado como INACTIVO - Clase: ${boton.className}`);
}

/**
 * Configura el botón para estado VOTACION (ver votación activa)
 */
function configurarBotonVotacion(boton, periodo) {
    console.log("🗳️ Configurando botón de votación con período:", periodo);
    
    const totalVotos = periodo?.totalVotosEmitidos || 0;
    console.log(`📊 Total de votos emitidos: ${totalVotos}`);
    
    const nuevoHTML = `
        <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1h-1V6c0-2.761-2.239-5-5-5H8C5.239 1 3 3.239 3 6v1H2c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1h1v1c0 2.761 2.239 5 5 5h8c2.761 0 5-2.239 5-5v-1z"/>
            </svg>
        </div>
        <span>Ver Votación (${totalVotos} votos)</span>
    `;
    
    console.log("🎨 HTML del botón:", nuevoHTML);
    
    boton.innerHTML = nuevoHTML;
    boton.className = 'quick-action-btn secondary voting-active';
    boton.onclick = () => abrirModalVotacionActiva(periodo);
    
    console.log(`✅ Botón configurado como VOTACION - Clase: ${boton.className}`);
}

/**
 * Configura el botón para estado LEYENDO (mostrar libro actual)
 */
function configurarBotonLeyendo(boton, periodo) {
    const libroTitulo = periodo?.libroGanador?.book?.title || 'Libro Actual';
    
    boton.innerHTML = `
        <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
        </div>
        <span>Leyendo: ${libroTitulo.substring(0, 20)}${libroTitulo.length > 20 ? '...' : ''}</span>
    `;
    boton.className = 'quick-action-btn secondary reading-active';
    boton.onclick = () => abrirModalLectura(periodo);
}

/**
 * Abre el modal de votación activa
 */
function abrirModalVotacionActiva(periodo) {
    console.log("🗳️ Abriendo modal de votación activa:", periodo);
    
    // Crear modal dinámicamente si no existe
    crearModalVotacionActiva(periodo);
}

/**
 * Abre el modal de lectura actual
 */
function abrirModalLectura(periodo) {
    console.log("📚 Abriendo modal de lectura:", periodo);
    
    // Crear modal dinámicamente si no existe
    crearModalLectura(periodo);
}

/**
 * Crea el modal de votación activa
 */
function crearModalVotacionActiva(periodo) {
    // Verificar si ya existe
    let modal = document.getElementById('modalVotacionActiva');
    if (modal) {
        modal.remove();
    }
    
    // Verificar permisos de moderador/owner
    const tienePermisos = esModeradorOOwner();
    
    // Crear nuevo modal
    modal = document.createElement('div');
    modal.id = 'modalVotacionActiva';
    modal.className = 'modal-backdrop';
    modal.style.display = 'flex';
    
    const fechaFinalizacion = new Date(periodo.fechaFinVotacion);
    const ahora = new Date();
    const tiempoRestante = Math.max(0, Math.ceil((fechaFinalizacion - ahora) / (1000 * 60 * 60 * 24)));
    
    modal.innerHTML = `
        <div class="modal-content modal-votacion-activa">
            <div class="modal-header-votacion">
                <div class="header-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1h-1V6c0-2.761-2.239-5-5-5H8C5.239 1 3 3.239 3 6v1H2c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1h1v1c0 2.761 2.239 5 5 5h8c2.761 0 5-2.239 5-5v-1z"/>
                    </svg>
                </div>
                <div class="header-content">
                    <h2>Votación en Progreso</h2>
                    <span class="period-badge">${periodo.nombre}</span>
                </div>
                <button class="modal-close-btn-votacion" onclick="this.closest('.modal-backdrop').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body-votacion">
                <div class="votacion-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">${periodo.totalVotosEmitidos || 0}</span>
                            <span class="stat-label">Votos Emitidos</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number ${tiempoRestante <= 1 ? 'warning' : ''}">${tiempoRestante}</span>
                            <span class="stat-label">${tiempoRestante === 1 ? 'Día restante' : 'Días restantes'}</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">${periodo.opciones.length}</span>
                            <span class="stat-label">Opciones</span>
                        </div>
                    </div>
                </div>

                <div class="votacion-opciones-container">
                    <h3>Opciones de Votación</h3>
                    <div class="opciones-votacion-grid">
                        ${periodo.opciones.map(opcion => `
                            <div class="opcion-card">
                                <div class="opcion-portada">
                                    ${opcion.clubBook.book.portada ? `
                                        <img src="${opcion.clubBook.book.portada}" alt="Portada de ${opcion.clubBook.book.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                        <div class="placeholder-portada" style="display: none;">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                            </svg>
                                        </div>
                                    ` : `
                                        <div class="placeholder-portada">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                            </svg>
                                        </div>
                                    `}
                                </div>
                                <div class="opcion-content">
                                    <h4>${opcion.clubBook.book.title}</h4>
                                    <p class="opcion-autor">${opcion.clubBook.book.author || 'Autor desconocido'}</p>
                                    <div class="votos-info">
                                        <span class="votos-numero">${opcion.totalVotos || 0}</span>
                                        <span class="votos-texto">${(opcion.totalVotos || 0) === 1 ? 'voto' : 'votos'}</span>
                                    </div>
                                    <button class="btn-votar" onclick="votar(${opcion.id}, '${opcion.clubBook.book.title.replace(/'/g, "\\'")}')">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 12l2 2 4-4"/>
                                        </svg>
                                        Votar por este libro
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${tienePermisos ? `
                    <div class="admin-section-votacion">
                        <div class="admin-header">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>Acciones de Moderador</span>
                        </div>
                        <button class="btn-cerrar-votacion-admin" onclick="cerrarVotacion(${periodo.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Cerrar Votación
                        </button>
                        <p class="admin-note">⚠️ En caso de empate, se elegirá un ganador automáticamente al azar.</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Crea el modal de lectura
 */
function crearModalLectura(periodo) {
    // Similar al modal de votación pero para estado de lectura
    let modal = document.getElementById('modalLectura');
    if (modal) {
        modal.remove();
    }
    
    // Verificar permisos de moderador/owner
    const tienePermisos = esModeradorOOwner();
    
    modal = document.createElement('div');
    modal.id = 'modalLectura';
    modal.className = 'modal-backdrop';
    modal.style.display = 'flex';
    
    const libro = periodo.libroGanador?.book;
    const fechaFinalizacion = new Date(periodo.fechaFinLectura);
    const diasRestantes = Math.ceil((fechaFinalizacion - new Date()) / (1000 * 60 * 60 * 24));
    
    modal.innerHTML = `
        <div class="modal-content modal-lectura">
            <div class="modal-header-lectura">
                <div class="header-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                </div>
                <div class="header-content">
                    <h2>Leyendo Actualmente</h2>
                    <span class="period-badge">${periodo.nombre}</span>
                </div>
                <button class="modal-close-btn-lectura" onclick="this.closest('.modal-backdrop').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body-lectura">
                <div class="libro-card">
                    <div class="libro-cover">
                        ${libro?.portada ? `
                            <img src="${libro.portada}" alt="Portada del libro" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="placeholder-cover" style="display: none;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                            </div>
                        ` : `
                            <div class="placeholder-cover">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                            </div>
                        `}
                    </div>
                    
                    <div class="libro-info">
                        <h3 class="libro-title">${libro?.title || 'Título no disponible'}</h3>
                        <p class="libro-author">por ${libro?.author || 'Autor desconocido'}</p>
                        
                        <div class="reading-progress">
                            <div class="progress-item">
                                <span class="label">Estado</span>
                                <span class="value active">En Lectura</span>
                            </div>
                            <div class="progress-item">
                                <span class="label">Finaliza</span>
                                <span class="value">${fechaFinalizacion.toLocaleDateString('es-ES', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}</span>
                            </div>
                            <div class="progress-item">
                                <span class="label">Tiempo restante</span>
                                <span class="value ${diasRestantes <= 7 ? 'warning' : ''}">${diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${tienePermisos ? `
                    <div class="admin-section">
                        <div class="admin-header">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>Acciones de Moderador</span>
                        </div>
                        <button class="btn-concluir-lectura" onclick="concluirLectura(${periodo.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9,11 12,14 22,4"/>
                                <path d="M21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"/>
                            </svg>
                            Concluir Lectura
                        </button>
                        <p class="admin-note">Al concluir, el libro se marcará como leído y el club volverá al estado inactivo.</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Función para votar por una opción
 */
async function votar(opcionId, libroTitulo) {
    try {
        const username = localStorage.getItem('username');
        const clubId = window.getClubId();
        
        // Obtener el periodoId del estado actual
        const estadoRes = await fetch(`${window.API_URL}/api/club/${clubId}/estado-actual`);
        const estadoData = await estadoRes.json();
        const periodoId = estadoData.periodo?.id;
        
        if (!periodoId) {
            showNotification("error", 'Error: No se pudo obtener el período activo');
            return;
        }
        
        window.showLoader('Registrando voto...');
        
        const res = await fetch(`${window.API_URL}/api/periodo/${periodoId}/votar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ opcionId, username })
        });
        
        const resultado = await res.json();
        window.hideLoader();
        
        if (res.ok && resultado.success) {
            showNotification("success", `¡Voto registrado por "${libroTitulo}"!`);
            // Cerrar modal y actualizar
            document.getElementById('modalVotacionActiva')?.remove();
            actualizarBotonDinamico();
            
            // Actualizar XP en el header
            if (typeof window.updateUserXpHeader === 'function') {
                window.updateUserXpHeader();
            }
        } else {
            showNotification("error", `Error: ${resultado.message || 'No se pudo registrar el voto'}`);
        }
        
    } catch (error) {
        
        window.hideLoader();
        showNotification("error",'Error de conexión al votar');
    }
}

/**
 * Función para cerrar votación (solo moderadores/owners)
 */
async function cerrarVotacion(periodoId) {
    // Verificar permisos primero
    const tienePermisos = esModeradorOOwner();
    if (!tienePermisos) {
        if (window.showNotification) {
            window.showNotification("error", "Solo los moderadores y owners pueden cerrar votaciones.");
        } else {
            showNotification("error", '❌ Solo los moderadores y owners pueden cerrar votaciones.');
        }
        return;
    }
    
    // Usar modal de confirmación personalizado
    window.mostrarConfirmacion(
        "¿Cerrar la votación?",
        "Esta acción cerrará la votación y determinará el libro ganador. En caso de empate, se elegirá un ganador al azar automáticamente.",
        async () => {
            try {
                const username = localStorage.getItem('username');
                
                window.showLoader('Cerrando votación...');
                
                const res = await fetch(`${window.API_URL}/api/periodo/${periodoId}/cerrar-votacion`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                
                const resultado = await res.json();
                window.hideLoader();
                
                if (res.ok && resultado.success) {
                    const mensaje = resultado.empate ? 
                        `¡Votación cerrada! Hubo empate y se eligió al azar: "${resultado.ganador.libro.title}"` :
                        `¡Votación cerrada! Ganador: "${resultado.ganador.libro.title}"`;
                    
                    if (window.showNotification) {
                        window.showNotification("success", mensaje);
                    } else {
                        showNotification("alert",mensaje);
                    }
                    
                    document.getElementById('modalVotacionActiva')?.remove();
                    actualizarBotonDinamico();
                } else {
                    const errorMsg = `Error: ${resultado.message || 'No se pudo cerrar la votación'}`;
                    if (window.showNotification) {
                        window.showNotification("error", errorMsg);
                    } else {
                        showNotification("error", errorMsg);
                    }
                }
                
            } catch (error) {
                console.error('Error al cerrar votación:', error);
                window.hideLoader();
                if (window.showNotification) {
                    window.showNotification("error", "Error de conexión al cerrar la votación");
                } else {
                    showNotification("error", 'Error de conexión');
                }
            }
        },
        null,
        {
            confirmText: "Cerrar Votación",
            cancelText: "Cancelar",
            confirmClass: "red-btn",
            cancelClass: "green-btn"
        }
    );
}

/**
 * Función para concluir lectura (solo moderadores/owners)
 */
async function concluirLectura(periodoId) {
    // Verificar permisos primero
    const tienePermisos = esModeradorOOwner();
    if (!tienePermisos) {
        if (window.showNotification) {
            window.showNotification("error", "Solo los moderadores y owners pueden concluir períodos de lectura.");
        } else {
            showNotification("alert",'❌ Solo los moderadores y owners pueden concluir períodos de lectura.');
        }
        return;
    }
    
    // Usar modal de confirmación personalizado
    window.mostrarConfirmacion(
        "¿Concluir período de lectura?",
        "Esta acción marcará el libro como leído y el club volverá al estado inactivo. Los miembros podrán crear una nueva votación.",
        async () => {
            try {
                const username = localStorage.getItem('username');
                
                window.showLoader('Concluyendo lectura...');
                
                const res = await fetch(`${window.API_URL}/api/periodo/${periodoId}/concluir-lectura`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                
                const resultado = await res.json();
                window.hideLoader();
                
                if (res.ok && resultado.success) {
                    const mensaje = `¡Lectura concluida! "${resultado.libroLeido?.title}" marcado como leído.`;
                    if (window.showNotification) {
                        window.showNotification("success", mensaje);
                    } else {
                        showNotification("success", mensaje);
                    }
                    
                    document.getElementById('modalLectura')?.remove();
                    actualizarBotonDinamico();
                } else {
                    const errorMsg = `Error: ${resultado.message || 'No se pudo concluir la lectura'}`;
                    if (window.showNotification) {
                        window.showNotification("error", errorMsg);
                    } else {
                        showNotification("error", errorMsg);
                    }
                }
                
            } catch (error) {
                console.error('Error al concluir lectura:', error);
                window.hideLoader();
                if (window.showNotification) {
                    window.showNotification("error", "Error de conexión al concluir la lectura");
                } else {
                    showNotification("error", 'Error de conexión');
                }
            }
        },
        null,
        {
            confirmText: "Concluir Lectura",
            cancelText: "Cancelar",
            confirmClass: "green-btn",
            cancelClass: "orange-btn"
        }
    );
}

/**
 * Verifica si el usuario actual es moderador u owner del club
 * Usa la misma lógica que club-core.js basada en ClubMember
 */
function esModeradorOOwner() {
    try {
        console.log("🔒 Verificando permisos de moderador/owner...");
        
        // Usar los datos del club ya cargados en window.clubData
        if (!window.clubData) {
            console.log("❌ No hay datos del club cargados en window.clubData");
            return false;
        }
        
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log("❌ No hay userId en localStorage");
            return false;
        }
        
        console.log(`🔍 Verificando permisos para userId: ${userId}`);
        console.log(`🏠 Club: ${window.clubData.name} (ID: ${window.clubData.id})`);
        
        // Usar las funciones existentes de club-utils.js
        if (typeof window.canUserManageClub === 'function') {
            const canManage = window.canUserManageClub(window.clubData, userId);
            console.log(`🔒 Función canUserManageClub disponible - Resultado: ${canManage}`);
            return canManage;
        } else {
            console.log("⚠️ Función canUserManageClub no disponible, usando fallback manual");
            
            // Fallback: verificación manual si no están las funciones disponibles
            const userIdNum = parseInt(userId);
            
            // Verificar en ClubMember
            if (window.clubData.members && Array.isArray(window.clubData.members)) {
                console.log(`👥 Verificando en ${window.clubData.members.length} miembros...`);
                
                const userMember = window.clubData.members.find(member => member.id == userIdNum);
                
                if (userMember && userMember.role) {
                    const isOwnerOrModerator = userMember.role === 'OWNER' || userMember.role === 'MODERADOR';
                    console.log(`✅ Usuario encontrado en ClubMember - Rol: ${userMember.role}, Puede gestionar: ${isOwnerOrModerator}`);
                    return isOwnerOrModerator;
                } else {
                    console.log(`❌ Usuario no encontrado en ClubMember con ID ${userIdNum}`);
                }
            } else {
                console.log("❌ No hay array de members o está vacío");
            }
            
            // Verificar owner legacy
            if (window.clubData.id_owner == userIdNum) {
                console.log("✅ Verificación legacy - Usuario es owner por id_owner");
                return true;
            }
            
            console.log("❌ Usuario no tiene permisos de moderador/owner");
            return false;
        }
        
    } catch (error) {
        console.error("❌ Error verificando permisos:", error);
        return false;
    }
}

/**
 * Detecta y notifica cambios automáticos de estado
 */
function detectarCambiosAutomaticos(estadoAnterior, estadoActual) {
    if (!estadoAnterior) return; // Primera carga, no hay comparación
    
    const estadoAnteriorTipo = estadoAnterior.estado;
    const estadoActualTipo = estadoActual.estado;
    
    // Detectar cierre automático de votación
    if (estadoAnteriorTipo === 'VOTACION' && estadoActualTipo === 'LEYENDO') {
        const libroGanador = estadoActual.periodo?.libroGanador?.book?.title || 'libro seleccionado';
        mostrarNotificacionCierreAutomatico(
            '🗳️ Votación cerrada automáticamente',
            `El tiempo de votación expiró. Comenzando lectura de "${libroGanador}"`
        );
    }
    
    // Detectar conclusión automática de lectura
    else if (estadoAnteriorTipo === 'LEYENDO' && estadoActualTipo === 'INACTIVO') {
        mostrarNotificacionCierreAutomatico(
            '📚 Lectura concluida automáticamente', 
            `El período de lectura ha finalizado. El club está listo para una nueva votación.`
        );
    }
    
    // Detectar votación cerrada sin ganador
    else if (estadoAnteriorTipo === 'VOTACION' && estadoActualTipo === 'INACTIVO') {
        mostrarNotificacionCierreAutomatico(
            '⚠️ Votación cerrada sin votos',
            'El tiempo de votación expiró sin recibir votos. Inicia una nueva votación.'
        );
    }
}

/**
 * Muestra notificación especial para cierres automáticos
 */
function mostrarNotificacionCierreAutomatico(titulo, mensaje) {
    console.log(`🤖 ${titulo}: ${mensaje}`);
    
    // Usar el sistema de notificaciones existente
    if (window.showNotification) {
        window.showNotification("info", `${titulo}\n${mensaje}`);
    } else if (typeof showNotification !== 'undefined') {
        showNotification("info", `${titulo}\n${mensaje}`);
    } else {
        // Fallback a alert si no hay sistema de notificaciones
        alert(`${titulo}\n\n${mensaje}`);
    }
    
    // También actualizar cualquier widget de progreso que pueda estar afectado
    if (window.cargarProgresoLectura) {
        setTimeout(() => {
            window.cargarProgresoLectura();
        }, 1000); // Esperar un segundo para que se actualice la BD
    }
}

// Exponer funciones globalmente para onclick handlers
window.votar = votar;
window.cerrarVotacion = cerrarVotacion;
window.concluirLectura = concluirLectura;

export { initClubVotingComponent };