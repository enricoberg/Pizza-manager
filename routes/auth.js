const express = require('express')
const router = express.Router()
const app=express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
require('dotenv').config()
const connection = require('../configuration.js');
const bcrypt = require('bcrypt');
const { render } = require('ejs');
router.use(cookieParser());
app.use(bodyParser.json());
const querystring = require("querystring");
const localStorage =require('localStorage');
const { isLogged, isNotLogged, hasAccess } = require('./loginfunctions');
router.get('/signup',isNotLogged, (req,res)=>{
    res.render('signup'); 
});

router.get('/login',isNotLogged,(req,res)=>{
     res.render('login');
  });

// HANDLE THE SIGNUP REQUEST--------------------------------------
 router.post('/signup', async(req, res) => {
    const role = req.body.comborole;
    const nickname = req.body.nickname;    
    const  username = req.body.username;
    const password= req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    // const sql = `INSERT INTO users (username, password) VALUES ('${username}', '${password}');`;
    const sql = 'INSERT INTO users (username, password,nickname,role) VALUES (?, ?, ?, ?)';
    const params = [username, hashedPassword,nickname, role];
    const result = await connection.query(sql, params,(error,results)=>{
        if (error) { res.render('error', { message: 'Invalid credentials' }); }
        else {res.render('message', { message: 'Successfully signed up' });}
    });

    } ); 

router.post('/login', async(req,res)=>{
    try{
    const  username = req.body.userid;
    const password= req.body.passwd;
    const sql = 'SELECT  password FROM users WHERE username = ?';
    const params = [username];
    let savedpw,check;
    connection.query(sql,params,async (err,results)=>{savedpw= await results[0].password; 
                    await bcrypt.compare(password,savedpw).then(function(result){   
                                                                                    if(result){
                                                                                      const sessione = req.session.id
                                                                                      connection.query('INSERT INTO sessions (session_id,user,expiry) VALUES (?,?,?)',[sessione,username,Date.now()+300000]);
                                                                                      req.session.user=sessione;
                                                                                      res.render('homepage')
                                                                                      
                                                                                      
                                                                                      
                                                                                  }
                                                                                    else{res.render('error', { message: 'User/password are not matching' })}
                    });
                    
                    });
   


    
  
    
    }catch(error){
                    console.log(error);
                    res.render('error', { message: 'Cannot login' });
                }



});


try{router.get('/logout',isLogged, async(req,res)=>{
    
   if  (req.session.user!=undefined){
  const sessioneAttiva = req.session.user;
  await connection.query('DELETE FROM sessions WHERE session_id=?',[sessioneAttiva]);
  req.session.destroy((error) => {
    if (error) throw error;
    res.render('message', { message: 'You Logged out successfully' });
  });
}
});
}catch(error){console.log(error); res.render('error', { message: 'Oops something went wrong' });}



router.get('/',isLogged, (req,res)=>{
  
  const userSession = req.session.user;
  let ruolo=undefined;
  connection.query('SELECT ROLE FROM users WHERE username IN ( SELECT USER FROM sessions WHERE session_id = ? );',[userSession],(err,result)=>{
    if (result.length>0) ruolo=result[0].ROLE;
        let accessGranted = false;
        switch(ruolo){
          case "admin":
            res.redirect('/orders');
            break;
          case "waiter":
            res.redirect('/neworder');
            break;
          case "cashier":
            res.redirect('/orders');
            break;
          case "cook":
            res.redirect('/pizzepending');
            break;
        }
      
     
  });





});

//controllo in real time che l'username non sia già utilizzato quando mi registro
router.get('/check-username/:username', (req, res) => {
  const username = req.params.username;

  // Query the database to check if the username is already in use
  connection.query(`SELECT * FROM users WHERE username = '${username}'`, (err, result) => {
    if (err) {
      // An error occurred while querying the database
      res.send({
        success: false,
        message: 'An error occurred while checking the username.'
      });
    } else {
      if (result.length > 0) {
        // The username is already in use
        res.send({
          success: false,
          message: 'This username is already in use.'
        });
      } else {
        // The username is available
        res.send({
          success: true,
          message: 'This username is available.'
        });
      }
    }
  });
});
//RIadatto l'interfaccia in base al ruolo dell'utente corrente
router.get('/updatelayout', (req, res) => {
  

 
  connection.query('SELECT ROLE FROM users WHERE username IN ( SELECT USER FROM sessions WHERE session_id = ? );',[req.session.user], (err, result) => {
    if (err) {
      // An error occurred while querying the database
      res.send({
        success: false,
        message: 'An error occurred while querying the database.'
      });
    } else {
      if (result.length > 0) {
        // The username is already in use
        res.send({
          success: true,
          message: result[0].ROLE
        });
      } else {
        // The username is available
        res.send({
          success: false,
          message: 'Account not found.'
        });
      }
    }
  });
});

//controllo in real time che il nickname non sia già utilizzato quando mi registro
router.get('/check-nickname/:nickname', (req, res) => {
  const nickname = req.params.nickname;

  // Query the database to check if the username is already in use
  connection.query(`SELECT * FROM users WHERE nickname = '${nickname}'`, (err, result) => {
    if (err) {
      // An error occurred while querying the database
      res.send({
        success: false,
        message: 'An error occurred while checking the username.'
      });
    } else {
      if (result.length > 0) {
        // The username is already in use
        res.send({
          success: false,
          message: 'This nickname is already in use.'
        });
      } else {
        // The username is available
        res.send({
          success: true,
          message: 'This username is available.'
        });
      }
    }
  });
});



router.get('/neworder',isLogged,(req, res, next)=>{hasAccess(req,res,['admin','waiter'],next);}, (req,res)=>{
  res.render('new_order');
});

router.post('/mod_order', (req,res)=>{
  let nrordine;
  nrordine =  req.body.selettoreordine;
  


  let ordini = [];
  //creo un array ordini in cui metto la lista delle cose ordinate e poi la invio alla pagina mod_order
  connection.query(`SELECT lista FROM orders WHERE order_id=${nrordine};`,(err,result)=>{
    ordini=JSON.parse(result[0].lista)
    
  
  
    res.render('mod_order', {ordini: ordini, numeroOrdine : nrordine});
  });
  

});

//carico il menu nel menu a tendina 
router.get('/load-menu/:category', (req, res) => {
  const categoria = req.params.category;

  // Query the database to check the database for dishes of the selected category
  connection.query(`SELECT dish FROM menu WHERE category = '${categoria}'`, (err, result) => {
    if (err) {
      // An error occurred while querying the database
      res.send({
        success: false,
        message: 'An error occurred while querying the database.'
      });
    } else {
      if (result.length > 0) {
        // GET THE RESULTS IN THE MESSAGE OUTPUT
        res.send({
          success: true,
          message: result
        });
      } 
    }
  });
});
// Query the database to check for available tables
router.get('/load-tables', (req, res) => {
    connection.query(`SELECT table_id FROM tavoli
    WHERE table_id NOT IN
    (SELECT tablenr
    FROM orders
    JOIN tavoli
    ON orders.tablenr = tavoli.table_id
    WHERE orders.status = 'OPEN') ;`, (err, result) => {
    if (err) {
      // An error occurred while querying the database
      res.send({
        success: false,
        message: 'An error occurred while querying the database.'
      });
    } else {
      if (result.length > 0) {
        // GET THE RESULTS IN THE MESSAGE OUTPUT
        res.send({
          success: true,
          message: result
        });
      } 
    }
  });
});
//handle a new order request
router.get("/send-order",isLogged,(req, res, next)=>{hasAccess(req,res,['admin','waiter'],next);},async (req, res) => {
  const query = querystring.parse(req.url.split("?")[1]);
  const ordini = JSON.parse(query.ordini);
  let pizzes = ordini;
  
  
  for (let k=0; k< pizzes.length-1; k++){
    for (let p=0; p< pizzes[k].quantity; p++){
      
        connection.query(`INSERT INTO pendingpizzas (NAME,odate)
        SELECT dish, NOW()
        FROM menu
        WHERE category = 'PIZZA' AND dish = '${pizzes[k].name}';`, (err,result)=>{
          if (err) console.log(err)
        })
    }
  }
  //faccio il totale dell'ordine
  var totaleOrdine = 0;
  for (i = 0; i < ordini.length-1; i++) {
    const result = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT price FROM menu WHERE dish='${ordini[i].name}'`,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    const quantity = ordini[i].quantity
    totaleOrdine = totaleOrdine + quantity*result[0].price;
  }
  
  const tablenumber=ordini[ordini.length-1];
  
  let currentTime =  new Date();
  const mese= Number(currentTime.getMonth())+1;
  currentTime = `'` + currentTime.getFullYear() + '-' + mese + '-' + currentTime.getDate() + ' ' + currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds() +`'`
  const listajson  = JSON.stringify(ordini)
  
  connection.query(`INSERT INTO orders (tablenr, odate, total, status, lista)  VALUES ('${tablenumber}', ${currentTime}, ${totaleOrdine}, 'OPEN', '${listajson}');`,(err,result)=>{
    if(err) res.render('error', { message: 'IMPOSSIBILE EFFETTUARE ORDINE' });
    res.render("message", { message: `ORDINE EFFETTUATO (TOT EUR ${totaleOrdine} )` });
  });
  
});
//handle an update order request
router.get("/update-order",isLogged,(req, res, next)=>{hasAccess(req,res,['admin','waiter','cashier'],next);}, async (req, res) => {
  const query = querystring.parse(req.url.split("?")[1]);
  const ordini = JSON.parse(query.ordini);
  //faccio il totale dell'ordine
  var totaleOrdine = 0;
  for (i = 0; i < ordini.length-2; i++) {
    const result = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT price FROM menu WHERE dish='${ordini[i].name}'`,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    const quantity = ordini[i].quantity
    totaleOrdine = totaleOrdine + quantity*result[0].price;
  }
  
  const tablenumber=ordini[ordini.length-2];
  const numeroOrdine = ordini[ordini.length-1];
  ordini.pop();
  let currentTime =  new Date();
  const mese= Number(currentTime.getMonth())+1;
  currentTime = `'` + currentTime.getFullYear() + '-' + mese + '-' + currentTime.getDate() + ' ' + currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds() +`'`
  const listajson  = JSON.stringify(ordini)
  
  connection.query(`UPDATE orders  SET tablenr='${tablenumber}', odate=${currentTime}, total=${totaleOrdine}, status='OPEN', lista='${listajson}'  WHERE order_id='${numeroOrdine}' ;`,(err,result)=>{
    if(err) res.render('error', { message: 'IMPOSSIBILE EFFETTUARE ORDINE' });
    res.render("message", { message: `ORDINE AGGIORNATO (TOT EUR ${totaleOrdine} )` });
  });
  
});

router.get('/orders',isLogged,(req, res, next)=>{hasAccess(req,res,['admin','waiter','cashier'],next);}, (req,res)=>{

connection.query('SELECT order_id,tablenr,odate,total,status,lista FROM orders ORDER BY STATUS DESC, odate DESC;', (err,result)=>{
  if(err || result.length<1) res.render('error', { message: 'Error loading orders' });
  for(let i=0;i<result.length;i++){
    const stringa = String(result[i].odate);
    result[i].odate = stringa.substring(0,24);
  }
  res.render('orders',{ risultato: result});
});



});

router.post('/orders',async(req,res)=>{
 const nrordine = req.body.nrordine;
 //IMPEDISCO A CAMERIERI DI CHIUDERE GLI ORDINI
 const userSession = req.session.user;
 let ruolo=undefined;
  await connection.query('SELECT ROLE FROM users WHERE username IN ( SELECT USER FROM sessions WHERE session_id = ? );',[userSession],(err,result)=>{
   if (result.length>0) ruolo=result[0].ROLE;
   if (ruolo!='admin' && ruolo !='cashier') return;
   connection.query(`UPDATE orders SET status = 'CLOSED'
   WHERE order_id = ?;`,[nrordine], (err,result)=>{
       res.send('DONE')
   });
    });
   


  
 
});

router.get('/pizzepending',isLogged,(req, res, next)=>{hasAccess(req,res,['cook','admin'],next);}, (req,res) => {
  connection.query('SELECT id,name,odate FROM pendingpizzas ORDER BY odate DESC;', (err,result)=>{
    if(err) res.render('error', { message: 'Error loading orders' });
    for(let i=0;i<result.length;i++){
      const stringa = String(result[i].odate);
      result[i].odate = stringa.substring(0,24);
    }
    res.render('pizzepending',{ risultato: result});
  });
});

router.post('/remove-pizza', (req,res)=>{
  const nrordine = req.body.selettoreordine;
  connection.query(`DELETE FROM pendingpizzas WHERE id = ?;`,[nrordine], (err,result)=>{
    res.redirect('/pizzepending');
  });
});


module.exports = router