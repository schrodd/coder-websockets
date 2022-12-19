const express = require('express')
const app = express()
require('dotenv').config()
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
const yargs = require('yargs/yargs')(process.argv.slice(2))
const args = yargs.argv
const port = args.port // a
const { normalize, schema } = require('normalizr')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
const mongoUrl = process.env.MONGOURL || 'mongodb+srv://andres:coder@sessionmongoatlas.egjegti.mongodb.net/sessionMongoAtlas?retryWrites=true&w=majority'
const {UserModel: User} = require('./users')
const {Strategy: LocalStrategy} = require('passport-local')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passport = require('passport')

// Setup info obj for get /info
const info = {
    args: JSON.stringify(args),
    so: process.platform,
    nodever: process.version,
    rss: process.memoryUsage().rss,
    path: process.execPath,
    pid: process.pid,
    projectfolder: process.cwd()
}

// Init mongoose
mongoose.set('strictQuery', true)
mongoose.connect(mongoUrl, advancedOptions, e => {
    e && console.log('Hubo un error conectandose a la BDD')
})

// Config LocalStrategy (login)
passport.use('login', new LocalStrategy(
    //{passReqToCallback: true},
    (username, password, done) => {
        // Logica para encontrar usuario dentro de la bdd
        User.findOne({ username }, async (err, user) => {
            if (err)
            return done(err);
            if (!user) {
            console.log('User Not Found with username ' + username);
            return done(null, false, {message: 'No se ha encontrado el usuario'});
            }
            console.log(password)
            console.log(user.password)
            console.log(await bcrypt.compare(password, user.password))
            if (! await bcrypt.compare(password, user.password)) {
            console.log('Invalid Password');
            return done(null, false, {message: 'Contraseña incorrecta'});
            }
            return done(null, user);
        })           
    }
))

// Config LocalStrategy (register)
passport.use('signup', new LocalStrategy( // Configura la strategy 'local'
    // {passReqToCallback: true}, // Permite acceder a la request desde el callback
    ( /* req, */ username, password, done) => { 
        // Logica para encontrar usuario dentro de la bdd
        User.findOne({ username }, async (err, user) => { 
            if (err) return done(err) 
            if (user) return done(null, false) // Si existe lo retorna
            if (!user) { // Si no existe lo crea
                await bcrypt.hash(password, saltRounds, function(err, hash) {
                    err && console.log(err)
                    const newUser = {username, password: hash}
                    User.create(newUser, (e, userCreated) => {
                        err && console.log(err)
                        return done(null, userCreated) // Devuelve el usuario recien creado
                    })
                });                
                
            }
        })           
    }
))

passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, done);
})

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
        mongoUrl: mongoUrl,
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
// Init passport
app.use(passport.initialize()) // conectamos passport con express
app.use(passport.session()) // conectamos passport y las sesiones
app.engine('handlebars', handlebars.engine()) // 1. Define motor de plantillas
app.set('views', folderViews) // 2. Ubica carpeta de templates
app.set('view engine', 'handlebars') // 3. Define el motor a usar

const verifyLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/welcome')
    }
}

httpServer.listen(port, () => console.log('Listening on port ' + port))
app.get('/info', (req, res) => {
    res.render('info', info)
})
app.get('/welcome', async (req, res) => {
    res.render('welcome')
})
app.get('/', verifyLogin, async (req, res) => {
    res.render('home', { products: await products.getAll(), user: req.user.username })
})
app.get('/login', (req, res) => {
    if (req.user) res.render('alreadylogged', {user: req.user.username})
    else res.render('login')
})
app.get('/login-failed', (req, res) => {
    res.render('loginfailed', {message: req.session.messages.at(-1)})
})
app.post('/login',passport.authenticate('login', {
    failureRedirect: '/login-failed',
    failureMessage: true
}),(req, res) => {
    res.redirect('/')
})
app.get('/logout', verifyLogin, (req, res) => {
    const user = req.user.username
    req.session.destroy(e => console.log(e))
    res.render('bye', {loggedOutUser: user})
})
app.get('/chat', verifyLogin, async (req, res) => {
    res.render('chat', { msg: await msgs.getMessagesOnly(), user: req.user.username })
})
app.get('/productos-test', verifyLogin, async (req, res) => {
    res.render('home', { products: await products.getRandom(5), user: req.user.username })
})
app.get('/api/productos-test', async (req, res) => {
    res.send(await products.getRandom(5))
})
app.get('/register', (req, res) => {
    if (req.user) res.render('alreadylogged', {user: req.user.username})
    else res.render('register')
})
app.get('/register-failed', (req, res) => {
    res.render('registerfailed')
})
app.post('/register', passport.authenticate('signup', {
    failureRedirect: '/register-failed',
    failureMessage: true
}), (req, res) => {
    res.redirect('/')
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