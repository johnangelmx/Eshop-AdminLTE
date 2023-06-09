// Verificacion de Inicio Unico
let data = JSON.parse(localStorage.getItem('sessionId'))
if (!data) {
    window.location.href = "../../PanelVM/index.html"
}
// Variables para  DataTable
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

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }
    await listUsers();
    dataTable = $("#datatable_users").DataTable(dataTableOptions).buttons().container().appendTo('#datatable_users_wrapper .col-md-6:eq(0)');
}

// Obteniendo Usuario Para Reutilizar sus datos y su acceso
const obtenerUsuario = async () => {
    const resp = await fetch(`/api/usuarios/${data.idUsuario}`, {
        headers: {"Authorization": "Bearer: " + data.acessToken}
    })
    if (!resp.ok) {
        window.location.href = "../../PanelVM/index.html"
    }
    return await resp.json();
}
// Agregando la información del usuario en la barra de la izquierda
const addInfoSidebar = async () => {
    let userdata = await obtenerUsuario()
    usuarioPanelDerecho.innerText = `${userdata.nombres} ${userdata.apellidos}`
}
// Ingresando Informacion a la tabla
const listUsers = async () => {
    try {
        const response = await fetch("/api/usuarios/", {headers: {"Authorization": "Bearer: " + data.acessToken}})
        const users = await response.json()

        let content = ``;
        users.forEach((user, index) => {
            content += `
            <tr>
                <td>${index + 1}</td>
                <td>${user.nombres}</td>
                <td>${user.apellidos}</td>
                <td>${user.correo}</td>
                <td>${user.domicilio}</td>
                <td>
                    <button class="btn btn-sm btn-primary"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                </td>
                
            </tr>
            `
        });
        tableBody_users.innerHTML = content;

    } catch (e) {
        console.log(e);
    }
}

// Cerrar Sesion
cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.clear();
    window.location.href = "../../PanelVM/index.html"
})
// Evento de carga de la página
window.addEventListener("load", async () => {
    await addInfoSidebar();
    await initDataTable();
})
