'use strict'
module.exports = executeQuery;
// const mysql=require('mysql');
// const connection = mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     password:'',
//     database:'authentication'
// });
function executeQuery(sql,callback){
    // connection.connect();
    console.log('database connected')
    connection.query(sql,callback);
    // connection.end();
    console.log('database disconnected')
}