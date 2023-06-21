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
    if ($.fn.DataTable.isDataTable("#datatable_calidad")) {
        $("#datatable_calidad").DataTable().destroy();
    }
    await listUsers();
    dataTable = $("#datatable_calidad").DataTable(dataTableOptions).buttons().container().appendTo('#datatable_calidad_wrapper .col-md-6:eq(0)');
    dataTableIsInitialized = true;
}


// Inicialización de la DataTable
const initDataTable = async () => {
    await recreateDataTable();
};
listUsers = async () => {
    const data = verifySession()
    const response = await fetch("/api/calidad/", {headers: {"Authorization": "Bearer: " + data.acessToken}})
    const calidades = await response.json()

    let content = ``;
    calidades.forEach((calidad, index) => {
        content += `
            <tr>
                <td>${calidad.id}</td>
                <td>${calidad.marca}</td>
                <td>${calidad.pais}</td>
                <td>${calidad.descripcion_marca}</td>
                <td>${calidad.calidad}</td>
                <td>
                    <button data-identifier="${calidad.id}" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-lg" id="editar"><i class="fas fa-pen"></i></button>
                    <button data-identifier="${calidad.id}" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#modal-danger" id="eliminar"><i class="fas fa-trash"></i></button>
                </td>
                
            </tr>
            `
    });
    // Variable global para almacenar el identificador
    let identifier;

    // EDITAR CORTE
    $('#datatable_calidad').off('click', '#editar').on('click', '#editar', async function (event) {
        identifier = $(this).data('identifier');
        try {
            const response = await fetch(`/api/calidad/${identifier}`, {
                headers: {
                    "Authorization": `Bearer: ${data.acessToken}`
                }
            });

            const calidad = await response.json();
            inputNombreMarca.value = calidad.marca;
            inputPais.value = calidad.pais;
            inputDescripcion.value = calidad.descripcion_marca;
            inputCalidad.value = calidad.calidad;
        } catch (error) {
            redirectLogin();
        }

        btnGuardar.addEventListener("click", async () => {
                const inputs = [
                    {
                        regex: regexNombreMarca,
                        value: inputNombreMarca.value,
                        errorMessage: "Por favor verifique que el nombre esté bien escrito"
                    },
                    {
                        regex: regexPais,
                        value: inputPais.value,
                        errorMessage: "Por favor verifique que el pais esté bien escrito"
                    },
                    {
                        regex: regexDescripcion,
                        value: inputDescripcion.value,
                        errorMessage: "Por favor verifique que la descripción esté bien escrito"
                    },
                    {
                        regex: regexCalidad,
                        value: inputCalidad.value,
                        errorMessage: "Por favor verifique que la calidad esté bien escrito"
                    }
                ];

                let isOk = true;

                inputs.forEach(input => {
                    if (!input.regex.test(input.value.trim())) {
                        toastr.remove();
                        toastr["error"](input.errorMessage, "Guardado inválido");
                        isOk = false;
                    }
                });

                if (isOk) {
                    const params = {
                        marca: `${inputNombreMarca.value}`,
                        pais: `${inputPais.value}`,
                        descripcion_marca: `${inputDescripcion.value}`,
                        calidad: `${inputCalidad.value}`

                    };

                    const queryParams = new URLSearchParams(params).toString();
                    const urlWithParams = `/api/calidad/${identifier}?${queryParams}`;
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
            }
        )
    });


    // ELIMINAR
    $('#datatable_calidad').off('click', '#eliminar').on('click', '#eliminar', async function (event) {
        identifier = $(this).data('identifier');
        btnModalEliminar.addEventListener("click", async () => {
            const response = await fetch(`/api/calidad/${identifier}`, {
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
                toastr["success"]("Eliminación de calidad completada");
                await recreateDataTable();
            } else {
                redirectLogin();
            }
        })
    });

    $(document).on("click", "#btnNuevaCalidad", function () {
        const guardarHandler = async () => {
            if (checkInputs()) {
                try {
                    const response = await fetch('/api/calidad/', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            'Authorization': `Bearer: ${data.acessToken}`
                        },
                        body: JSON.stringify({
                            marca: `${inputNombreMarcaNewItem.value}`,
                            pais: `${inputPaisNewItem.value}`,
                            descripcion_marca: `${inputDescripcionNewItem.value}`,
                            calidad: `${inputCalidadNewItem.value}`
                        })
                    });

                    if (response.ok) {
                        $('#modal-newItem').modal('hide');
                        toastr.remove();
                        toastr["success"]("Corte agregado con éxito!");
                        await recreateDataTable();
                    } else {
                        redirectLogin();
                    }
                } catch (e) {
                    console.error(e);
                    redirectLogin();
                }
            }
        };

        $("#btnGuardarNewItem").off("click").on("click", guardarHandler);
    });

    tableBody_calidad.innerHTML = content;

}
const checkInputs = () => {
    const inputs = [
        {
            regex: regexNombreMarca,
            value: inputNombreMarcaNewItem.value,
            errorMessage: "Por favor verifique que el nombre esté bien escrito"
        },
        {
            regex: regexPais,
            value: inputPaisNewItem.value,
            errorMessage: "Por favor verifique que el pais esté bien escrito"
        },
        {
            regex: regexDescripcion,
            value: inputDescripcionNewItem.value,
            errorMessage: "Por favor verifique que la descripción esté bien escrito"
        },
        {
            regex: regexCalidad,
            value: inputCalidadNewItem.value,
            errorMessage: "Por favor verifique que la calidad esté bien escrito"
        }
    ];

    inputs.forEach(input => {
        if (!input.regex.test(input.value.trim())) {
            toastr.remove();
            toastr["error"](input.errorMessage, "Guardado inválido");
            return false;
        }
    });
    return true
}

// Funcion para cerrar el Modal
function closeModal() {
    $(modal).modal('hide'); // Cierra el modal utilizando el método "hide" de Bootstrap modal
    $(modalDanger).modal('hide'); // Cierra el modal utilizando el método "hide" de Bootstrap modal
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
