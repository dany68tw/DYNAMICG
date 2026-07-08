/* ==========================================
   GYM MANAGER
   storage.js
   Manejo de almacenamiento
========================================== */

const Storage = {

    // ==========================
    // CLIENTES
    // ==========================

    obtenerClientes() {

        return JSON.parse(localStorage.getItem("clientes")) || [];

    },

    guardarClientes(clientes) {

        localStorage.setItem(
            "clientes",
            JSON.stringify(clientes)
        );

    },

    agregarCliente(cliente) {

        const clientes = this.obtenerClientes();

        clientes.push(cliente);

        this.guardarClientes(clientes);

    },

    actualizarCliente(clienteActualizado) {

        const clientes = this.obtenerClientes();

        const indice = clientes.findIndex(
            c => c.id == clienteActualizado.id
        );

        if (indice !== -1) {

            clientes[indice] = clienteActualizado;

            this.guardarClientes(clientes);

        }

    },

    eliminarCliente(id) {

        let clientes = this.obtenerClientes();

        clientes = clientes.filter(
            c => c.id != id
        );

        this.guardarClientes(clientes);

    },

    // ==========================
    // PAGOS
    // ==========================

    obtenerPagos() {

        return JSON.parse(localStorage.getItem("pagos")) || [];

    },

    guardarPagos(pagos) {

        localStorage.setItem(
            "pagos",
            JSON.stringify(pagos)
        );

    },

    agregarPago(pago) {

        const pagos = this.obtenerPagos();

        pagos.push(pago);

        this.guardarPagos(pagos);

    },

    // ==========================
    // ESTADÍSTICAS
    // ==========================

    cantidadClientes() {

        return this.obtenerClientes().length;

    },

    cantidadPagos() {

        return this.obtenerPagos().length;

    },

    limpiarTodo() {

        localStorage.removeItem("clientes");
        localStorage.removeItem("pagos");

    }

};