require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");

describe("Rest API Departamentos", () => {
  it("GET /api/v1/departamentos", async () => {
    const response = await request(app).get("/api/v1/departamentos");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const deptos = response.body;
    expect(deptos.length).toBeGreaterThan(0);
  });




  //PUNTO 4
  it("PUT /api/v1/departamentos/jefe/actual con un departamento que no existe", async () => { //i. comprobar existencia departamento destino
    const dept = { emp_no: 10001, dept_no: "xxxxx"};
    const response = await request(app).put("/api/v1/departamentos/jefe/actual").send(dept);
    expect(response.statusCode).toBe(404);    //iv. código de estado
    expect(response.text).toBe("Departamento inexistente!!!");
  });

  it("PUT /api/v1/departamentos/jefe/actual con un empleado inexistente", async () => { //ii. comprobar existencia empleado
    const dept = { emp_no: 0, dept_no: "d005"};
    const response = await request(app).put("/api/v1/departamentos/jefe/actual").send(dept);
    expect(response.statusCode).toBe(404);  //iv. código de estado
    expect(response.text).toBe("Empleado no encontrado!!!");
  });


  it("PUT /api/v1/departamentos/jefe/actual", async () => {      
    const nuevoManager = { emp_no: 11079, dept_no: "d001"};
    const response = await request(app).put("/api/v1/departamentos/jefe/actual").send(nuevoManager);
    expect(response.statusCode).toBe(201);         //iv. código de estado  
  
    const consultaManager = await request(app).get("/api/v1/departamentos/d001/manager/todos");
    expect(consultaManager.statusCode).toBe(200);        //iv. código de estado
    const listaManager = consultaManager.body;

    const hoy = new Date(Date.now());
    const diaHoy = hoy.toISOString().split("T")[0];
    const fechaActual = hoy.toISOString().split("T")[0] + 'T03:00:00.000Z'; 

    expect(listaManager[1].to_date).toEqual(fechaActual);     //vi. campo del registro anterior con to_date igual a fecha hoy    
    expect(listaManager[0].from_date).toEqual(fechaActual);;     //vii. campo del nuevo registro con from_date igual a fecha de hoy
    expect(listaManager[0].to_date).toContain('9999-01-01');     //vii. campo del nuevo registro con to_date igual a  fecha especial 
 
    //v. campo agregado corresponde al dpto y empleado - verficación 1 x 1 
    expect(listaManager[0].emp_no).toEqual(11079);     
    expect(listaManager[0].dept_no).toEqual("d001");       
    expect(listaManager[0].to_date).toEqual('9999-01-01T03:00:00.000Z');     
    expect(listaManager[0].from_date).toContain(diaHoy);    
  });

  it("PUT /api/v1/departamentos/jefe/actual con jefe departamento nuevo igual al actual", async () => { //iii. comprobar jefe dpto nuevo es diferente       
    const dept = { emp_no: 11079, dept_no: "d001"};
    const response = await request(app).put("/api/v1/departamentos/jefe/actual").send(dept);
    expect(response.statusCode).toBe(400);  //iv. código de estado
    expect(response.text).toBe("El empleado elegido ya es el jefe del departamento!!!");
  }); 
});
