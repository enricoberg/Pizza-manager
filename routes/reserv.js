const express = require('express')
const router = express.Router()
const app=express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
require('dotenv').config()
const connection = require('../configuration.js');

const { render } = require('ejs');
router.use(cookieParser());
app.use(bodyParser.json());
const querystring = require("querystring");
const { isLogged, isNotLogged, hasAccess } = require('./loginfunctions');


router.get("/", (req,res)=>{
  res.render('reservation')
});
router.get("/new", (req,res)=>{
  const tablenr = req.query.tablenr
  let hourslot = req.query.hourslot
  const seatnr = req.query.seatnr
  const res_date = req.query.res_date
   connection.query(`SELECT starttime, endtime FROM reservations WHERE  table_id=${tablenr}  AND res_date= '${res_date}';`,(err,result)=>{
    hourslot = parseInt(hourslot.substring(1));
    let newOrder=true;
    
    for(let j=0; j<result.length;j++){
      if(hourslot>=  parseInt(result[j].starttime.substring(1)) && hourslot<= parseInt(result[j].endtime.substring(1))) newOrder=false;
      
    }
    if(newOrder) { 
      let orainizio= 'n' + hourslot;
      let endhour= hourslot +6;
      let orafine = 'n' + endhour;
      res.render('newreservation', {nrtavolo: tablenr, orafine: orafine, orainizio: orainizio})
      
  }
    else { res.send('MODIFY RESERVATION')}
  });




 
});
router.post("/new", (req,res)=>{
    const tavolo = req.body.tableselect;
    const contact = req.body.reservationcontact;
    let starttime = req.body.starttime;
    let endtime = req.body.endtime;
    const seat = req.body.selectseats;
    starttime = parseInt(starttime.substring(1));
    endtime = parseInt(endtime.substring(1));
    connection.query(` SELECT COUNT(*) AS R1
                        FROM reservations
                        WHERE table_id = ${tavolo} AND
                        ${starttime}<= CONVERT(SUBSTRING(endtime,2),SIGNED) AND
                        ${endtime}>= CONVERT(SUBSTRING(starttime,2),SIGNED);`, (err,result)=>{
                            if(result[0].R1>0){
                                //SE CI SONO GIA' DELLE PRENOTAZIONI IN QUELLO SLOT

                            }
                            else{
                                 // NON CI SONO PRENOTAZIONI IN QUELLO SLOT
                            }

        res.redirect('/reservations');
    });
    


});
router.get('/get-all-res',(req,res)=>{
  const dataordini = req.query.dataordini
  
  connection.query(`SELECT table_id,seats, starttime, endtime FROM reservations WHERE res_date = '${dataordini}' ORDER BY table_id`,(err,result)=>{


    if (err) {
      // An error occurred while querying the database
      res.send({
        success: false,
        message: 'An error occurred while querying the database.'
      });
    } else {
      
      //if (result.length > 0) {
        // GET THE RESULTS IN THE MESSAGE OUTPUT
       
        let tavoliprenotati = [];
        let slotprenotati = [];
        let seatsprenotati =[];
        for (let i=0; i<result.length;i++){
          let inizio = parseInt(result[i].starttime.substring(1));
          let fine = parseInt(result[i].endtime.substring(1));
            for(let j=inizio; j<= fine; j++){
                slotprenotati.push(`n${j}`);
                tavoliprenotati.push(result[i].table_id);
                seatsprenotati.push(result[i].seats);
            }
        }
        res.send({
          success: true,
          tavoliprenotati : tavoliprenotati,
          slotprenotati : slotprenotati,
          seatsprenotati : seatsprenotati
        });
      //} 
      
    }







   
  });


});

router.get('/load-all-tables', (req, res) => {
  connection.query(`SELECT table_id,seats FROM tavoli;`, (err, result) => {
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
module.exports = router