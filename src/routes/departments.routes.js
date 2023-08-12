const express = require('express');
const router = express.Router();
const DB = require('../db');

/**
 * Middleware para verificar que existe el departamento con parámetro id
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 * @returns 
 */
async function checkDepto(req,res,next){
    if(req.body.dept_no==null && req.params.id==null){
        res.status(400).send('dept_no del departamento es Requerido!!!')
        return
    }   

    let depto;
    if(req.params.id){
        depto = await DB.Departmens.getById(req.params.id);
    }
    if(req.body.dept_no){
        depto = await DB.Departmens.getById(req.body.dept_no);
    }

    if(!depto){        
        return res.status(404).send('Departamento inexistente!!!')
    }
  //  res.locals.depto=depto;
    next();
}
async function checkEmpleado(req,res,next){
    if(req.body.emp_no==null && req.params.id==null){
        res.status(400).send('emp_no del empleado es Requerido!!!')
        return
    }   
    let empl;
    if(req.params.id){
        empl = await DB.Employees.GetEmpleado(req.params.id);
    }
    if(req.body.emp_no){
        empl = await DB.Employees.GetEmpleado(req.body.emp_no);
    }
    if(!empl){        
        return res.status(404).send('Empleado no encontrado!!!')
    }

    const depto = {dept_no : req.body.dept_no}
    jefeActual = await DB.Departmens.getActualManager(depto);
    if(jefeActual.emp_no == req.body.emp_no){
        return res.status(400).send("El empleado elegido ya es el jefe del departamento!!!");
    }
    res.locals.empl=empl;
    next();
}
async function checkPrimaryKey(req,res,next){        
    const consulta = await DB.Departmens.PrimaryKeyActualizadaHoy(req.body.emp_no);    
    if(consulta){        
        return res.status(404).send(`Sólo puede modificar el jefe de un departamento 1 vez por dia!!!`);
    }  
    next();
}


// GET /api/v1/departamentos
router.get('/',async (req,res)=>{
    const deptos = await DB.Departmens.getAll();    
    res.status(200).json(deptos)
});

// GET /api/v1/departamentos/:id
router.get('/:id',checkDepto,(req,res)=>{
    res.status(200).json(res.locals.depto);    
});

// GET /api/v1/departamentos/:id/manager
router.get('/:id/manager',checkDepto,async (req,res)=>{    
    const manager = await DB.Departmens.getActualManager(res.locals.depto);
    res.status(200).json(manager)
});

//GET /api/v1/departamentos/:id/manager/todos
router.get('/:id/manager/todos',checkDepto,async (req,res)=>{    
    const listaManager = await DB.Departmens.getAllManager(req.params.id);
    res.status(200).json(listaManager)
});

// POST /api/v1/departamentos
router.post('/',async (req,res)=>{
    const {dept_no,dept_name} =req.body
    if(!dept_no){
        res.status(400).send('dept_no es Requerido!!!')
        return
    }
    if(!dept_name){
        res.status(400).send('dept_name es Requerido!!!')
        return
    }
    const depto = await DB.Departmens.getById(dept_no);
    if(depto){
        res.status(500).send('ya existe el Departamento!!!')
        return
    }
    const deptoNuevo = {dept_no,dept_name}
    const isAddOk = await DB.Departmens.add(deptoNuevo)
    if(isAddOk){
        res.status(201).json(deptoNuevo)
    }else{
        res.status(500).send('Falló al agregar el departamento!!!')
    }
});

// PUT /api/v1/departamentos/:id
router.put('/:id',checkDepto,async (req,res)=>{
    const {dept_name} =req.body    
    if(!dept_name){
        res.status(400).send('dept_name es Requerido!!!')
        return
    }
    const {depto} = res.locals;
    depto.dept_name=dept_name
    const isUpdateOk = await DB.Departmens.update(depto)
    if(isUpdateOk){
        res.status(200).json(depto)
    }else{
        res.status(500).send('Falló al modificar el departamento!!!')
    }
});

// DELETE /api/v1/departamentos/:id
router.delete('/:id',checkDepto,async (req,res)=>{
    const {depto} = res.locals;
    const isDeleteOk = await DB.Departmens.delete(depto)
    if(isDeleteOk){
        res.status(204).send()
    }else{
        res.status(500).send('Falló al eliminar el departamento!!!')
    }
});


//PUNTO 4 - PUT /api/v1/departamentos/jefe/actual
router.put('/jefe/actual',checkDepto,checkEmpleado,checkPrimaryKey,async (req,res)=>{       
    const isUpdateOk = await DB.Departmens.ActualizarFechaEspecial(req.body.dept_no)
    const isAddOk = await DB.Departmens.RegistrarNuevoJefeDepto(req.body)
    if(isUpdateOk && isAddOk){
        res.status(201).json(req.body)
    }else{
        res.status(500).send('Falló al cambiar el jefe del departamento!!!')
    }
});

module.exports=router