// DOM ⬇
let inEmail = document.getElementById("inEmail"),
    inPassword = document.getElementById("inPassword"),
    btnLogin = document.getElementById("btnLogin");
// Variables
const URL = "https://genmx-viandamarket-back-production.up.railway.app"
// Regex ⬇
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])([^\s]){8,20}$/;

// Funciones ⬇
const regexPass = (email, password) => {
    if (email != null && emailRegex.test(email)) {
        if (password != null && passwordRegex.test(password)) {
            return true;
        }
        toastr["error"]("Por favor, verifique que la contraseña esté correctamente escrita", "Ingreso Invalido")
        return false
    }
    toastr["error"]("Por favor, verifique que el correo esté correctamente escrito", "Ingreso Invalido")
    return false;
}
const verifyLogin = async () => {
    let body = {
        correo: `${inEmail.value}`,
        contrasena: `${inPassword.value}`
    };
    try {
        const resp = await fetch(`${URL}/api/login/`, {
            method: 'POST',
            headers: new Headers({'Content-type': 'application/json'}),
            mode: 'cors',
            body: JSON.stringify(body)
        });

        if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem('resultado', JSON.stringify(data));

            toastr.success('¡Operación exitosa!', 'Éxito');
            window.location.assign("../pages/dashboard.html");
        }
    } catch (error) {
        toastr["error"]("Por favor verifique sus credenciales", "Ingreso Invalido")
    }
}
// Listeners ⬇
btnLogin.addEventListener("click", (e) => {
    e.preventDefault();
    if (regexPass(inEmail.value.trim(), inPassword.value.trim())) {
        verifyLogin();
    }
})



