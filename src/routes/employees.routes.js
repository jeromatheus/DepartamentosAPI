const express = require('express');
const router = express.Router();
const DB = require('../db');




//MIDDLEWARE
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
    res.locals.empl=empl;
    next();
}
async function checkDepto(req,res,next){
    if(req.body.dept_no==null){
        return res.status(400).send('dept_no es Requerido!!!')
    }
    const depto = await DB.Departmens.getById(req.body.dept_no);
    if(!depto){        
        return res.status(404).send('Departamento inexistente!!!')
    }
    const deptoActual = await DB.Departmens.DeptoActual(req.body.emp_no);
    if(req.body.dept_no == deptoActual.dept_no){
        return res.status(400).send("El departamento de destino es el mismo!!!");
    }

    res.locals.depto=depto;
    next();
}
async function checkPrimaryKey(req,res,next){
    let consulta;
    let tipo;
    if(req.body.salary){
        consulta = await DB.Employees.PrimaryKeyActualizadaHoy(req.body.emp_no,'salaries');  
        tipo = "salario";        
    }
    if(req.body.dept_no){
        consulta = await DB.Employees.PrimaryKeyActualizadaHoy(req.body.emp_no,'dept_emp'); 
        tipo = "departamento";
    }    
    if(consulta){        
        return res.status(404).send(`Sólo puede modificar el ${tipo} de un mismo empleado 1 vez por dia!!!`);
    }  
    //res.locals.depto=consulta
    next();
}



//api/v1/empleados/:id/departamentos
router.get('/:id/departamentos',checkEmpleado,async (req,res)=>{ 
    if(!req.params.id){
        res.status(400).send('dept_id es Requerido!!!')
        return
    }
    const deptos = await DB.Departmens.getAllDptosEmpleado(req.params.id);
    res.status(200).json(deptos);
});



//PUNTO 1 - GET /api/v1/empleados/:id/salarios
router.get('/:id/salarios',checkEmpleado, async (req,res)=>{
    if(!req.params.id){
        res.status(400).send('emp_no del empleado es Requerido!!!')
        return
    }
    const empl = await DB.Employees.ObtenerSalarios(req.params.id);
    res.status(200).json(empl);    
});



//PUNTO 2 - PUT /api/v1/empleados/salarios/actual
router.put('/salarios/actual',checkEmpleado,checkPrimaryKey,async (req,res)=>{ 
    const {emp_no,salary} = req.body    
    if(!salary){
        res.status(400).send('salary del empleado es Requerido!!!')
        return
    }
    const salario = res.locals;
    salario.emp_no=emp_no
    salario.salary=salary
    
    const isUpdateOk = await DB.Employees.ActualizarFechaEspecial(salario,'salaries')   
    if(isUpdateOk){ 
        const isAddOk = await DB.Employees.RegistrarSalarioNuevoEmp(salario)
        if(isAddOk){
            res.status(200).json(salario)
        } 
    }else{
        res.status(500).send('Falló al modificar el salario!!!')
    }
});


                         
//PUNTO 3 - PUT /api/v1/empleados/departamentos/actual
router.put('/departamentos/actual',checkEmpleado,checkDepto,checkPrimaryKey,async (req,res)=>{ 
    const {emp_no,dept_no} = req.body    
    const depto = res.locals;
    depto.emp_no=emp_no
    depto.dept_no=dept_no
    
    const isUpdateOk = await DB.Employees.ActualizarFechaEspecial(depto,'dept_emp')   
    if(isUpdateOk){ 
        const isAddOk = await DB.Employees.RegistarDepartamentoNuevo(depto)
        if(isAddOk){
            res.status(200).json(depto)
        }
    }else{
        res.status(500).send('Falló al modificar el departamento del empleado!!!')
    }
});


module.exports=router