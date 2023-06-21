// INICIO DE SESION UNICO - VERIFICAR SI LA INFORMACION DE LOGIN FUE GUARDADA
const verifySession = () => {
    const data = JSON.parse(localStorage.getItem('sessionId'));
    if (!data) {
        redirectLogin();
    }
    return data;
};
// AGREGAR NOMBRE DEL USUARIO EN EL PANEL IZQUIERDO
const addInfoSidebar = async (data) => {
    try {
        const response = await fetch(`/api/usuarios/${data.idUsuario}`, {
            headers: {
                "Authorization": `Bearer: ${data.acessToken}`
            }
        });
        const userData = await response.json();
        const usuarioPanelDerecho = document.getElementById("usuarioPanelDerecho");
        usuarioPanelDerecho.innerText = userData.nombres;
    } catch (error) {
        redirectLogin();
    }
};
// DOM variables
let inputNombreMarca = document.getElementById("inputNombreMarca");
let inputPais = document.getElementById("inputPais");
let inputDescripcion = document.getElementById("inputDescripcion");
let inputCalidad = document.getElementById("inputCalidad");
const btnGuardar = document.getElementById("btnGuardar");
const btnNuevaCalidad = document.getElementById("btnNuevaCalidad");
const btnGuardarNewItem = document.getElementById("btnGuardarNewItem");
// REGEX variables
const regexNombreMarca = /^.{1,45}$/;
const regexPais = /^.{1,45}$/;
const regexDescripcion = /^[\s\S]{1,500}$/;
const regexCalidad = /^.{1,45}$/;
// Variables para PLUGIN DataTable
let dataTable;
let dataTableIsInitialized = false;
const dataTableOptions = {
    "pageLength": 8,
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

// Función para recrear la DataTable
async function recreateDataTable() {
    if ($.fn.DataTable.isDataTable("#datatable_gramos")) {
        $("#datatable_gramos").DataTable().destroy();
    }
    await listUsers();
    dataTable = $("#datatable_gramos").DataTable(dataTableOptions).buttons().container().appendTo('#datatable_gramos_wrapper .col-md-6:eq(0)');
    dataTableIsInitialized = true;
}


// Inicialización de la DataTable
const initDataTable = async () => {
    await recreateDataTable();
};
listUsers = async () => {
    const data = verifySession()
    const response = await fetch("/api/gramos/", {headers: {"Authorization": "Bearer: " + data.acessToken}})
    const gramos = await response.json()

    let content = ``;
    gramos.forEach((gramo, index) => {
        content += `
            <tr>
                <td>${gramo.idgramos}</td>
                <td>${gramo.cantidad}</td>
                <td>${gramo.idcortes}</td>
                <td>${gramo.idcomplementos}</td>
                <td>
                    <button data-identifier="${gramo.idgramos}" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-lg" id="editar"><i class="fas fa-pen"></i></button>
                    <button data-identifier="${gramo.idgramos}" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#modal-danger" id="eliminar"><i class="fas fa-trash"></i></button>
                </td>
                
            </tr>
            `
    });
    // Variable global para almacenar el identificador
    let identifier;

    // EDITAR GRAMOS
    $('#datatable_gramos').off('click', '#editar').on('click', '#editar', async function (event) {
        identifier = $(this).data('identifier');
        try {
            const response = await fetch(`/api/gramos/${identifier}`, {
                headers: {
                    "Authorization": `Bearer: ${data.acessToken}`
                }
            });

            const gramos = await response.json();
            inputCantidadGramos.value = gramos.cantidad;
            inputIdCortes.value = gramos.idcortes;
            inputIdComplementos.value = gramos.idcomplementos;
        } catch (error) {
            redirectLogin();
        }

        btnGuardar.addEventListener("click", async () => {
                const params = {
                    cantidad: `${inputCantidadGramos.value}`,
                    idcortes: `${inputIdCortes.value}`,
                    idcomplementos: `${inputIdComplementos.value}`
                };

                const queryParams = new URLSearchParams(params).toString();
                const urlWithParams = `/api/gramos/${identifier}?${queryParams}`;
                const response = await fetch(urlWithParams, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        'Authorization': `Bearer: ${data.acessToken}`
                    }
                });
                if (response.ok) {
                    // Manejar la respuesta exitosa
                    $('#modal-lg').modal('hide');
                    toastr.remove(); // Eliminar todos los mensajes de Toastr visibles y ocultos
                    toastr["success"]("Actualización completada"); // Mostrar el nuevo mensaje de éxito
                    await recreateDataTable();
                } else {
                    redirectLogin();
                }
            }
        )
    });


    // ELIMINAR
    $('#datatable_gramos').off('click', '#eliminar').on('click', '#eliminar', async function (event) {
        identifier = $(this).data('identifier');
        btnModalEliminar.addEventListener("click", async () => {
            const response = await fetch(`/api/gramos/${identifier}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    'Authorization': `Bearer: ${data.acessToken}`
                }
            });

            if (response.ok) {
                $('#modal-danger').modal('hide');
                toastr.remove();
                toastr["success"]("Eliminación de gramaje completada");
                await recreateDataTable();
            } else {
                redirectLogin();
            }
        })
    });

    $(document).on("click", "#btnNuevoGramaje", function () {
        const guardarHandler = async () => {
            try {
                const response = await fetch('/api/gramos/', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        'Authorization': `Bearer: ${data.acessToken}`
                    },
                    body: JSON.stringify({
                        cantidad: `${inputCantidadGramosNewItem.value}`,
                        idcortes: `${inputIdCortesNewItem.value}`,
                        idcomplementos: `${inputIdComplementosNewItem.value}`
                    })
                });

                if (response.ok) {
                    $('#modal-newItem').modal('hide');
                    toastr.remove();
                    toastr["success"]("Gramos agregado con éxito!");
                    await recreateDataTable();
                } else {
                    redirectLogin();
                }
            } catch (e) {
                console.error(e);
                redirectLogin();
            }
        };

        $("#btnGuardarNewItem").off("click").on("click", guardarHandler);
    });

    tableBody_gramos.innerHTML = content;

}

// REDIRECCIONAR AL INICIO DE SESION
function redirectLogin() {
    toastr.remove();
    toastr["error"]("Autenticación de perfil inválido, serás redireccionado al inicio de sesión en segundos");
    localStorage.clear();
    setTimeout(() => {
        window.location.href = "../../PanelVM/index.html"
    }, 3000);
}

// Cerrar Sesion
cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.clear();
    window.location.href = "../../PanelVM/index.html"
})

// EVENTO AL INICIAR EL PANEL
window.addEventListener("load", async () => {
    await addInfoSidebar(verifySession());
    await initDataTable();
})
