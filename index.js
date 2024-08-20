const moongose = require('mongoose')
require('./config/db.js')
const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const router = require('./routes')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const mongoStore = require('connect-mongo')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const passport = require('./config/passport')
const createError = require('http-errors');

const app = express()

require('dotenv').config({path : 'variables.env'})

//habilitar body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


// habilitar  handlebars como view 

app.engine('handlebars',
    exphbs.engine({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars.js')
    })
)
app.set('view engine', 'handlebars')

//static files 
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
const store = mongoStore.create({
    mongoUrl: process.env.DATABASE,
    // Más opciones si es necesario
 });
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))

//inicializar passport
app.use(passport.initialize())
app.use(passport.session())

//alertas y flash
app.use(flash())

//crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash()
    next()
})


app.use('/', router())
// 404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'No Encontrado'));
})

// Administración de los errores
app.use( (error, req, res, next) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    console.log(status)
    res.status(status);
    res.render('error');
});

app.listen(process.env.PUERTO)