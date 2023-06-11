// Variables DOM
const modal = document.getElementById('modal-lg'),
    modalDanger = document.getElementById('modal-danger'),
    btnAgregar = document.getElementById("btnAgregar"),
    inputDomicilio = document.getElementById("inputDomicilio"),
    inputNombres = document.getElementById("inputNombres"),
    inputApellidos = document.getElementById("inputApellidos"),
    inputCorreo = document.getElementById("inputCorreo");
// Verificacion de Inicio Unico
const
    data = JSON.parse(localStorage.getItem('sessionId'))
if (!data) {
    window.location.href = "../../PanelVM/index.html"
}
// Variable REGEX
const regexNombre = /^[a-zA-Záéíóúñ][a-záéíóúñ]{1,}(?:\s+[a-zA-Záéíóúñ][a-záéíóúñ]{1,}){0,2}(?:\s+[a-zA-Záéíóúñ][a-záéíóúñ]{1,}){0,1}$/,
    regexApellidos = /^[a-zA-Záéíóúñ][a-záéíóúñ]{1,}(?:\s+[a-zA-Záéíóúñ][a-záéíóúñ]{1,}){0,2}(?:\s+[a-zA-Záéíóúñ][a-záéíóúñ]{1,}){0,1}$/,
    regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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
    if ($.fn.DataTable.isDataTable("#datatable_users")) {
        // Destruir la instancia existente de DataTable
        $("#datatable_users").DataTable().destroy();
    }

    // Volver a cargar los datos actualizados en la tabla
    await listUsers();

    // Inicializar una nueva instancia de DataTable con los datos actualizados
    dataTable = $("#datatable_users").DataTable(dataTableOptions).buttons().container().appendTo('#datatable_users_wrapper .col-md-6:eq(0)');

    // Establecer la bandera de inicialización en true
    dataTableIsInitialized = true;
}


// Inicialización inicial de la DataTable
const initDataTable = async () => {
    await recreateDataTable();
};


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
// Ingresando Información a la tabla
const listUsers = async () => {
    try {
        const response = await fetch("/api/usuarios/", {headers: {"Authorization": "Bearer: " + data.acessToken}})
        const users = await response.json()

        let content = ``;
        users.forEach((user, index) => {
            content += `
            <tr>
                <td>${user.id}</td>
                <td>${user.nombres}</td>
                <td>${user.apellidos}</td>
                <td>${user.correo}</td>
                <td>${user.domicilio}</td>
                <td>
                    <button data-identifier="${user.id}" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-lg" id="editar"><i class="fas fa-pen"></i></button>
                    <button data-identifier="${user.id}" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#modal-danger" id="eliminar"><i class="fas fa-trash"></i></button>
                </td>
                
            </tr>
            `
        });
        // Variable global para almacenar el identificador
        let identifier;

        // Agregar eventos utilizando delegación de eventos
        $('#datatable_users').on('click', '#editar', async function (event) {
            identifier = $(this).data('identifier');
            const response = await fetch(`/api/usuarios/${identifier}`, {
                headers: {
                    "Authorization": "Bearer: " + data.acessToken
                }
            });
            const user = await response.json();
            inputCorreo.value = user.correo;
            inputNombres.value = user.nombres;
            inputApellidos.value = user.apellidos;
            inputDomicilio.value = user.domicilio;

            // Remover eventos anteriores del botón btnGuardar
            btnGuardar.removeEventListener("click", guardarCambios);

            // Agregar el evento click al botón btnGuardar
            btnGuardar.addEventListener("click", guardarCambios);
        });

        // Función para guardar los cambios
        async function guardarCambios() {
            const inputs = [{
                regex: regexCorreo,
                value: inputCorreo,
                errorMessage: "Por favor verifique que el correo esté bien escrito"
            },
                {
                    regex: regexNombre,
                    value: inputNombres,
                    errorMessage: "Por favor verifique que los nombres estén bien escritos"
                },
                {
                    regex: regexApellidos,
                    value: inputApellidos,
                    errorMessage: "Por favor verifique que los apellidos estén bien escritos"
                }
            ];

            let isOk = true;

            inputs.forEach(input => {
                if (!input.regex.test(input.value.value.trim())) {
                    toastr.remove();
                    toastr["error"](input.errorMessage, "Guardado inválido");
                    isOk = false;
                }
            });

            if (isOk) {
                const params = {
                    domicilio: `${inputDomicilio.value}`,
                    nombres: `${inputNombres.value}`,
                    apellidos: `${inputApellidos.value}`,
                    correo: `${inputCorreo.value}`,
                };

                const queryParams = new URLSearchParams(params).toString();
                const urlWithParams = `/api/usuarios/${identifier}?${queryParams}`;
                try {
                    const response = await fetch(urlWithParams, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer: ${data.acessToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Manejar la respuesta exitosa
                        closeModal();
                        toastr.remove(); // Eliminar todos los mensajes de Toastr visibles y ocultos
                        toastr["success"]("Actualización completada"); // Mostrar el nuevo mensaje de éxito
                        await recreateDataTable();
                    } else {
                        throw new Error('Error en la solicitud PUT');
                    }
                } catch (error) {
                    // Manejar el error
                    console.error(error);
                }
            }
        }

// Agregar eventos utilizando delegación de eventos
        $('#datatable_users').on('click', '#eliminar', function (event) {
            identifier = $(this).data('identifier');

            // Remover eventos anteriores del botón btnModalEliminar
            btnModalEliminar.removeEventListener("click", eliminarUsuario);

            // Agregar el evento click al botón btnModalEliminar
            btnModalEliminar.addEventListener("click", eliminarUsuario);
        });

// Función para eliminar el usuario
        async function eliminarUsuario() {
            try {
                const response = await fetch(`/api/usuarios/${identifier}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer: ${data.acessToken}`
                    }
                });

                if (response.ok) {
                    // Eliminación exitosa
                    closeModal();
                    toastr.remove(); // Eliminar todos los mensajes de Toastr visibles y ocultos
                    toastr["success"]("Eliminacion de usuario completada"); // Mostrar el nuevo mensaje de éxito
                    await recreateDataTable();
                }
            } catch (error) {
                // Manejar el error
                console.error(error);
            }
        }

        tableBody_users.innerHTML = content;

    } catch
        (e) {
        console.log(e);
    }
}

// Funcion para cerrar el Modal
function closeModal() {
    $(modal).modal('hide'); // Cierra el modal utilizando el método "hide" de Bootstrap modal
    $(modalDanger).modal('hide'); // Cierra el modal utilizando el método "hide" de Bootstrap modal

}

// --- EVENTOS ---
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

