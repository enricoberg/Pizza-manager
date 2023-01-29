function isLogged(req,res,next){
    const connection = require('../configuration.js');
    connection.query('SELECT session_id,expiry FROM sessions WHERE session_id=? ', [req.session.user], (err,results)=>{
      
        if (results.length>0 && results[0].expiry>=Date.now()){ isLogged= true;}
        else{ isLogged = false; }
        
        next();
    });
}

module.exports = isLogged;