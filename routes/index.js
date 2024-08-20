const express = require ('express')
const router = express.Router()
const homeController = require('../controllers/homeController')
const vacantesController = require('../controllers/vacantesController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos)
    //Crear vacantes 
    router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante)
    router.post('/vacantes/nueva', authController.verificarUsuario, vacantesController.agregarVacante)

    //mostrar vacante 
    router.get('/vacantes/:url', vacantesController.mostrarVacante)

    //editar vacante
    router.get('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante)
    router.post('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.editarVacante)

    //crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta)
    router.post('/crear-cuenta',usuariosController.validarRegistro ,usuariosController.crearUsuario)

    //cerrar sesion
    router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion)

    //autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion)
    router.post('/iniciar-sesion', authController.autenticarUsuario)

    //Panel de administracion
    router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel)
    
    //editar perfil
    router.get('/editar-perfil',authController.verificarUsuario, usuariosController.formEditarPerfil)
    router.post('/editar-perfil', authController.verificarUsuario, /*usuariosController.validarPerfil,*/usuariosController.subirImagen, usuariosController.editarPerfil)

    //eliminar vacante
    router.delete('/vacante/eliminar/:id', vacantesController.eliminarVacante)

    //Recibir mensajes de cantidatos
    router.post('/vacantes/:url', vacantesController.subirCv, vacantesController.contactar)
    
    //Mostrar candidatos
    router.get('/candidatos/:id', authController.verificarUsuario, vacantesController.mostrarCandidatos)
    
    //reset password (emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword)
    router.post('/reestablecer-password', authController.enviarToken)
    
    //reset passwords DB
    router.get('/reestablecer-password/:token', authController.reestablecerPassword)
    router.post('/reestablecer-password/:token', authController.guardarPassword)

    //Buscador de vacantes
    router.post('/buscador', vacantesController.buscarVacantes)

    return router
}