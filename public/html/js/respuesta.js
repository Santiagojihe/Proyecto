document.querySelector('#send').addEventListener('click', (e) => {
    e.preventDefault();
    let a = document.querySelector('#a').value;
    let b = document.querySelector('#b').value;
    fetch('/respuesta', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ciudadA: a,
            ciudadB: b
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {// Verifica los datos recibidos en la consola
        const horas = Math.floor(data.respuesta.tiempoT / 60);
        const minutos = data.respuesta.tiempoT %60;
        const distancia = document.querySelector('#distancia').innerHTML = data.respuesta.distanciaT;
        const tiempo = document.querySelector('#tiempo').innerHTML = horas+":"+minutos;
        const recorridoT = document.querySelector('#recorridoT').innerHTML = data.respuesta.caminotie;
        const recorridoD = document.querySelector('#recorridoD').innerHTML = data.respuesta.caminodis;
    })
    .catch(error => {
        console.error('Error:', error);
    });
});