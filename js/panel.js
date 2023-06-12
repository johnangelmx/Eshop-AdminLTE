// Dom
let usuarioPanelDerecho = document.getElementById("usuarioPanelDerecho")
let cerrarSesion = document.getElementById("cerrarSesion")

// Verificacion de Inicio Unico
let data = JSON.parse(localStorage.getItem('sessionId'))
if (!data) {
    window.location.href = "../../PanelVM/index.html"
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

const addInfoSidebar = async () => {
    let userdata = await obtenerUsuario()
    usuarioPanelDerecho.innerText = `${userdata.nombres}`
}

addInfoSidebar();

// Cerrar Sesion
cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.clear();
    window.location.href = "../../PanelVM/index.html"
})

