module.exports = {
    seleccionarSkills: (seleccionadas = [], opciones) => {
        //console.log(seleccionadas)
        const skills = ['HTML5', 'CSS', 'JavaScript', 'C#', 'Java', 'phyton', 'ORM', 'PHP', 'Laravel', 'SQL', 'MVC']
        let html = ''
        skills.forEach(skill => {
            html += `<li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>`
        })
        return opciones.fn().html = html
    },
    tipoContrato: (seleccionado, opciones) => {
        return opciones.fn(this).replace(new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores)

        let html = ''
        if(categoria.length){
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`
            })
        }
        return alertas.fn().html = html
    } 
}