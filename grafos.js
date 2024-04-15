const express = require('express');
const fs = require('fs');
const http = require('http');
const morgan = require('morgan');
const app = express();
const server = http.createServer(app);
const bodyParser=require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
dotenv.config();
const { Pool } = require("pg");
const config = require('./config.js');
const { generateAccessToken, generateRefreshToken, generateRandomToken, generarString } = require('./auth.js');
const nodemailer = require('nodemailer');
require('dotenv').config();
app.use(cookieParser());
/////////////////conexion a la base de datos/////////////
const connectionString = process.env.POSTGRESQL_EXTERNAL_DB;
const pool = new Pool({
    connectionString,
});
/////////////////////////////////////////////////////////
/*const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodelogin'
});*/
pool.connect((err) => {
    if (err) {
        console.log('error de conexion');
    }
    else{console.log('Conectado a la base de datos MySQL');}
    
});
/////////////////////////////////////
app.get("/todos", getTodos);
app.get('/create',createDatabase);
app.post('/inserta',insertar);
app.put('/updated',getUpdated);
app.delete("/borrar",borrar);
////////////////////////////////////CRUD////////////////////////////////////
async function createDatabase(req, res) {
    try {
        const client = await pool.connect();
        // Obtener todos los "todos" de la base de datos
        results = await client.query( `CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            apellido VARCHAR(255) NOT NULL,
            passw VARCHAR(255) NOT NULL
        )`);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving ");
    }
}
route.get("/create", createDatabase);

async function getUpdated(req, res) {
    try {
    const client = await pool.connect();
    const results = await client.query("UPDATE users SET passw='go2s' WHERE email='godofredo@gmail.com'");
    const todos = results.rows;
    res.status(200).json(todos);
    console.log(todos)
    }
    catch(err){
        console.error(err);
        res.status(500).send("error al eliminar");
    }
}
route.put("/updated", getUpdated);

async function getTodos(req, res) {
    try {
        // Obtener todos los "todos" de la base de datos
        const client = await pool.connect();
        const results = await client.query("SELECT * FROM users");
        const todos = results.rows;
        res.status(200).json(todos);
        console.log(todos)
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving ");
    }
}
route.get("/todos", getTodos);

async function insertar(req, res) {
    try {
        // Validar la entrada del body
        // Crear un nuevo "todo" en la base de datos
        const client = await pool.connect();
        const results = await client.query(
            `INSERT INTO users (email, nombre, apellido,passw) VALUES
            ('godofredo@gmail.com', 'godo', 'fredo', '123456')`);
        const todos = results.rows;
        res.status(200).json(todos);
        console.log(todos)
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating ");
    }
}
route.get("/inserta",insertar)

async function borrar(req, res) {
    try {
        // Validar la entrada del body
        // Crear un nuevo "todo" en la base de datos
        const client = await pool.connect();
        const results = await client.query(
            "DELETE FROM users WHERE email='godofredo@gmail.com'"
           
        );
        const todos = results.rows;
        res.status(200).json(todos);
        console.log(todos)
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating ");
    }
}
route.delete("/borrar",borrar)
////////////////////////////////////CRUD////////////////////////////////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/html', express.static(path.join(__dirname, 'public','html')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

class Grafo {
    constructor() {
        this.vertices = {};
    }

    agregarArista(ciudad1, ciudad2, distancia, tiempo) {
        if (!(ciudad1 in this.vertices)) {
            this.vertices[ciudad1] = [];
        }
        if (!(ciudad2 in this.vertices)) {
            this.vertices[ciudad2] = [];
        }

        this.vertices[ciudad1].push([ciudad2, distancia, tiempo]);
        this.vertices[ciudad2].push([ciudad1, distancia, tiempo]);
    }

    dijkstra(inicio, fin, parametro) {
        const heap = [[0, inicio, []]];
        const visitados = new Set();

        while (heap.length > 0) {
            heap.sort((a, b) => a[0] - b[0]);
            const [costo, actual, camino] = heap.shift();

            if (!visitados.has(actual)) {
                visitados.add(actual);
                camino.push(actual);

                if (actual === fin) {
                    return [costo, camino];
                }

                for (const [vecino, distancia, tiempo] of this.vertices[actual]) {
                    if (parametro === 'distancia') {
                        heap.push([costo + distancia, vecino, camino.slice()]);
                    } else if (parametro === 'tiempo') {
                        heap.push([costo + tiempo, vecino, camino.slice()]);
                    }
                }
            }
        }

        return [Infinity, []];
    }
}

function cargarDatos(archivo) {
    const grafo = new Grafo();

    const data = JSON.parse(fs.readFileSync(archivo, 'utf8'));

    for (const row of data) {
        grafo.agregarArista(
            row["Nombre Ciudad A"],
            row["Nombre Ciudad B"],
            row["Distancia (km)"],
            row["Tiempo (min)"]
        );
    }

    return grafo;
}

const archivoJSON = "ViasCol.json";
const grafo = cargarDatos(archivoJSON);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/login.html');
});
app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/obtenerEstadoSillas', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, estado FROM Bus');
      // Devolver los datos en formato JSON
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener el estado de las sillas:', error);
      // Enviar un código de estado 500 (error interno del servidor) en caso de error
      res.status(500).json({ error: 'Error al obtener el estado de las sillas' });
    }
  });

  app.post('/Reservas', async (req, res) => {
    try {
      // Recibe las sillas seleccionadas desde el cliente
        const sillasSeleccionadas = req.body.sillasIDS;
        
      // Realiza la conexión a la base de datos
      const client = await pool.connect();
      for (const sillaID of sillasSeleccionadas) {
        const result = await client.query(`
        UPDATE Bus
        SET estado = 'ocupado',
            nombre = $1
        WHERE silla = $2`,
        [email2, sillaID]
      );
        console.log(`Silla ${sillaID} actualizada`);
    }
  
      // Cierra la conexión a la base de datos
      await client.release();
  
      // Devuelve una respuesta exitosa al cliente
      res.status(200).json({ ok: 'ok', message: 'Estado de las sillas actualizado correctamente' });
    } catch (error) {
      // Maneja los errores
      console.error('Error al actualizar el estado del autobús:', error);
      res.status(500).json({ error: 'Error al actualizar el estado del autobús' });
    }
  });
  function generarContrasenha(longitud) {
    const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let contrasenha = '';
    
    for (let i = 0; i < longitud; i++) {
        const randomIndex = Math.floor(Math.random() * caracteres.length);
        contrasenha += caracteres[randomIndex];
    }
    
    return contrasenha;
}
  app.post('/olvidar', async (req, res) => {
    const { email } = req.body;

    try {
        // Verificar si el correo existe en la base de datos
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        const contrasenha = generarContrasenha(6);
        const nuevaContrasenha=await bcrypt.hash(contrasenha, 10);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'El correo electrónico no está registrado.' });
        }
        // Aquí iría el código para generar y enviar la nueva contraseña al correo electrónico
        // Generar una nueva contraseña (puedes utilizar alguna librería como "crypto-random-string")
        const password=result.rows[0].passw
        // Enviar la nueva contraseña por correo electrónico
        await sendEmail(email, contrasenha);
        await client.query('UPDATE users SET passw = $1 WHERE email = $2', [nuevaContrasenha, email]);
        // Responder al cliente
        return res.sendFile(__dirname + '/public/html/login.html');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al procesar la solicitud.' });
    }
});
async function sendEmail(email, password) {
    // Configurar nodemailer para enviar el correo electrónico
    let transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '221a74d6023f01',
            pass: '92716fe93e78ec'
        }// Puerto SMTP
    });

    // Configurar el mensaje
    let mailOptions = {
        from: 'flotacolombia@flota.com',
        to: email,
        subject: 'Nueva contraseña',
        text: `Tu nueva contraseña es: ${password}`
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
}
////////////////////////////////////////////////////////////////////
app.post('/register', async (req, res) => {
    const { email, nombre, apellido, passw } = req.body;
    const hashedPassword = await bcrypt.hash(passw, 10);
    
    const client = await pool.connect();

    // Verificar si el correo electrónico ya está registrado
    const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
    const emailCheckResult = await client.query(checkEmailQuery, [email]);
    if (passw.length < 6) {
        return res.sendFile(__dirname + '/public/html/register.html');
    }
    if (emailCheckResult.rows.length > 0) {
        // Si el correo electrónico ya está en uso, enviar un mensaje de error
        res.send('El correo ya esta en uso. <script>alert("El correo ya esta en uso"); window.location.href = "/";</script>');
    } else {
        // Si el correo electrónico no está en uso, registrar al usuario
        const insertUserQuery = 'INSERT INTO users (email, nombre, apellido, passw) VALUES ($1, $2, $3, $4)';
        await client.query(insertUserQuery, [email, nombre, apellido, hashedPassword], (err, result) => {
            if (err) {
                res.send('Fallo al registrar. <script>alert("Fallo en el registro vuelva a intentar"); window.location.href = "/";</script>');
            } else {
                res.send('Usuario registrado exitosamente. <script>alert("Registro exitoso"); window.location.href = "/";</script>');
            }
        });
    }
});
app.get('/svg', async (req, res) => {
    const client = await pool.connect();
    return res.sendFile(__dirname + '/SillasSvg/Sillas.html')
})

app.post('/login', async (req, res) => {
    const { email, passw } = req.body;
    email2=email;
    const client = await pool.connect();
    const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
        return res.sendFile(__dirname + '/public/html/login.html');
    }
    const isPasswordValid = await bcrypt.compare(passw, user.rows[0].passw);
    if (!isPasswordValid) {
        return res.sendFile(__dirname + '/public/html/login.html');
    }
    res.cookie('email', email);
    return res.sendFile(__dirname + '/public/html/index2.html');
});
app.get('/perfil', async (req, res) => {
    const email = req.cookies.email;
    const client=await pool.connect();
    const user = await client.query('SELECT email,nombre,apellido,passw FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
        // El usuario fue encontrado, enviar los datos al cliente
        const usuario = {
            nombre: user.rows[0].nombre,
            apellido: user.rows[0].apellido,
            email: user.rows[0].email,
            passw: user.rows[0].passw
        };
        res.json({usuario})
    } else {
        // El usuario no fue encontrado
        res.status(404).json({ message: 'Usuario no encontrado' });
    }

})
app.post('/cambioemail', async (req, res) => {
    const {email}=req.body;
    const email2 = req.cookies.email;
    const client= await pool.connect();
    const result= await client.query('UPDATE users SET email=$1 WHERE email=$2',[email,email2])
    res.send('Cambio Exitoso. <script>alert("Su correo a sido cambiado ingrese de nuevo"); window.location.href = "/";</script>');
})
app.post('/cambiopass', async (req, res) => {
    const {passw}=req.body;
    const email2 = req.cookies.email;
    const hashedPassword = await bcrypt.hash(passw, 10);
    const client= await pool.connect();
    if (passw.length < 6) {
        return res.sendFile(__dirname + '/public/html/index.html');
    }
    const result= await client.query('UPDATE users SET passw=$1 WHERE email=$2',[hashedPassword,email2]);
    res.send('Cambio Exitoso. <script>alert("Su contraseña a sido cambiado ingrese de nuevo"); window.location.href = "/";</script>');
})
app.post('/eliminar', async (req, res) => {
    const email2 = req.cookies.email;
    const client= await pool.connect();
    try{
    const result = await client.query('DELETE FROM users WHERE email=$1',[email2]);
    res.send('Su cuenta a sido eliminada. <script>alert("Usted a eliminado su cuenta"); window.location.href = "/";</script>')
}
catch(err){
    console.error('Error al eliminar usuario:', err);
        res.status(500).send("Error al eliminar usuario");
}

})

////////////////////////////////////////////////////////////////////////
app.post('/respuesta', (req, res) => {

    let ciudad_a = req.body.ciudadA;
    let ciudad_b = req.body.ciudadB;
    let caminosTiem = null;
    let caminosDist = null;
    let conexiones = null;
    if (grafo.vertices[ciudad_a] && grafo.vertices[ciudad_b]) {
        const conectadas = grafo.vertices[ciudad_a].some(([vecino]) => vecino === ciudad_b);
        if (conectadas) {
            conexiones = `Las ciudades ${ciudad_a} y ${ciudad_b} están conectadas por una carretera.`;
        } else {
            conexiones = `No hay conexión directa entre ${ciudad_a} y ${ciudad_b}.`;
        }
    }

    // Determinar el camino más corto en términos de distancia
    const [distancia, caminoDistancia] = grafo.dijkstra(ciudad_a, ciudad_b, "distancia");
    caminosTiem = `Camino más corto en distancia: ${caminoDistancia}, Distancia total: ${distancia} km`;

    // Determinar el camino más corto en términos de tiempo
    const [tiempo, caminoTiempo] = grafo.dijkstra(ciudad_a, ciudad_b, "tiempo");
    caminosDist = `Camino más corto en tiempo: ${caminoTiempo}, Tiempo total: ${tiempo} minutos`;
    respuesta={
        distanciaT: distancia,
        tiempoT: tiempo,
        caminodis:caminoDistancia,
        caminotie:caminoTiempo
       }
    res.status(200).json({respuesta });
});


app.post('/resdos', (req, res) => {
    console.log(req.query);
    const ciudad_a = req.body.ciudadA;
    const ciudad_b = req.body.ciudadB;

    console.log(ciudad_a + ' ' + ciudad_b);
    res.status(200).json({'info': 'algo'});
});


server.listen(3000, () => {
    console.log('Server is runing 3000')
});

