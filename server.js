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
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// Schemas de normalizr
const authorSchema = new schema.Entity('authors')
const messageSchema = new schema.Entity('messages',{
    author: authorSchema
})
const chatSchema = new schema.Entity('chat', {
    messages: [messageSchema]
})

app.use(express.json()) // Permite interpretar JSON como objetos
app.use(cookieParser()) // Permite manejar Cookies
app.use(express.urlencoded({extended: true})) // Permite interpretar URLs como objetos
app.use(express.static('./public')) // Sirve archivos estaticos
app.use(session({ 
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://andres:coder@sessionmongoatlas.egjegti.mongodb.net/sessionMongoAtlas?retryWrites=true&w=majority',
        mongoOptions: advancedOptions
    }),
    secret: 'clave',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Permite reiniciar maxAge con cada petición
    cookie: {
        maxAge: 600000 // 10 min.
    }
}))
app.engine('handlebars', handlebars.engine()) // 1. Define motor de plantillas
app.set('views', folderViews) // 2. Ubica carpeta de templates
app.set('view engine', 'handlebars') // 3. Define el motor a usar

const verifyLogin = (req, res, next) => {
    if (req.session.usuario) {
        next()
    } else {
        res.redirect('/login')
    }
}

httpServer.listen(port, () => console.log('Listening on port ' + port))

app.get('/', verifyLogin, async (req, res) => {
    res.render('home', { products: await products.getAll(), user: req.session.usuario })
})
app.get('/login', (req, res) => {
    if (req.session.usuario) res.render('alreadylogged', {user: req.session.usuario})
    else res.render('login')
})
app.get('/loginform', (req, res) => {
    try {
        if (!req.session.usuario) {
            req.session.usuario = req.query.usuario
        }
    } catch (error) {
        console.log(e)
    }
    if (req.session.usuario) {
        res.redirect('/')
    } 
    else res.redirect('/login')
})
app.get('/logout', verifyLogin, (req, res) => {
    const user = req.session.usuario
    req.session.destroy(e => console.log(e))
    res.render('bye', {loggedOutUser: user})
})
app.get('/chat', verifyLogin, async (req, res) => {
    res.render('chat', { msg: await msgs.getMessagesOnly(), user: req.session.usuario })
})
app.get('/productos-test', verifyLogin, async (req, res) => {
    res.render('home', { products: await products.getRandom(5), user: req.session.usuario })
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