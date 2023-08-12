require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");



describe("Rest API Empleados", () => {

    //PUNTO 1
    it("GET /api/v1/empleados/10010/salarios", async () => {
        const response = await request(app).get("/api/v1/empleados/10010/salarios");
        expect(response.statusCode).toBe(200);    //ii. código de estado      
        const emple = response.body;
        expect(emple.length).toBeGreaterThan(0);  //iii. elemento de la api tiene más de 1 elemento
        emple.forEach(element => {              //iv. cada uno de los elementos pertenece al empleado        
          expect(element.emp_no).toBe(10010);
        });        
    });
    it("GET /api/v1/empleados/0000/salarios", async () => {
        const response = await request(app).get("/api/v1/empleados/0000/salarios");
        expect(response.statusCode).toBe(404); 
        expect(response.text).toBe("Empleado no encontrado!!!");
    });
    it("GET /api/v1/empleado sin id empleado", async () => {      
        const response = await request(app).post("/api/v1//salarios").send();
        expect(response.statusCode).toBe(404);
    });


    
    
    //PUNTO 2
    it("PUT /api/v1/empleados/salarios/actual", async () => {
      const consultaAntes = await request(app).get("/api/v1/empleados/10540/salarios");
      expect(consultaAntes.statusCode).toBe(200);        //ii. código de estado
      const salariosAntes = consultaAntes.body; 

      const salario = { emp_no: 10540, salary: 99999};
      const response = await request(app).put("/api/v1/empleados/salarios/actual").send(salario);
      expect(response.statusCode).toBe(200);        //ii. código de estado

      const consultaDesp = await request(app).get("/api/v1/empleados/10540/salarios");
      expect(consultaDesp.statusCode).toBe(200);        //ii. código de estado
      const salariosDesp = consultaDesp.body;  

      const hoy = new Date(Date.now());
      const fechaActual = hoy.toISOString().split("T")[0] + 'T03:00:00.000Z'
      expect(salariosDesp.length).toBeGreaterThan(salariosAntes.length); //iii. después de ejecutar la api existe nuevo registro para empleado 
      expect(salariosDesp[1].to_date).toEqual(fechaActual);     //iv. campo del registro anterior con to_date igual a fecha hoy    
      expect(salariosDesp[0].from_date).toEqual(fechaActual);;     //v. campo del nuevo registro con from_date igual a fecha de hoy
      expect(salariosDesp[0].to_date).toEqual('9999-01-01T03:00:00.000Z');;     //v. campo del nuevo registro con to_date igual a fecha especial
    });       

    it("PUT /api/v1/empleados/salarios/actual sin salary", async () => {
      const empleado = { emp_no: 10010 };
      const response = await request(app).put("/api/v1/empleados/salarios/actual").send(empleado);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("salary del empleado es Requerido!!!");
    });

    it("PUT /api/v1/empleados/salarios/actual sin emp_no", async () => {
      const salario = { salary: 999999 };
      const response = await request(app).put("/api/v1/empleados/salarios/actual").send(salario);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("emp_no del empleado es Requerido!!!");
    });

    it("PUT /api/v1/empleados/salarios/actual con emp_no no existente", async () => {
      const salario = { salary: 999999, emp_no:0 };
      const response = await request(app).put("/api/v1/empleados/salarios/actual").send(salario);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe("Empleado no encontrado!!!");
    });



    //PUNTO 3    
    it("PUT /api/v1/empleados/departamentos/actual con empleado inexistente", async () => { //i. comprobar existencia empleado
      const dept = { emp_no: 0, dept_no: "d005"};
      const response = await request(app).put("/api/v1/empleados/departamentos/actual").send(dept);
      expect(response.statusCode).toBe(404);  //iv. código de estado
      expect(response.text).toBe("Empleado no encontrado!!!");
    });

    it("PUT /api/v1/empleados/departamentos/actual para departamento que no existe", async () => { //ii. comprobar existencia departamento destino
      const dept = { emp_no: 10001, dept_no: "xxxxx"};
      const response = await request(app).put("/api/v1/empleados/departamentos/actual").send(dept);
      expect(response.statusCode).toBe(404);    //iv. código de estado
      expect(response.text).toBe("Departamento inexistente!!!");
    });

    it("PUT /api/v1/empleados/departamentos/actual con departamento destino igual al actual", async () => { //iii. comprobar dpto destino diferente       
      const dept = { emp_no: 10059, dept_no: "d002"};
      const response = await request(app).put("/api/v1/empleados/departamentos/actual").send(dept);
      expect(response.statusCode).toBe(400);  //iv. código de estado
      expect(response.text).toBe("El departamento de destino es el mismo!!!");
    });

    it("PUT /api/v1/empleados/departamentos/actual", async () => {      
      const deptoNuevo = { emp_no: 10518, dept_no: "d003"};
      const response = await request(app).put("/api/v1/empleados/departamentos/actual").send(deptoNuevo);
      expect(response.statusCode).toBe(200);        //iv. código de estado         

      const hoy = new Date(Date.now());
      const diaHoy = hoy.toISOString().split("T")[0];
      const fechaActual = hoy.toISOString().split("T")[0] + 'T03:00:00.000Z' 

      const consultaDptoEmp = await request(app).get("/api/v1/empleados/10518/departamentos");
      expect(consultaDptoEmp.statusCode).toBe(200); 
      const listaDptoEmp = consultaDptoEmp.body; 

      expect(listaDptoEmp[1].to_date).toEqual(fechaActual);     //vi. campo del registro anterior con to_date igual a fecha hoy    
      expect(listaDptoEmp[0].from_date).toEqual(fechaActual);;     //vii. campo del nuevo registro con from_date igual a fecha de hoy
      expect(listaDptoEmp[0].to_date).toEqual('9999-01-01T03:00:00.000Z');;     //vii. campo del nuevo registro con to_date igual a fecha especial

      //v. campo agregado corresponde al dpto y empleado - verficación 1 x 1 
      expect(listaDptoEmp[0].emp_no).toEqual(10518);     
      expect(listaDptoEmp[0].dept_no).toEqual("d003");       
      expect(listaDptoEmp[0].to_date).toEqual('9999-01-01T03:00:00.000Z');     
      expect(listaDptoEmp[0].from_date).toContain(diaHoy);    
    }); 
})