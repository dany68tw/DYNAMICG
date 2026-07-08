let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

// Compatibilidad con clientes anteriores
clientes = clientes.map(cliente => {
  if (!cliente.pagos) {
    cliente.pagos = [];
  }
  return cliente;
});

function mostrarPantalla(nombre) {
  document.querySelectorAll(".pantalla").forEach(pantalla => {
    pantalla.classList.remove("activa");
  });

  const pantalla = document.getElementById("pantalla" + nombre);

  if (pantalla) {
    pantalla.classList.add("activa");
  }

  actualizarDashboard();
}

function guardarCliente() {
  const id = document.getElementById("clienteId").value;

  const nombre = document.getElementById("nombre").value.trim();
  const dni = document.getElementById("dni").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();
  const cuota = document.getElementById("cuota").value;
  const vencimiento = document.getElementById("vencimiento").value;

  if (nombre === "" || dni === "" || vencimiento === "") {
    mostrarNotificacion("Debe completar nombre, DNI y vencimiento", "error");
    return;
  }

  if (id) {
    clientes = clientes.map(cliente => {
      if (cliente.id == id) {
        return {
          ...cliente,
          nombre,
          dni,
          telefono,
          email,
          cuota,
          vencimiento
        };
      }
      return cliente;
    });

    mostrarNotificacion("Cliente actualizado correctamente", "ok");
  } else {
    const cliente = {
      id: Date.now(),
      nombre,
      dni,
      telefono,
      email,
      cuota,
      vencimiento,
      ultimoPago: "",
      estado: "Activo",
      pagos: []
    };

    clientes.push(cliente);
    mostrarNotificacion("Cliente guardado correctamente", "ok");
  }

  guardarEnStorage();
  limpiarFormulario();
  mostrarClientes();
  actualizarDashboard();
}

function registrarPago(id) {
  clientes = clientes.map(cliente => {
    if (cliente.id === id) {
      const hoy = new Date();
      const nuevoVencimiento = new Date(cliente.vencimiento);

      nuevoVencimiento.setMonth(nuevoVencimiento.getMonth() + 1);

      const pago = {
        id: Date.now(),
        fecha: formatearFecha(hoy),
        importe: Number(cliente.cuota) || 0,
        concepto: "Cuota mensual",
        medioPago: "Efectivo"
      };

      return {
        ...cliente,
        ultimoPago: formatearFecha(hoy),
        vencimiento: nuevoVencimiento.toISOString().split("T")[0],
        pagos: [...(cliente.pagos || []), pago]
      };
    }

    return cliente;
  });

  guardarEnStorage();
  mostrarClientes();
  actualizarDashboard();

  mostrarHistorialPagos();
  mostrarNotificacion("Pago registrado correctamente", "ok");
}

function editarCliente(id) {
  const cliente = clientes.find(cliente => cliente.id === id);

  if (!cliente) {
    mostrarNotificacion("Cliente no encontrado", "error");
    return;
  }

  mostrarPantalla("Clientes");

  document.getElementById("clienteId").value = cliente.id;
  document.getElementById("nombre").value = cliente.nombre;
  document.getElementById("dni").value = cliente.dni;
  document.getElementById("telefono").value = cliente.telefono;
  document.getElementById("email").value = cliente.email;
  document.getElementById("cuota").value = cliente.cuota;
  document.getElementById("vencimiento").value = cliente.vencimiento;

  document.getElementById("tituloFormulario").innerText = "Editar Cliente";
  document.getElementById("btnGuardar").innerText = "Guardar Cambios";
  document.getElementById("btnCancelar").style.display = "block";

  mostrarNotificacion("Editando cliente", "info");
  window.scrollTo(0, 0);
}

function cancelarEdicion() {
  limpiarFormulario();
  mostrarNotificacion("Edición cancelada", "info");
}

function mostrarClientes() {
  const lista = document.getElementById("listaClientes");
  const buscar = document.getElementById("buscar").value.toLowerCase();

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(buscar) ||
    cliente.dni.includes(buscar)
  );

  if (clientesFiltrados.length === 0) {
    lista.innerHTML = `
      <div class="cliente">
        <h3>No hay clientes cargados</h3>
        <p>Presione Guardar Cliente</p>
      </div>
    `;
    return;
  }

  lista.innerHTML = "";


 /* clientesFiltrados.forEach(cliente => {
    const vencido = estaVencido(cliente.vencimiento);

    lista.innerHTML += `
      <div class="cliente">
        <h3>${cliente.nombre}</h3>

        <p><strong>DNI:</strong> ${cliente.dni}</p>
        <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>Cuota:</strong> $${cliente.cuota}</p>
        <p><strong>Último pago:</strong> ${cliente.ultimoPago || "Sin pagos registrados"}</p>
        <p><strong>Próximo vencimiento:</strong> ${cliente.vencimiento}</p>

        <p>
          <strong>Estado:</strong>
          <span class="${vencido ? "estado-vencido" : "estado-ok"}">
            ${vencido ? "Vencido" : "Al día"}
          </span>
        </p>

        <button class="btn-pago" onclick="registrarPago(${cliente.id})">
          Registrar Pago
        </button>

        <button class="btn-editar" onclick="editarCliente(${cliente.id})">
          Editar
        </button>

        <button class="btn-eliminar" onclick="eliminarCliente(${cliente.id})">
          Eliminar
        </button>
      </div>
    `;
  });*/

clientesFiltrados.forEach(cliente => {
  const vencido = estaVencido(cliente.vencimiento);

  lista.innerHTML += `
    <div class="cliente">
      <h3>${cliente.nombre}</h3>

      <p><strong>DNI:</strong> ${cliente.dni}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono}</p>

      <p>
        <strong>Estado:</strong>
        <span class="${vencido ? "estado-vencido" : "estado-ok"}">
          ${vencido ? "Vencido" : "Al día"}
        </span>
      </p>

      <button class="btn-editar" onclick="verFichaCliente(${cliente.id})">
        Ver ficha
      </button>

      <button class="btn-pago" onclick="registrarPago(${cliente.id})">
        Registrar Pago
      </button>

      <button class="btn-editar" onclick="editarCliente(${cliente.id})">
        Editar
      </button>

      <button class="btn-eliminar" onclick="eliminarCliente(${cliente.id})">
        Eliminar
      </button>
    </div>
  `;
});







}



function mostrarHistorialPagos() {

  const lista = document.getElementById("listaPagos");

  if (!lista) return;

  const textoBusqueda = document
    .getElementById("buscarPago")
    .value
    .toLowerCase();

  let historial = [];

  clientes.forEach(cliente => {

    (cliente.pagos || []).forEach(pago => {

      historial.push({
        cliente: cliente.nombre,
        dni: cliente.dni,
        fecha: pago.fecha,
        importe: pago.importe,
        concepto: pago.concepto,
        medioPago: pago.medioPago
      });

    });

  });

  historial = historial.filter(p =>
    p.cliente.toLowerCase().includes(textoBusqueda) ||
    p.dni.includes(textoBusqueda)
  );

  historial.sort((a, b) => {

    const fa = a.fecha.split("/").reverse().join("");
    const fb = b.fecha.split("/").reverse().join("");

    return fb.localeCompare(fa);

  });

  if (historial.length === 0) {

    lista.innerHTML = `
      <div class="cliente">
        <h3>No hay pagos registrados</h3>
      </div>
    `;

    return;
  }

  lista.innerHTML = "";

  historial.forEach(pago => {

    lista.innerHTML += `
      <div class="pago-item">

        <h3>${pago.cliente}</h3>

        <p><strong>DNI:</strong> ${pago.dni}</p>

        <p><strong>Fecha:</strong> ${pago.fecha}</p>

        <p><strong>Concepto:</strong> ${pago.concepto}</p>

        <p><strong>Medio:</strong> ${pago.medioPago}</p>

        <p class="pago-importe">
          $${Number(pago.importe).toLocaleString("es-AR")}
        </p>

      </div>
    `;

  });

}




function eliminarCliente(id) {
  const confirmar = confirm("¿Desea eliminar este cliente?");

  if (!confirmar) {
    return;
  }

  clientes = clientes.filter(cliente => cliente.id !== id);

  guardarEnStorage();
  mostrarClientes();
  actualizarDashboard();
  mostrarNotificacion("Cliente eliminado correctamente", "ok");
}

function actualizarDashboard() {
  const total = clientes.length;

  const vencidos = clientes.filter(cliente =>
    estaVencido(cliente.vencimiento)
  ).length;

  const alDia = total - vencidos;

  const recaudacion = clientes.reduce((total, cliente) => {
    return total + (Number(cliente.cuota) || 0);
  }, 0);

  document.getElementById("totalClientes").innerText = total;
  document.getElementById("clientesAlDia").innerText = alDia;
  document.getElementById("clientesVencidos").innerText = vencidos;
  document.getElementById("recaudacionMes").innerText =
    "$" + recaudacion.toLocaleString("es-AR");
}

function limpiarFormulario() {
  document.getElementById("clienteId").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("dni").value = "";
  document.getElementById("telefono").value = "";
  document.getElementById("email").value = "";
  document.getElementById("cuota").value = "";
  document.getElementById("vencimiento").value = "";

  document.getElementById("tituloFormulario").innerText = "Nuevo Cliente";
  document.getElementById("btnGuardar").innerText = "Guardar Cliente";
  document.getElementById("btnCancelar").style.display = "none";
}

function guardarEnStorage() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function estaVencido(fechaVencimiento) {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);

  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  return vencimiento < hoy;
}

function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function mostrarNotificacion(mensaje, tipo) {
  const notificacion = document.getElementById("notificacion");

  notificacion.innerText = mensaje;
  notificacion.className = "notificacion " + tipo;
  notificacion.style.display = "block";

  setTimeout(() => {
    notificacion.style.display = "none";
  }, 2500);
}



function verFichaCliente(id) {
  const cliente = clientes.find(cliente => cliente.id === id);

  if (!cliente) {
    mostrarNotificacion("Cliente no encontrado", "error");
    return;
  }

  let historial = "";

  if (!cliente.pagos || cliente.pagos.length === 0) {
    historial = "<p>No hay pagos registrados</p>";
  } else {
    cliente.pagos.forEach(pago => {
      historial += `
        <div class="pago-item">
          <p><strong>Fecha:</strong> ${pago.fecha}</p>
          <p><strong>Concepto:</strong> ${pago.concepto}</p>
          <p><strong>Medio:</strong> ${pago.medioPago}</p>
          <p class="pago-importe">$${Number(pago.importe).toLocaleString("es-AR")}</p>
        </div>
      `;
    });
  }

  const ficha = `
    <div class="cliente">
      <h3>${cliente.nombre}</h3>

      <p><strong>DNI:</strong> ${cliente.dni}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
      <p><strong>Email:</strong> ${cliente.email || "-"}</p>
      <p><strong>Cuota:</strong> $${cliente.cuota}</p>
      <p><strong>Último pago:</strong> ${cliente.ultimoPago || "Sin pagos registrados"}</p>
      <p><strong>Próximo vencimiento:</strong> ${cliente.vencimiento}</p>

      <h3 style="margin-top:20px;">Historial de pagos</h3>
      ${historial}

      <button class="btn-pago" onclick="registrarPago(${cliente.id})">
        Registrar Pago
      </button>

      <button class="btn-editar" onclick="editarCliente(${cliente.id})">
        Editar
      </button>

      <button class="btn-eliminar" onclick="eliminarCliente(${cliente.id})">
        Eliminar
      </button>
    </div>
  `;

  document.getElementById("listaClientes").innerHTML = ficha;

  mostrarPantalla("Clientes");
  window.scrollTo(0, 0);
}



guardarEnStorage();
mostrarClientes();
actualizarDashboard();
mostrarHistorialPagos();