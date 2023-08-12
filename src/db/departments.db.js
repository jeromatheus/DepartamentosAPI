const pool = require("./connection.db");
const TABLE='departments'
const TABLE2='dept_manager'

/**
 * Retorna todos los departamentos
 * @returns 
 */
module.exports.getAll = async function () {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d `);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.getAllDptosEmpleado = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM dept_emp where emp_no=? ORDER BY to_date DESC`,[id]);    
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna un departamento por su clave primaria
 * @returns 
 */
module.exports.getById = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d WHERE dept_no=?`,[id]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna el manager actual de un Departamento y la fecha desde
 * @param {Object} departamento 
 * @returns 
 */
 module.exports.getActualManager = async function (departamento) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
SELECT 
  e.*,
  dm.from_date AS fecha_desde
FROM dept_manager dm
	INNER JOIN employees e ON (e.emp_no = dm.emp_no)
WHERE dm.dept_no = ? AND dm.to_date='9999-01-01'
`;
    const rows = await conn.query(SQL,[departamento.dept_no]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};


/**
 * Retorna todos los manager de un Departamento
 */
 module.exports.getAllManager = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`SELECT * FROM dept_manager WHERE dept_no=? ORDER BY to_date DESC`;
    const rows = await conn.query(SQL,[id]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Agrega un departamento
 * @param {Object} departamento 
 * @returns 
 */
module.exports.add = async function (departamento) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`INSERT INTO ${TABLE} (dept_no, dept_name) VALUES(?, ?)`
    const params=[]
    params[0]=departamento.dept_no
    params[1]=departamento.dept_name
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * eliminar un Departamento
 * @param {Object} departamento 
 * @returns 
 */
module.exports.delete = async function (departamento) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`DELETE FROM ${TABLE} WHERE dept_no=?`,[departamento.dept_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Modifica un Departamento
 * @param {Object} departamento 
 * @returns 
 */
module.exports.update = async function (departamento) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`UPDATE ${TABLE}  SET dept_name=? WHERE dept_no=?`
    const params=[]
    params[0]=departamento.dept_name
    params[1]=departamento.dept_no    
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};


//PUNTO 2
module.exports.DeptoActual = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM dept_emp WHERE emp_no=?`,[id]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};


//PUNTO 4
module.exports.ActualizarFechaEspecial = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    UPDATE ${TABLE2} 
    SET to_date=SYSDATE()
    WHERE dept_no=?
    AND to_date='9999-01-01'
    `      
    const rows = await conn.query(SQL,[id]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.RegistrarNuevoJefeDepto = async function (manager) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    INSERT INTO ${TABLE2} 
    (emp_no,dept_no,from_date,to_date) 
    VALUES (?,?,SYSDATE(),'9999-01-01')
    `
    const params=[]
    params[0]=manager.emp_no
    params[1]=manager.dept_no
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.PrimaryKeyActualizadaHoy = async function (id){
  let conn;
  try{
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE2} WHERE emp_no=? AND from_date=current_date()`,[id]);
    return rows[0];
  }catch (err){
    return Promise.reject(err);
  }finally{
    if (conn) await conn.release();
  }
}