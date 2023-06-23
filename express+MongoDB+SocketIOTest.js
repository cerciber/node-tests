// Importaciones
const express = require('express');     // Framework express
const mongoose = require('mongoose');   // Administrador de Mongo DB
const socketio = require('socket.io');  // Aministrador de la conexión por sockets
const cors = require('cors');           // Configurador de Cors

// Información necesaria
const PORT = 3002; // Puerto para el servidor Express
const mongoUrl = 'mongodb+srv://cerciber:123123123@cercibercluster.xvwytlz.mongodb.net/'; // Url de mongo
const dbName = 'MongoTestDB'; // Nombre de la base de datos
const collection = 'MongoTestCollection'; // nombre de la colección

// Instanciar express
const app = express();

// Middleware para interpretar JSON en las solicitudes
app.use(express.json());

// Middleware para configurar cors de Express
app.use(cors());

// Crear servicio http desde la instancia de express
const server = require('http').createServer(app);

// Crear conexión por Sockets desde la instancia desde el servicio http creado desde express (Configurando cors para el socket)
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  },
});

// Detectar si se estaleció una conexión por sockets
io.on('connect', (socket) => {
  console.log('Conexión de Socket.io establecida');
});

// Conectar a MongoDB
mongoose.connect(mongoUrl + dbName, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conexión exitosa a MongoDB');
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
  });

// Definir un esquema para la colección de Mongo DB
const todoSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
});

// Crear el objeto que administra una colección basada en el esquema establecido
const Todo = mongoose.model(collection, todoSchema);

//////////////////////  Rutas para el CRUD

// Insertar un nuevo registro
app.post('/api/todos', (req, res) => {

  // Obtener datos del registro
  const { title, completed } = req.body;

  // Crear registro en el esquema
  const newTodo = new Todo({
    title,
    completed,
  });

  // Guardar registro
  newTodo.save()
    .then(() => {

      // Emitir evento a todos los clientes del registro creado
      io.emit('todoCreated', newTodo);

      // Enviar respuesta
      res.status(201).json(newTodo);
    })
    .catch((error) => {
      // Enviar error
      res.status(500).json({ error: 'Error al crear el todo' });
    });
});

// Obtener registros
app.get('/api/todos', (req, res) => {
  // Buscar ern la colección todos los registros
  Todo.find()
    .then((todos) => {
      // Enviar respuesta
      res.status(200).json(todos);
    })
    .catch((error) => {
      // Enviar error
      res.status(500).json({ error: 'Error al obtener los registros' });
    });
});

// Actualizar un registro
app.put('/api/todos/:id', (req, res) => {

  // Obtener id a actualizar
  const { id } = req.params;

  // Obtener los datos nuevos
  const { title, completed } = req.body;

  // Buscar registro por el id y actualizarlo
  Todo.findByIdAndUpdate(id, { title, completed }, { new: true })
    .then((updatedTodo) => {

      // Emitir evento a todos los clientes del registro actualizado
      io.emit('todoUpdated', updatedTodo);

      // Enviar respuesta
      res.json(updatedTodo);
    })
    .catch((error) => {
      // Enviar error
      res.status(500).json({ error: 'Error al actualizar el todo' });
    });
});

// Borrar un registro
app.delete('/api/todos/:id', (req, res) => {

  // Obtener id a borrar
  const { id } = req.params;

  // Buscar registro por el id y borrarlo
  Todo.findByIdAndRemove(id)
    .then((removedTodo) => {

      // Emitir evento a todos los clientes del registro borrado
      io.emit('todoDeleted', removedTodo._id);

      // Enviar respuesta
      res.json(removedTodo);
    })
    .catch((error) => {
      // Enviar error
      res.status(500).json({ error: 'Error al eliminar el todo' });
    });
});

// Iniciar el servidor de express
server.listen(PORT, () => {
  console.log(`Servidor Express y Socket.io iniciado en el puerto ${PORT}`);
});