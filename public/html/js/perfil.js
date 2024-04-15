fetch('/perfil', {
    method: 'GET',
    headers: { "Content-Type": "application/json" }
})
.then(response => response.json())
.then(data => {
    const email=document.querySelector("#email").innerHTML = data.usuario.email;
    const nombre=document.querySelector("#nombre").innerHTML = data.usuario.nombre;
    const apellido=document.querySelector("#apellido").innerHTML = data.usuario.apellido;
    
})
.catch(error => {
    console.error('Error al obtener el perfil del usuario:', error);
    // Manejar el error adecuadamente, por ejemplo, mostrar un mensaje al usuario
});