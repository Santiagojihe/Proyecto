document.addEventListener("DOMContentLoaded", (event) => {
    fetch('/obtenerEstadoSillas')
      .then(response => response.json())
      .then(data => {
        if (data == null) {
          return;
        }
        data.forEach((sillavacia) => {
          document.querySelectorAll(`.silla${sillavacia.id}`).forEach((el) => {
            if (sillavacia.estado == 'ocupado') {
              el.style.fill = "blue"
            }
          })
        })
      });
  });
  // Hace un barrido de cada una de las sillas
  let sillasSeleccionadas = [];
  document.querySelectorAll(".silleteria").forEach((el) => {
    // Activa el elemento click por cada silla
    el.addEventListener("click", async (event) => {
      // obtiene los hijos por cada una de las sillas
      Array(...el.children).forEach((child) => {
        // evalua si la silla contiene la clase silla$
        if (child.classList.contains(el.id)) {
          if (child.style.fill !== "blue") {
            // evalua si la clase es color rojo para modificarla a gris y rojo
            if (child.style.fill == "red") {
              console.log(el.id, 'close');
              // aqui va la alerta
              child.style.fill = "#dcdcdc";
              const index = sillasSeleccionadas.indexOf(el.id);
              if (index !== -1) {
                sillasSeleccionadas.splice(index, 1);
                console.log(sillasSeleccionadas);
              }
            } else {
              console.log(el.id, 'open');
              child.style.fill = "red";
              if (!sillasSeleccionadas.includes(el.id)) {
                sillasSeleccionadas.push(el.id);
                console.log(sillasSeleccionadas);
              }
            }
          }
        }
      });
      document.getElementById("enviarBtn").addEventListener("click", async () => {
        try {
          const response = await fetch('/Reservas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sillasIDS: sillasSeleccionadas })
          }).then(response => response.json())
          .then((data) => {
            if (data.ok == 'ok') {
              console.log("se ha reservado su silla")
            }
            alert("su silla se ha seleccionado correctamente");
          }).catch(() => {
            throw new Error('Error al enviar las sillas seleccionadas al servidor');
          });
        } catch (error) {
          console.error('Error al enviar las sillas seleccionadas al servidor:', error);
          // Manejar el error adecuadamente, por ejemplo, mostrar un mensaje al usuario
        }
      });

    });
  });
  const sillasSeleccionadasElement = document.querySelector('.respuesta-box');

  document.getElementById("enviarBtn").addEventListener("click", async () => {
      try {
          const response = await fetch('/Reservas', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sillasIDS: sillasSeleccionadas })
          });

          const data = await response.json();

          if (data.ok == 'ok') {
              // Limpiar el contenido anterior antes de mostrar las nuevas sillas seleccionadas
              sillasSeleccionadasElement.innerHTML = "";
              // Mostrar las sillas seleccionadas en el div
              sillasSeleccionadas.forEach(silla => {
                  const pElement = document.createElement('p');
                  pElement.textContent = `Silla seleccionada: ${silla}`;
                  sillasSeleccionadasElement.appendChild(pElement);
              });
              // No es necesario actualizar la página aquí, ya que solo estás actualizando el contenido del div
          }
      } catch (error) {
          console.error('Error al enviar las sillas seleccionadas al servidor:', error);
          // Manejar el error adecuadamente, por ejemplo, mostrar un mensaje al usuario
      }
  });