// Datos guardados en el local storage
const data = JSON.parse(localStorage.getItem('sessionId'))
// Variables para PLUGIN DataTable
let dataTable;
let dataTableIsInitialized = false;
const dataTableOptions = {
    "pageLength": 15,
    "destroy": true,
    "language": {
        "decimal": "",
        "emptyTable": "No hay información",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
        "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
        "infoFiltered": "(Filtrado de _MAX_ total entradas)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrar _MENU_ Entradas",
        "loadingRecords": "Cargando...",
        "processing": "Procesando...",
        "search": "Buscar:",
        "zeroRecords": "Sin resultados encontrados",
        "paginate": {
            "first": "Primero",
            "last": "Ultimo",
            "next": "Siguiente",
            "previous": "Anterior"
        }
    },
    "responsive": true,
    "lengthChange": false,
    "autoWidth": false,
    "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
}
// Inicializando DataTable

// Función para recrear la DataTable
async function recreateDataTable() {
    // Verificar si dataTable es una instancia válida de DataTable
    if ($.fn.DataTable.isDataTable("#datatable_pedidos")) {
        // Destruir la instancia existente de DataTable
        $("#datatable_pedidos").DataTable().destroy();
    }

    // Volver a cargar los datos actualizados en la tabla
    await listUsers();

    // Inicializar una nueva instancia de DataTable con los datos actualizados
    dataTable = $("#datatable_pedidos").DataTable(dataTableOptions).buttons().container().appendTo('#datatable_pedidos_wrapper .col-md-6:eq(0)');

    // Establecer la bandera de inicialización en true
    dataTableIsInitialized = true;
}


// Inicialización inicial de la DataTable
const initDataTable = async () => {
    await recreateDataTable();
};

// Ingresando Información a la tabla
const listUsers = async () => {
    let content = ``;
    try {

        const response = await fetch("/api/pedidos/", {headers: {"Authorization": "Bearer: " + data.acessToken}})
        const pedidos = await response.json()

        pedidos.forEach(pedido => {
            let btnStatus;
            if (!pedido.estatus) {
                btnStatus = `<button data-identifier="${pedido.id_pedido}" class='btn btn-sm btn-danger' id="stop"><i class='fas fa-stop'></i></button>`
                content += `
            <tr>
                <td>${pedido.id_pedido}</td>
                <td>${pedido.nombre}</td>
                <td>${pedido.precio}</td>
                <td>${pedido.gramaje}</td>
                <td>${pedido.cantidad}</td>
                <td>${btnStatus}</td>
                <td>${pedido.fechaGuardado}</td>
                <td>${pedido.id_usuarios}</td>
            </tr>
            `
            }
        });
    } catch (e) {
        redirectLogin();
    }

    // STOP STATUS
    $('#datatable_pedidos').off('click', '#stop').on('click', '#stop', async function (event) {
        const button = $(this);
        const identifier = button.data('identifier');
        const queryParams = new URLSearchParams({estatus: true});
        const urlWithParams = `/api/pedidos/${identifier}?${queryParams}`;

        const response = await fetch(urlWithParams, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer: ${data.acessToken}`
            }
        });

        if (response.ok) {
            toastr.remove();
            toastr["success"]("Cambio de estatus completado");

            // Actualizar el botón con la clase y el contenido correspondientes
            button
                .removeClass('btn-danger')
                .addClass('btn-success')
                .attr('id', 'check')
                .html(`<i class='fas fa-check'></i>`);

            await recreateDataTable();
            await ordenesNuevas();
            await usuariosRegistrados();
            await ordenesCompletas();
            await cortesRegistrados();
        } else {
            redirectLogin();
        }
    });

    tableBody_pedidos.innerHTML = content;

}

// --- EVENTOS ---
// Evento de carga de la página
window.addEventListener("load", async () => {
    await initDataTable();
})

