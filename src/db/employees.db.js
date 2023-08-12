const pool = require("./connection.db");
const TABLE = 'salaries'
const TABLE2 = 'dept_emp'
const TABLE3 = 'employees'


//PUNTO 1
module.exports.GetEmpleado = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE3} WHERE emp_no=?`,[id]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.ObtenerSalarios = async function (id) {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query(`SELECT * FROM ${TABLE} WHERE emp_no=? ORDER BY to_date DESC`,[id]);
      return rows;
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) await conn.release();
    }
  };

module.exports.PrimaryKeyActualizadaHoy = async function (id,tabla){
  let conn;
  try{
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${tabla} WHERE emp_no=? AND from_date=current_date()`,[id]);
    return rows[0];
  }catch (err){
    return Promise.reject(err);
  }finally{
    if (conn) await conn.release();
  }
}


//PUNTO 2 
  module.exports.RegistrarSalarioNuevoEmp = async function (salario) {
    let conn;
    try {
    /*await conn.beginTransaction();
      try{
        await conn.batch(`UPDATE salaries SET to_date=sysdate() WHERE emp_no=? AND to_date='9999-01-01'`,params);
        await conn.batch(`INSERT INTO salaries (emp_no,salary,from_date,to_date) VALUES (?,?,sysdate(),'9999-01-01'`,params);
        const rows = await conn.commit();
        return rows;
      }catch(err){
        conn.rollback();        
      } 
    */  
      conn = await pool.getConnection();
      const SQL=`
      INSERT INTO ${TABLE} 
      (emp_no,salary,from_date,to_date)
      VALUES (?,?,sysdate(),'9999-01-01')
       `
      const params=[]
      params[0]=salario.emp_no
      params[1]=salario.salary
      const rows = await conn.query(SQL,params);
      return rows;
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) await conn.release();
    }
  };  


//PUNTO 3
module.exports.RegistarDepartamentoNuevo = async function (departamento) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    INSERT INTO ${TABLE2} 
    (emp_no,dept_no,from_date,to_date)
    VALUES (?,?,sysdate(),'9999-01-01')
     `
    const params=[]
    params[0]=departamento.emp_no
    params[1]=departamento.dept_no
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
}; 



//MÉTODO ACTUALIZAR ÚLTIMA FECHA ESPECIAL
module.exports.ActualizarFechaEspecial = async function(dato,tabla) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    update ${tabla} 
    set to_date = sysdate() 
    where emp_no = ?  
    and to_date = '9999-01-01';
    `
    const params=[]
    params[0]=dato.emp_no
  
    const rows = await conn.query(SQL,params[0]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};