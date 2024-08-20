const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const multer = require('multer')
const shortid = require('shortid')
const { body, validationResult } = require("express-validator"); 

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva vacante',
        tagLine: 'Llenar formulario y publica tu vanacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.agregarVacante = async (req, res) => {
   const vacante = new Vacante(req.body)

   //usuario autor de la vacante
   vacante.autor = req.user._id

   //crear arrglo de habilidades
   vacante.skills= req.body.skills.split(',')
   
   //alamcenar en la BD
   const nuevaVacante = await vacante.save()

   // redireecionar
   res.redirect(`/vacantes/${nuevaVacante.url}`)
}

//muestra una vacante 
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor').lean()
    if(!vacante) return next()
    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

//editar avcante 
exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).lean()
    if(!vacante) return next()
    
    res.render('editar-vacante',{
        vacante,
        nombrePagina: `editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body
    vacanteActualizada.skills = req.body.skills.split(',')
    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    })
    res.redirect(`/vacantes/${vacante.url}`)
}

// validar y sanitizar campos de nuevas vacantes 
exports.validarVacante = async (req, res, next) => {
    console.log(req.body)
    const rules = [
        body("titulo").not().isEmpty().withMessage("Agrega el titulo a la vacante").escape(),
        body("empresa").not().isEmpty().withMessage("Agrega la empresa por favor").escape(),
        body("ubicacion").not().isEmpty().withMessage("Agrega la ubicacion").escape(),
        body("contrato").not().isEmpty().withMessage("selesccione tipo de contrato").escape(),
        body("skills").not().isEmpty().withMessage("selesccione almenos una habilidad").escape(),
      ]
      await Promise.all(rules.map((validation) => validation.run(req)));
      const errors = validationResult(req);
  
 
  if (errors) {
    // Recargar pagina con errores
    req.flash(
      "error",
      errors.array().map((error) => error.msg)
    );
    res.render("nueva-vacante", {
        nombrePagina: 'Nueva vacante',
        tagLine: 'llena el formulario',
        cerrarSesion: true,
        nombre: req.user.nombre,
        mensajes: req.flash()
    });
    return;
  }
  next();
}

// eliminar vacante
exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;
 
    try {
        const vacante = await Vacante.findById(id);
 
        if (!vacante) {
            return res.status(404).send('Vacante no encontrada');
        }
 
        if (verificarAutor(vacante, req.user)) {
            // Si este es el usuario, se puede eliminar
            await vacante.deleteOne();
            return res.status(200).send('Vacante eliminada correctamente');
        } else {
            // No permitido
            return res.status(403).send('No tienes permiso para eliminar esta vacante');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor');
    }
};
 
const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    }
    return true;
};

//subir archivos en PDF
exports.subirCv = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: max 100kb')
                }else{
                    req.flash('error', error.MulterError)
                }
            }else{
                req.flash('error', error.message)
            }
            res.redirect('back')
            return
        }else{
            return next()
        }
      
    })
    
}

const configuracionMulter = {
    limits: { fileSize : 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'application/pdf'){
            // el call back (CB) se ejecuta como true o false 
            cb(null, true)
        }else{
            cb(new Error('Formato no valido'), false)
        }
    },
}

const upload = multer(configuracionMulter).single('cv')

//Almacenar candidatos en la BD
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url})

    // si no existe la vacante
    if(!vacante) return next()
    
    // construir el nuevo objeto
    const nuevoCandidato =  {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }
    //Almaenar vacante
    vacante.canditados.push(nuevoCandidato)
    await vacante.save()

    // Mensaje flash y redireccion
    req.flash('correcto', 'Se Envio el CV')
    res.redirect('/')
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id).lean()
    if(vacante.autor != req.user._id.toString()) return next()
    if(!vacante) return next()
    
    res.render('candidatos', {
        nombrePagina: `Candidatos vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.canditados
    })
}

//buscador de vacantes 
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text:{
            $search: req.body.q
        }
    }).lean()
    res.render('home', {
        nombrePagina: `Resultados para la busqueda : ${req.body.q}`,
        barra: true,
        vacantes
    })
}