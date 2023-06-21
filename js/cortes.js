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
// VARIABLES REGEX
const regexNombre = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/;
const regexPrecio = /^\d+(\.\d{1,2})?$/;
const regexDescripcion = /^[\s\S]{1,500}$/;
const regexDisponibilidad = /^(disponible|no-disponible)$/;
const regexCantidad = /^\d+$/;
const regexIdCalidades = /^\d+$/;
const regexURL = /^(http|https|ftp):\/\/\S+/i;

// Variables DOM
const modal = document.getElementById('modal-lg');
const modalDanger = document.getElementById('modal-danger');
const btnAgregar = document.getElementById("btnAgregar");
const btnNuevoCorte = document.getElementById("btnNuevoCorte");
const btnGuardar = document.getElementById("btnGuardar");
let inputNombre = document.getElementById('inputNombre');
let inputPrecio = document.getElementById('inputPrecio');
let inputDescripcion = document.getElementById('inputDescripcion');
let inputDisponibilidad = document.getElementById('inputDisponibilidad');
let inputCantidad = document.getElementById('inputCantidad');
let inputIdCalidades = document.getElementById('inputIdCalidades');
let inputURL = document.getElementById('inputURL');

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
    if ($.fn.DataTable.isDataTable("#datatable_cortes")) {
        $("#datatable_cortes").DataTable().destroy();
    }
    await listUsers();
    dataTable = $("#datatable_cortes").DataTable(dataTableOptions).buttons().container().appendTo('#datatable_cortes_wrapper .col-md-6:eq(0)');
    dataTableIsInitialized = true;
}


// Inicialización de la DataTable
const initDataTable = async () => {
    await recreateDataTable();
};

// Ingresando Información a la tabla
const listUsers = async () => {
    const data = verifySession()
    const response = await fetch("/api/cortes/", {headers: {"Authorization": "Bearer: " + data.acessToken}})
    const cortes = await response.json()

    let content = ``;
    cortes.forEach((corte, index) => {
        let btnDisponibilidad;
        if (corte.disponibilidad) {
            btnDisponibilidad = `<button data-identifier="${corte.id}" class='btn btn-sm btn-success' id="check"><i class='fas fa-check'></i></button>`
        } else {
            btnDisponibilidad = `<button data-identifier="${corte.id}" class='btn btn-sm btn-danger' id="stop"><i class='fas fa-stop'></i></button>`
        }
        content += `
            <tr>
                <td>${corte.id}</td>
                <td>${corte.nombre}</td>
                <td>${corte.precio}</td>
                <td>${corte.descripcion_corte}</td>
                <td>${btnDisponibilidad}</td>
                <td>${corte.cantidad_disponible}</td>
                <td>${corte.idcalidades}</td>
                <td><a href="${corte.imagen}" target="_blank">${corte.imagen.slice(8, 20) + "..."}</a></td>
                <td>
                    <button data-identifier="${corte.id}" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-lg" id="editar"><i class="fas fa-pen"></i></button>
                    <button data-identifier="${corte.id}" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#modal-danger" id="eliminar"><i class="fas fa-trash"></i></button>
                </td>
                
            </tr>
            `
    });
    // Variable global para almacenar el identificador
    let identifier;

    // EDITAR CORTE
    $('#datatable_cortes').off('click', '#editar').on('click', '#editar', async function (event) {
        identifier = $(this).data('identifier');
        try {
            const response = await fetch(`/api/cortes/${identifier}`, {
                headers: {
                    "Authorization": `Bearer: ${data.acessToken}`
                }
            });

            const corte = await response.json();
            inputNombre.value = corte.nombre;
            inputPrecio.value = corte.precio;
            inputDescripcion.value = corte.descripcion_corte;
            inputDisponibilidad.value = corte.disponibilidad ? "disponible" : "no-disponible";
            inputCantidad.value = corte.cantidad_disponible;
            inputIdCalidades.value = corte.idcalidades;
            inputURL.value = corte.imagen;
        } catch (error) {
            redirectLogin();
        }

        btnGuardar.addEventListener("click", async () => {
                const inputs = [
                    {
                        regex: regexNombre,
                        value: inputNombre.value,
                        errorMessage: "Por favor verifique que el nombre esté bien escrito"
                    },
                    {
                        regex: regexPrecio,
                        value: inputPrecio.value,
                        errorMessage: "Por favor ingrese un precio válido"
                    },
                    {
                        regex: regexDescripcion,
                        value: inputDescripcion.value,
                        errorMessage: "Por favor verifique que la descripción esté correcta tiene que tener un maximo de 500 caracteres"
                    },
                    {
                        regex: regexDisponibilidad,
                        value: inputDisponibilidad.value,
                        errorMessage: "Por favor ingrese una disponibilidad válida"
                    },
                    {
                        regex: regexCantidad,
                        value: inputCantidad.value,
                        errorMessage: "Por favor ingrese una cantidad válida"
                    },
                    {
                        regex: regexIdCalidades,
                        value: inputIdCalidades.value,
                        errorMessage: "Por favor ingrese un ID calidad válida"
                    },
                    {
                        regex: regexURL,
                        value: inputURL.value,
                        errorMessage: "Por favor ingrese una URL válida"
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
                        nombre: `${inputNombre.value}`,
                        precio: parseFloat(inputPrecio.value),
                        descripcion_corte: `${inputDescripcion.value}`,
                        disponibilidad: (inputDisponibilidad.value === 'disponible'),
                        cantidad_disponible: parseInt(inputCantidad.value),
                        idcalidades: parseInt(inputIdCalidades.value),
                        imagen: `${inputURL.value}`
                    };

                    const queryParams = new URLSearchParams(params).toString();
                    const urlWithParams = `/api/cortes/${identifier}?${queryParams}`;
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
                        closeModal();
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
    $('#datatable_cortes').off('click', '#eliminar').on('click', '#eliminar', async function (event) {
        identifier = $(this).data('identifier');
        btnModalEliminar.addEventListener("click", async () => {
            const response = await fetch(`/api/cortes/${identifier}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    'Authorization': `Bearer: ${data.acessToken}`
                }
            });

            if (response.ok) {
                closeModal();
                toastr.remove();
                toastr["success"]("Eliminación de corte completada");
                await recreateDataTable();
            } else {
                redirectLogin();
            }
        })
    });


    // CHECK STATUS
    $('#datatable_cortes').off('click', '#check').on('click', '#check', async function (event) {
        const button = $(this);
        const identifier = button.data('identifier');
        const queryParams = new URLSearchParams({disponibilidad: 'false'});
        const urlWithParams = `/api/cortes/${identifier}?${queryParams}`;

        const response = await fetch(urlWithParams, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer: ${data.acessToken}`
            }
        });

        if (response.ok) {
            toastr.remove();
            toastr["success"]("Cambio de disponibilidad completado");

            // Actualizar el botón con la clase y el contenido correspondientes
            button
                .removeClass('btn-success')
                .addClass('btn-danger')
                .attr('id', 'stop')
                .html(`<i class='fas fa-stop'></i>`);

            await recreateDataTable();
        } else {
            redirectLogin();
        }
    });


    // STOP STATUS
    $('#datatable_cortes').off('click', '#stop').on('click', '#stop', async function (event) {
        const button = $(this);
        const identifier = button.data('identifier');
        const queryParams = new URLSearchParams({disponibilidad: 'true'});
        const urlWithParams = `/api/cortes/${identifier}?${queryParams}`;

        const response = await fetch(urlWithParams, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer: ${data.acessToken}`
            }
        });

        if (response.ok) {
            toastr.remove();
            toastr["success"]("Cambio de disponibilidad completado");

            // Actualizar el botón con la clase y el contenido correspondientes
            button
                .removeClass('btn-danger')
                .addClass('btn-success')
                .attr('id', 'check')
                .html(`<i class='fas fa-check'></i>`);

            await recreateDataTable();
        } else {
            redirectLogin();
        }
    });
    $(document).on("click", "#btnNuevoCorte", function () {
        const guardarHandler = async () => {
            if (checkInputs()) {
                try {
                    const response = await fetch('/api/cortes/', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            'Authorization': `Bearer: ${data.acessToken}`
                        },
                        body: JSON.stringify({
                            nombre: `${inputNombreNewItem.value}`,
                            precio: parseFloat(inputPrecioNewItem.value),
                            descripcion_corte: `${inputDescripcionNewItem.value}`,
                            disponibilidad: (inputDisponibilidadNewItem.value === 'disponible'),
                            cantidad_disponible: parseInt(inputCantidadNewItem.value),
                            idcalidades: parseInt(inputIdCalidadesNewItem.value),
                            imagen: `${inputURLNewItem.value}`
                        })
                    });

                    if (response.ok) {
                        closeModal();
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

    tableBody_cortes.innerHTML = content;

}
const checkInputs = () => {
    const inputs = [
        {
            regex: regexNombre,
            value: inputNombreNewItem.value,
            errorMessage: "Por favor verifique que el nombre esté bien escrito"
        },
        {
            regex: regexPrecio,
            value: inputPrecioNewItem.value,
            errorMessage: "Por favor ingrese un precio válido"
        },
        {
            regex: regexDescripcion,
            value: inputDescripcionNewItem.value,
            errorMessage: "Por favor verifique que la descripción esté correcta tiene que tener un maximo de 500 caracteres"
        },
        {
            regex: regexDisponibilidad,
            value: inputDisponibilidadNewItem.value,
            errorMessage: "Por favor ingrese una disponibilidad válida"
        },
        {
            regex: regexCantidad,
            value: inputCantidadNewItem.value,
            errorMessage: "Por favor ingrese una cantidad válida"
        },
        {
            regex: regexIdCalidades,
            value: inputIdCalidadesNewItem.value,
            errorMessage: "Por favor ingrese un ID calidad válida"
        },
        {
            regex: regexURL,
            value: inputURLNewItem.value,
            errorMessage: "Por favor ingrese una URL válida"
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
    $(`#modal-newItem`).modal('hide'); // Cierra el modal utilizando el método "hide" de Bootstrap
}

// Funcion para redireccionar al login
function redirectLogin() {
    toastr.remove();
    toastr["error"]("Autenticación de perfil inválido, serás redireccionado al inicio de sesión en segundos");
    localStorage.clear();
    setTimeout(() => {
        window.location.href = "../../PanelVM/index.html"
    }, 3000);
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
    await addInfoSidebar(verifySession());
    await initDataTable();
})

