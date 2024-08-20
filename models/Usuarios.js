const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const bcrypt = require('bcrypt')

const ususariosSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre:{
        type: String,
        required: 'Agrega tu nombre'
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
})

// metodo para hashear los paswords
ususariosSchema.pre('save', async function (next) {
    // si el password ya esta hashaedo
    if(!this.isModified('password')){
        return next()
    }
    // si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12)
    this.password = hash
    next()
})
//mostrar mensaje si ya esta registrado
ususariosSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoServerError' && error.code === 11000){  /// este es un error de mongo y es un metodo propio de mongo
        next('ese Correo ya esta registrado')
    }else{
        next(error)
    }           
})

//autenticar ususarios
ususariosSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync(password, this.password)
    }
}
module.exports = mongoose.model('Usuarios', ususariosSchema) 