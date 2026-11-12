// ==========================================
// 1. DATOS INICIALES: USUARIOS, CATÁLOGO Y DICCIONARIOS
// ==========================================

// Array de objetos de usuarios (Cumple requisito de mínimo 3 usuarios y 2 roles + cuenta deshabilitada)
const usuariosSistema = [
    { id: 1, nombre: "Administrador General", email: "admin@autotech.com", password: "Admin123", telefono: "0990001111", rol: "Administrador", activo: true },
    { id: 2, nombre: "Domenica Estupiñan", email: "cliente1@correo.com", password: "Cliente123", telefono: "0987654321", rol: "Cliente", activo: true },
    { id: 3, nombre: "Matias Caza", email: "cliente2@correo.com", password: "Cliente123", telefono: "0991122334", rol: "Cliente", activo: true },
    { id: 4, nombre: "Usuario Suspendido", email: "bloqueado@correo.com", password: "Bloqueado123", telefono: "0999999999", rol: "Cliente", activo: false }
];

// Catálogo de servicios para renderizar en Módulo 1
const catalogoServicios = [
    { titulo: "Cambio de Aceite y Filtros", precio: "$35.00", tiempo: "45 min", desc: "Aceite sintético, filtro original y revisión de 15 puntos." },
    { titulo: "Mantenimiento Preventivo ABC", precio: "$85.00", tiempo: "2 horas", desc: "Limpieza de inyectores, cuerpo de aceleración, bujías y frenos." },
    { titulo: "Sistema de Frenos y Suspensión", precio: "$50.00", tiempo: "1.5 horas", desc: "Cambio de pastillas, rectificación y chequeo de amortiguadores." },
    { titulo: "Diagnóstico Electrónico Escáner", precio: "$25.00", tiempo: "30 min", desc: "Lectura de códigos OBD2 en motor, ABS, airbag y transmisión." }
];

// Diccionario de colores Bootstrap según el estado del mantenimiento
const diccionarioColoresEstado = {
    "Pendiente": "bg-secondary",
    "En revisión": "bg-info text-dark",
    "En proceso": "bg-warning text-dark",
    "Finalizado": "bg-success",
    "Cancelado": "bg-danger"
};

const listaEstados = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Cancelado"];

// Estado de sesión actual y solicitudes almacenadas en localStorage
let usuarioActual = JSON.parse(localStorage.getItem("usuarioSesion_AD01")) || null;
let solicitudesMantenimiento = JSON.parse(localStorage.getItem("solicitudes_AD01")) || [
    {
        id: "MANT-1001",
        clienteNombre: "Domenica Estupiñan",
        clienteEmail: "cliente1@correo.com",
        clienteTelefono: "0987654321",
        vehiculoPlaca: "PBA-4521",
        vehiculoMarca: "Chevrolet",
        vehiculoModelo: "Sail",
        vehiculoAnio: 2021,
        vehiculoKm: 42500,
        tipoServicio: "Mantenimiento Preventivo ABC",
        fechaCita: "2026-11-20",
        horaCita: "10:00",
        modalidad: "Estándar",
        extras: ["Lavado Express", "Nivelación de Fluidos"],
        observaciones: "Revisión general antes de viaje interprovincial.",
        estado: "En proceso"
    }
];

// ==========================================
// 2. INICIALIZACIÓN Y RENDERIZADO DEL DOM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    renderizarCatalogoServicios();
    generarHorariosSelect();
    configurarFechaMinima();
    actualizarInterfazSesion();
});

// Uso de map() para transformar objetos del catálogo en tarjetas HTML
function renderizarCatalogoServicios() {
    const contenedor = document.getElementById("contenedorServicios");
    const tarjetasHTML = catalogoServicios.map(serv => `
        <div class="col-md-6 col-lg-3">
            <div class="card h-100 card-servicio border-0 shadow-sm">
                <div class="card-body d-flex flex-column">
                    <h3 class="h6 fw-bold text-dark">${serv.titulo}</h3>
                    <p class="text-muted small flex-grow-1">${serv.desc}</p>
                    <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                        <span class="badge bg-primary fs-6">${serv.precio}</span>
                        <span class="small text-secondary">⏱ ${serv.tiempo}</span>
                    </div>
                </div>
            </div>
        </div>
    `);
    contenedor.innerHTML = tarjetasHTML.join("");
}

// Uso de bucle for clásico para poblar horarios de atención (08:00 a 17:00)
function generarHorariosSelect() {
    const selectHora = document.getElementById("horaCita");
    selectHora.innerHTML = '<option value="">Hora...</option>';
    for (let hora = 8; hora <= 17; hora++) {
        const horaFormateada = `${hora.toString().padStart(2, "0")}:00`;
        selectHora.innerHTML += `<option value="${horaFormateada}">${horaFormateada}</option>`;
    }
}

function configurarFechaMinima() {
    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fechaCita").setAttribute("min", hoy);
}

function guardarEnLocalStorage() {
    localStorage.setItem("solicitudes_AD01", JSON.stringify(solicitudesMantenimiento));
}

// ==========================================
// 3. AUTENTICACIÓN, ROLES Y PERMISOS (Módulo 3)
// ==========================================

document.getElementById("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("loginEmail").value.trim().toLowerCase();
    const passwordInput = document.getElementById("loginPassword").value.trim();

    // Uso de find() para buscar credenciales en el array de usuarios
    const usuarioEncontrado = usuariosSistema.find(
        u => u.email.toLowerCase() === emailInput && u.password === passwordInput
    );

    // Caso de prueba 2: Credenciales inválidas
    if (!usuarioEncontrado) {
        Swal.fire("Error de acceso", "Correo o contraseña incorrectos.", "error");
        return;
    }

    // Caso de prueba 2: Cuenta deshabilitada
    if (!usuarioEncontrado.activo) {
        Swal.fire("Cuenta deshabilitada", "Tu cuenta está suspendida. Contacta al administrador.", "warning");
        return;
    }

    usuarioActual = usuarioEncontrado;
    localStorage.setItem("usuarioSesion_AD01", JSON.stringify(usuarioActual));

    const modalEl = document.getElementById("modalLogin");
    const modalInstancia = bootstrap.Modal.getInstance(modalEl);
    if (modalInstancia) modalInstancia.hide();

    document.getElementById("formLogin").reset();
    actualizarInterfazSesion();

    Swal.fire({
        icon: "success",
        title: `¡Bienvenido, ${usuarioActual.nombre}!`,
        text: `Has ingresado con el rol de ${usuarioActual.rol}.`,
        timer: 1800,
        showConfirmButton: false
    });
});

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
    usuarioActual = null;
    localStorage.removeItem("usuarioSesion_AD01");
    limpiarFormulario();
    actualizarInterfazSesion();
    Swal.fire("Sesión cerrada", "Has salido del sistema correctamente.", "info");
});

// Caso de prueba 5: Cliente o visitante intenta entrar en Administración
document.getElementById("navAdmin").addEventListener("click", (e) => {
    if (!usuarioActual || usuarioActual.rol !== "Administrador") {
        e.preventDefault();
        Swal.fire("Acceso denegado", "Permisos insuficientes: Esta sección es exclusiva para el rol Administrador.", "error");
    }
});

function actualizarInterfazSesion() {
    const etiqueta = document.getElementById("etiquetaUsuario");
    const btnLogin = document.getElementById("btnAbrirLogin");
    const btnSalir = document.getElementById("btnCerrarSesion");

    const seccionPerfil = document.getElementById("seccionPerfil");
    const seccionForm = document.getElementById("seccionFormulario");
    const seccionCliente = document.getElementById("seccionCliente");
    const seccionAdmin = document.getElementById("seccionAdmin");

    const navForm = document.getElementById("navFormulario");
    const navMisMant = document.getElementById("navMisMantenimientos");

    if (!usuarioActual) {
        etiqueta.textContent = "Sin sesión";
        etiqueta.className = "badge bg-secondary";
        btnLogin.classList.remove("d-none");
        btnSalir.classList.add("d-none");

        seccionPerfil.classList.add("d-none");
        seccionForm.classList.add("d-none");
        seccionCliente.classList.add("d-none");
        seccionAdmin.classList.add("d-none");
        navForm.classList.add("d-none");
        navMisMant.classList.add("d-none");
        return;
    }

    etiqueta.textContent = `${usuarioActual.nombre} (${usuarioActual.rol})`;
    etiqueta.className = usuarioActual.rol === "Administrador" ? "badge bg-danger" : "badge bg-success";
    btnLogin.classList.add("d-none");
    btnSalir.classList.remove("d-none");

    // Mostrar perfil de usuario
    seccionPerfil.classList.remove("d-none");
    document.getElementById("datosPerfil").innerHTML = `
        <div class="col-md-4"><strong>Nombre:</strong> ${usuarioActual.nombre}</div>
        <div class="col-md-4"><strong>Correo:</strong> ${usuarioActual.email}</div>
        <div class="col-md-2"><strong>Teléfono:</strong> ${usuarioActual.telefono}</div>
        <div class="col-md-2"><strong>Rol:</strong> <span class="badge bg-primary">${usuarioActual.rol}</span></div>
    `;

    seccionForm.classList.remove("d-none");
    seccionCliente.classList.remove("d-none");
    navForm.classList.remove("d-none");
    navMisMant.classList.remove("d-none");

    // Si es Cliente, autocompletar y bloquear sus datos personales para que registre solo para sí mismo
    const inputNombre = document.getElementById("clienteNombre");
    const inputEmail = document.getElementById("clienteEmail");
    const inputTel = document.getElementById("clienteTelefono");

    if (usuarioActual.rol === "Cliente") {
        inputNombre.value = usuarioActual.nombre;
        inputEmail.value = usuarioActual.email;
        inputTel.value = usuarioActual.telefono;
        inputNombre.readOnly = true;
        inputEmail.readOnly = true;
        seccionAdmin.classList.add("d-none");
    } else {
        inputNombre.readOnly = false;
        inputEmail.readOnly = false;
        if (!document.getElementById("solicitudId").value) {
            inputNombre.value = "";
            inputEmail.value = "";
            inputTel.value = "";
        }
        seccionAdmin.classList.remove("d-none");
        renderizarTablaAdmin();
    }

    renderizarTablaCliente();
}

// ==========================================
// 4. VALIDACIONES Y REGISTRO / EDICIÓN (Módulo 2)
// ==========================================

function validarDatosFormulario(datos) {
    // 1. Campos obligatorios
    if (!datos.clienteNombre || !datos.clienteEmail || !datos.clienteTelefono ||
        !datos.vehiculoPlaca || !datos.vehiculoMarca || !datos.vehiculoModelo ||
        !datos.vehiculoAnio || !datos.vehiculoKm || !datos.tipoServicio ||
        !datos.fechaCita || !datos.horaCita || !datos.observaciones) {
        return "Todos los campos marcados con (*) son obligatorios.";
    }

    // 2. Validación de correo
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(datos.clienteEmail)) {
        return "El formato del correo electrónico no es válido.";
    }

    // 3. Validación de teléfono (10 dígitos numéricos)
    const regexTelefono = /^[0-9]{10}$/;
    if (!regexTelefono.test(datos.clienteTelefono)) {
        return "El teléfono debe contener exactamente 10 dígitos numéricos.";
    }

    // 4. Validación de placa de Ecuador (3 letras, guion, 3 o 4 números: ABC-1234)
    const regexPlaca = /^[A-Z]{3}-[0-9]{3,4}$/;
    if (!regexPlaca.test(datos.vehiculoPlaca)) {
        return "Formato de placa inválido. Use el formato estándar con guion (ejemplo: PBA-1234).";
    }

    // 5. Validación de año del vehículo
    const anioNum = Number(datos.vehiculoAnio);
    if (isNaN(anioNum) || anioNum < 1980 || anioNum > 2027) {
        return "El año del vehículo debe estar entre 1980 y 2027.";
    }

    // 6. Validación de kilometraje
    const kmNum = Number(datos.vehiculoKm);
    if (isNaN(kmNum) || kmNum <= 0 || kmNum > 1000000) {
        return "El kilometraje debe ser un número positivo mayor a 0 y menor a 1,000,000 km.";
    }

    // 7. Validación de fecha (no permitir fechas pasadas)
    const hoy = new Date().toISOString().split("T")[0];
    if (datos.fechaCita < hoy) {
        return "La fecha de la cita no puede ser anterior al día de hoy.";
    }

    return null; // Sin errores
}

document.getElementById("formMantenimiento").addEventListener("submit", (e) => {
    e.preventDefault();

    if (!usuarioActual) {
        Swal.fire("Inicia sesión", "Debes iniciar sesión para registrar una solicitud.", "warning");
        return;
    }

    // Uso de bucle for...of para recolectar los checkboxes marcados
    const checkboxes = document.querySelectorAll(".check-extra");
    const extrasSeleccionados = [];
    for (const check of checkboxes) {
        if (check.checked) {
            extrasSeleccionados.push(check.value);
        }
    }

    const modalidadSeleccionada = document.querySelector('input[name="modalidad"]:checked').value;
    const idEdicion = document.getElementById("solicitudId").value;

    const datosSolicitud = {
        clienteNombre: document.getElementById("clienteNombre").value.trim(),
        clienteEmail: document.getElementById("clienteEmail").value.trim().toLowerCase(),
        clienteTelefono: document.getElementById("clienteTelefono").value.trim(),
        vehiculoPlaca: document.getElementById("vehiculoPlaca").value.trim().toUpperCase(),
        vehiculoMarca: document.getElementById("vehiculoMarca").value.trim(),
        vehiculoModelo: document.getElementById("vehiculoModelo").value.trim(),
        vehiculoAnio: Number(document.getElementById("vehiculoAnio").value),
        vehiculoKm: Number(document.getElementById("vehiculoKm").value),
        tipoServicio: document.getElementById("tipoServicio").value,
        fechaCita: document.getElementById("fechaCita").value,
        horaCita: document.getElementById("horaCita").value,
        modalidad: modalidadSeleccionada,
        extras: extrasSeleccionados,
        observaciones: document.getElementById("observaciones").value.trim()
    };

    // Caso de prueba 3: Validación de placa, fecha, kilometraje, etc.
    const mensajeError = validarDatosFormulario(datosSolicitud);
    if (mensajeError) {
        Swal.fire("Datos inválidos", mensajeError, "error");
        return;
    }

    if (idEdicion) {
        // Modo edición (Exclusivo Administrador)
        if (usuarioActual.rol !== "Administrador") {
            Swal.fire("Acceso denegado", "Solo el administrador puede editar registros.", "error");
            return;
        }
        const registroExistente = solicitudesMantenimiento.find(s => s.id === idEdicion);
        if (registroExistente) {
            Object.assign(registroExistente, datosSolicitud);
            Swal.fire("Actualizado", `La solicitud ${idEdicion} fue modificada con éxito.`, "success");
        }
    } else {
        // Caso de prueba 4: Crear nueva solicitud
        const nuevoId = "MANT-" + Math.floor(1000 + Math.random() * 9000);
        const nuevaSolicitud = {
            id: nuevoId,
            ...datosSolicitud,
            estado: "Pendiente"
        };
        solicitudesMantenimiento.push(nuevaSolicitud);
        Swal.fire("Solicitud registrada", `Tu mantenimiento fue agendado con el código ${nuevoId}.`, "success");
    }

    guardarEnLocalStorage();
    limpiarFormulario();
    renderizarTablaCliente();
    if (usuarioActual.rol === "Administrador") {
        renderizarTablaAdmin();
    }
});

function limpiarFormulario() {
    document.getElementById("formMantenimiento").reset();
    document.getElementById("solicitudId").value = "";
    document.getElementById("tituloFormulario").textContent = "Registrar Solicitud de Mantenimiento";
    document.getElementById("btnGuardarSolicitud").textContent = "Guardar Solicitud";
    document.getElementById("btnCancelarEdicion").classList.add("d-none");

    if (usuarioActual && usuarioActual.rol === "Cliente") {
        document.getElementById("clienteNombre").value = usuarioActual.nombre;
        document.getElementById("clienteEmail").value = usuarioActual.email;
        document.getElementById("clienteTelefono").value = usuarioActual.telefono;
    }
}

document.getElementById("btnCancelarEdicion").addEventListener("click", limpiarFormulario);

// ==========================================
// 5. LISTADO CLIENTE Y CRUD ADMINISTRADOR
// ==========================================

// Uso de filter() y forEach() para mostrar únicamente las solicitudes del usuario logueado
function renderizarTablaCliente() {
    const tbody = document.getElementById("tablaClienteBody");
    tbody.innerHTML = "";

    if (!usuarioActual) return;

    const misRegistros = solicitudesMantenimiento.filter(
        s => s.clienteEmail.toLowerCase() === usuarioActual.email.toLowerCase()
    );

    if (misRegistros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No tienes solicitudes registradas bajo tu correo (${usuarioActual.email}).</td></tr>`;
        return;
    }

    misRegistros.forEach(item => {
        const badgeColor = diccionarioColoresEstado[item.estado] || "bg-secondary";
        const textoExtras = item.extras && item.extras.length > 0 ? `<br><small class="text-muted">+ ${item.extras.join(", ")}</small>` : "";

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${item.id}</td>
                <td>${item.vehiculoMarca} ${item.vehiculoModelo} (${item.vehiculoAnio})<br><span class="badge bg-dark">${item.vehiculoPlaca}</span></td>
                <td>${item.vehiculoKm.toLocaleString()} km</td>
                <td><strong>${item.tipoServicio}</strong> (${item.modalidad})${textoExtras}</td>
                <td>${item.fechaCita} a las ${item.horaCita}</td>
                <td><span class="badge ${badgeColor}">${item.estado}</span></td>
            </tr>
        `;
    });
}

// Renderizado general y controles CRUD exclusivos para el Administrador
function renderizarTablaAdmin() {
    const tbody = document.getElementById("tablaAdminBody");
    const contador = document.getElementById("contadorTotalAdmin");
    tbody.innerHTML = "";

    contador.textContent = `${solicitudesMantenimiento.length} registros totales`;

    if (solicitudesMantenimiento.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No existen solicitudes en el sistema.</td></tr>`;
        return;
    }

    solicitudesMantenimiento.forEach(item => {
        const opcionesEstado = listaEstados.map(est =>
            `<option value="${est}" ${item.estado === est ? "selected" : ""}>${est}</option>`
        ).join("");

        const badgeColor = diccionarioColoresEstado[item.estado] || "bg-secondary";

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${item.id}</td>
                <td>${item.clienteNombre}<br><small class="text-muted">${item.clienteEmail} / ${item.clienteTelefono}</small></td>
                <td>${item.vehiculoMarca} ${item.vehiculoModelo}<br><span class="badge bg-dark">${item.vehiculoPlaca}</span> (${item.vehiculoKm} km)</td>
                <td>${item.tipoServicio}<br><small class="text-muted">${item.observaciones}</small></td>
                <td>${item.fechaCita}<br><small>${item.horaCita}</small></td>
                <td>
                    <span class="badge ${badgeColor} mb-1 d-inline-block">${item.estado}</span>
                    <select class="form-select form-select-sm" onchange="cambiarEstadoSolicitud('${item.id}', this.value)">
                        ${opcionesEstado}
                    </select>
                </td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-primary" onclick="cargarSolicitudParaEditar('${item.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarSolicitud('${item.id}')">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// Caso de prueba 6: Administrador cambia el estado de una solicitud
window.cambiarEstadoSolicitud = function(id, nuevoEstado) {
    if (!usuarioActual || usuarioActual.rol !== "Administrador") {
        Swal.fire("Acceso denegado", "Operación exclusiva para administradores.", "error");
        return;
    }

    const solicitud = solicitudesMantenimiento.find(s => s.id === id);
    if (solicitud) {
        solicitud.estado = nuevoEstado;
        guardarEnLocalStorage();
        renderizarTablaAdmin();
        renderizarTablaCliente();
        Swal.fire({
            icon: "success",
            title: "Estado actualizado",
            text: `La solicitud ${id} ahora está: ${nuevoEstado}.`,
            timer: 1400,
            showConfirmButton: false
        });
    }
};

// Cargar datos en el formulario para editar (Administrador)
window.cargarSolicitudParaEditar = function(id) {
    if (!usuarioActual || usuarioActual.rol !== "Administrador") {
        Swal.fire("Acceso denegado", "No tienes permisos para editar solicitudes.", "error");
        return;
    }

    const item = solicitudesMantenimiento.find(s => s.id === id);
    if (!item) return;

    document.getElementById("solicitudId").value = item.id;
    document.getElementById("clienteNombre").value = item.clienteNombre;
    document.getElementById("clienteEmail").value = item.clienteEmail;
    document.getElementById("clienteTelefono").value = item.clienteTelefono;
    document.getElementById("vehiculoPlaca").value = item.vehiculoPlaca;
    document.getElementById("vehiculoMarca").value = item.vehiculoMarca;
    document.getElementById("vehiculoModelo").value = item.vehiculoModelo;
    document.getElementById("vehiculoAnio").value = item.vehiculoAnio;
    document.getElementById("vehiculoKm").value = item.vehiculoKm;
    document.getElementById("tipoServicio").value = item.tipoServicio;
    document.getElementById("fechaCita").value = item.fechaCita;
    document.getElementById("horaCita").value = item.horaCita;
    document.getElementById("observaciones").value = item.observaciones;

    // Seleccionar radio button
    if (item.modalidad === "Express") {
        document.getElementById("modExpress").checked = true;
    } else {
        document.getElementById("modNormal").checked = true;
    }

    // Marcar checkboxes
    const checkboxes = document.querySelectorAll(".check-extra");
    for (const check of checkboxes) {
        check.checked = item.extras.includes(check.value);
    }

    document.getElementById("tituloFormulario").textContent = `Editando Solicitud ${item.id}`;
    document.getElementById("btnGuardarSolicitud").textContent = "Guardar Cambios";
    document.getElementById("btnCancelarEdicion").classList.remove("d-none");

    document.getElementById("seccionFormulario").scrollIntoView({ behavior: "smooth" });
};

// Caso de prueba 6: Administrador elimina un registro con confirmación previa en SweetAlert2
window.eliminarSolicitud = function(id) {
    if (!usuarioActual || usuarioActual.rol !== "Administrador") {
        Swal.fire("Acceso denegado", "No tienes permisos para eliminar solicitudes.", "error");
        return;
    }

    Swal.fire({
        title: `¿Eliminar la solicitud ${id}?`,
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            solicitudesMantenimiento = solicitudesMantenimiento.filter(s => s.id !== id);
            guardarEnLocalStorage();
            renderizarTablaAdmin();
            renderizarTablaCliente();
            Swal.fire("Eliminado", `El registro ${id} ha sido eliminado del sistema.`, "success");
        }
    });
};