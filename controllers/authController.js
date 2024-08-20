const passport = require("passport");
const mongoose = require('mongoose');
const { crearUsuario } = require("./usuariosController");
const Vacante = mongoose.model('Vacante')
const Usuarios = mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local', {
     successRedirect: '/administracion',
     failureRedirect: '/iniciar-sesion',
     failureFlash: true,
     badRequestMessage: 'ambos campos son obligatorios'
})

//revisar si el usuario esta autenticado 
exports.verificarUsuario = (req, res, next) => {
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/iniciar-sesion')
}

exports.mostrarPanel = async (req, res) => {
    //consultra el usuario autenticado
    const vacantes = await Vacante.find({autor: req.user._id}).lean()
    res.render('administracion',{
        nombrePagina: 'Panel de administracion',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        tagLine: 'Crea y adminstra tus vacantes',
        vacantes
    })
}

exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        return res.redirect('/iniciar-sesion')
    });
 
    
}

//form para riniciar password

exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu password',
        tagLine: 'Si ya tienes una cuenta pero olvidaste tu password',

    })
}

//Generar token en tabla de usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({email: req.body.email})

    if(!usuario){
        req.flash('error', 'No existe esa cuenta')
        return res.redirect('/iniciar-sesion')
    }
    //El usuario existe generar token
    usuario.token = crypto.randomBytes(20).toString('hex')
    usuario.expira = Date.now() +  3600000

    await usuario.save()
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

    //console.log(resetUrl)

    await enviarEmail.enviar({
        usuario,
        subject: 'Password reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Revisa tu email')
    res.redirect('/iniciar-sesion')
}

//valida si el token es valido 
exports.reestablecerPassword = async(req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })

    if(!usuario){
        req.flash('error', 'El formulario ya expiro')
        return res.redirect('/reestablecer-password')
    }

    res.render('nuevo-password',{
        nombrePagina: 'Nuevo password'
    })
}

//Almacenar nuevo password en la BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })
    if(!usuario){
        req.flash('error', 'El formulario ya expiro')
        return res.redirect('/reestablecer-password')
    }

    //Guardar en la BD 
    usuario.password = req.body.password
    usuario.token = undefined
    usuario.expira = undefined

    await usuario.save()

    req.flash('correcto', 'Passwordmodificado correctamente')
    res.redirect('/iniciar-sesion')

}