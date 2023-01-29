function isLogged(req,res,next){
    const connection = require('../configuration.js');
    connection.query('SELECT session_id,expiry FROM sessions WHERE session_id=? ', [req.session.user], (err,results)=>{
  
    if (results.length>0 && results[0].expiry>=Date.now()){ next();}
    else{ connection.query('DELETE FROM sessions WHERE session_id=?',[req.session.user]);
            req.session.destroy((error) => {if (error) throw error; });
              res.render('error', { message: 'You are not logged in' }); }
          
});
}
function isNotLogged(req,res,next){
  const connection = require('../configuration.js');
connection.query('SELECT session_id,expiry FROM sessions WHERE session_id=? ', [req.session.user], (err,results)=>{

if (results.length>0 && results[0].expiry>=Date.now()){ res.render('error', { message: 'You are already logged in' });}
else{ next();}
    
});
}
// FUNZIONE PER VERIFICARE I PERMESSI DI ACCESSO ALLA PAGINA-------------------------
function hasAccess(req,res,users,next) {
  const connection = require('../configuration.js');
  const userSession = req.session.user;
  let ruolo=undefined;
  connection.query('SELECT ROLE FROM users WHERE username IN ( SELECT USER FROM sessions WHERE session_id = ? );',[userSession],(err,result)=>{
    if (result.length>0) ruolo=result[0].ROLE;
    
    let accessGranted = false;
    for ( let i=0; i< users.length; i++){
        if (ruolo == users[i]) accessGranted=true;
    }
    if (!accessGranted) res.render('error', { message: 'You do not have permissions to visit this page' });
     next();
  });

}

module.exports = { isLogged, isNotLogged, hasAccess}