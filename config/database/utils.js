const pool = require('./db');


const queryDb = async (query, params) => {
    try {
        const [rows, fields] = await pool.query(query, params);
        
        return rows;
    } catch (err) {
        console.log(err);
        return err;
    }
};


module.exports = {
    queryDb
}