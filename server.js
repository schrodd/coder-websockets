const express = require('express')
const app = express()
const { Server: HTTPServer } = require('http')
const httpServer = new HTTPServer(app)
const { Server: IOServer } = require('socket.io')
const io = new IOServer(httpServer)
const handlebars = require('express-handlebars')
const path = require('path')
const Products = require('./products')
const products = new Products()
const Messages = require('./msgs')
const msgs = new Messages()
const folderViews = path.join(__dirname, 'views') // Permite que la ruta sea estable si se ejecuta en otra pc
const port = 8080 // a
const { normalize, schema } = require('normalizr')
const authorSchema = new schema.Entity('authors')
const messageSchema = new schema.Entity('messages',{
    author: authorSchema
})
const chatSchema = new schema.Entity('chat', {
    messages: [messageSchema]
})

app.use(express.json()) // Permite interpretar JSON como objetos
app.use(express.urlencoded({extended: true})) // Permite interpretar URLs como objetos
app.use(express.static('./public')) // Sirve archivos estaticos
app.engine('handlebars', handlebars.engine()) // 1. Define motor de plantillas
app.set('views', folderViews) // 2. Ubica carpeta de templates
app.set('view engine', 'handlebars') // 3. Define el motor a usar

httpServer.listen(port, () => console.log('Listening on port ' + port))
app.get('/', async (req, res) => {
    res.render('home', { products: await products.getAll() })
})
app.get('/chat', async (req, res) => {
    res.render('chat', { msg: await msgs.getMessagesOnly() })
})
app.get('/productos-test', async (req, res) => {
    res.render('home', { products: await products.getRandom(5) })
})
app.get('/api/productos-test', async (req, res) => {
    res.send(await products.getRandom(5))
})

//Websocket
io.on('connection', socket => {
    msgs.getAll()
    console.log('Usuario conectado')
    socket.emit('conectionSuccess', 'Se ha conectado con éxito')
    socket.on('productLoaded', async prod => {
        await products.addProduct(prod) 
        await products.getAll()
        .then(updatedProducts => {
            io.sockets.emit("productRefresh", updatedProducts)
        })
    })
    socket.on('msgSent', async msg => {
        await msgs.addMsg(msg) 
        const newMsgs = await msgs.getAll()
        const normalized = await normalize(newMsgs, chatSchema)
        io.sockets.emit("chatRefresh", normalized)
    })
    
})