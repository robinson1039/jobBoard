const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
    }, async (email, password, done)=>{
        const usuario = await Usuarios.findOne({email: email})
        if(!usuario) return done(null, false, {
            message: 'El usuario no existe'
        })

        const verificarPass = usuario.compararPassword(password)
        if(!verificarPass) return done(null, false, {
            message: 'Password incorrecto'
        })

        //el ususario existe y conbtrae;a conrrecta 
        return done(null, usuario)
    }))

    passport.serializeUser((usuario, done) => done(null, usuario._id))
    passport.deserializeUser(async (id, done)=>{
        const usuario = await Usuarios.findById(id).exec()
        return done(null, usuario)
    })

    module.exports = passport