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
    return true;
};
// ----------------------------------------------------------------
// FUNCIONES ⬇
// Ingresar informacion a las cards
const ordenesNuevas = async () => {
    try {
        const response = await fetch(`/api/pedidos/`, {
            headers: {
                "Authorization": `Bearer: ${verifySession().acessToken}`
            }
        })
        const data = await response.json();
        let ordenesNuevas = 0;
        data.forEach(orden => {
            if (orden.estatus === false) {
                ordenesNuevas++;
            }
        });

        const elemento = document.getElementById("ordenes-nuevas-overlay");
        if (elemento) {
            elemento.remove();
        }
        document.getElementById("ordenes-nuevas").innerHTML = `<h3>${ordenesNuevas}</h3><p>Órdenes Nuevas</p>`;
    } catch (e) {
        redirectLogin();
    }
    return true;
}
const usuariosRegistrados = async () => {
    try {
        const response = await fetch(`/api/usuarios/`, {
            headers: {
                "Authorization": `Bearer: ${verifySession().acessToken}`
            }
        })
        const data = await response.json();
        let usuariosRegistrados = 0;
        data.forEach(usuario => {
            usuariosRegistrados++;
        });
        const elemento = document.getElementById("usuarios-registrados-overlay");
        if (elemento) {
            elemento.remove();
        }
        document.getElementById("usuarios-registrados").innerHTML = `<h3>${usuariosRegistrados}</h3><p>Usuarios Registrados</p>`;
    } catch (e) {
        redirectLogin();
    }
    return true;
}
const ordenesCompletas = async () => {
    try {
        const response = await fetch(`/api/pedidos/`, {
            headers: {
                "Authorization": `Bearer: ${verifySession().acessToken}`
            }
        })
        const data = await response.json();
        let ordenesCompletas = 0;
        data.forEach(orden => {
            if (orden.estatus === true) {
                ordenesCompletas++;
            }
        });
        const elemento = document.getElementById("ordenes-completas-overlay");
        if (elemento) {
            elemento.remove();
        }
        document.getElementById("ordenes-completas").innerHTML = `<h3>${ordenesCompletas}</h3><p>Órdenes Completas</p>`;
    } catch (e) {
        redirectLogin();
    }
    return true;
}
const cortesRegistrados = async () => {
    try {
        const response = await fetch(`/api/cortes/`, {
            headers: {
                "Authorization": `Bearer: ${verifySession().acessToken}`
            }
        })
        const data = await response.json();
        let cortesRegistrados = 0;
        data.forEach(corte => {
            cortesRegistrados++;
        });
        const elemento = document.getElementById("cortes-registrados-overlay");
        if (elemento) {
            elemento.remove();
        }
        document.getElementById("cortes-registrados").innerHTML = `<h3>${cortesRegistrados}</h3><p>Cortes Registrados</p>`;
    } catch (e) {
        redirectLogin();
    }
    return true;
}
// REDIRECCIONAR AL INICIO DE SESION
const redirectLogin = () => {
    toastr.remove();
    toastr["error"]("Autenticación de perfil inválido, serás redireccionado al inicio de sesión en segundos");
    localStorage.clear();
    setTimeout(() => {
        window.location.href = "../../PanelVM/index.html"
    }, 3000);
}
// ----------------------------------------------------------------
// EVENTOS ⬇
// Cerrar Sesion
cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.clear();
    window.location.href = "../../PanelVM/index.html"
})

// EVENTO AL INICIAR EL PANEL
window.addEventListener("load", () => {
    addInfoSidebar(verifySession());
    ordenesNuevas();
    usuariosRegistrados();
    ordenesCompletas();
    cortesRegistrados();
})
