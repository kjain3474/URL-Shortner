var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var url = require('url');
const dotenv = require('dotenv').config()
const path = require('path');
var mysql = require('mysql');
const shortid = require('shortid');
var events = require('events');

const PORT = process.env.PORT || 5000;
var connection = null;
var eventEmitter = new events.EventEmitter();

//connect to MySQL DB
connectDB();

//set App Options
setAppOptions();

//get all urls
app.get('/api/geturls', (req, res) => {
    connection.query('SELECT full, short FROM url_shortner', function (error, results, fields) {
        if (error){   
            res.json({error: "Unable to Fetch Data"});
        }
        else{
            res.json({success: results});
        }
    });
});

//Get Full Link Output
app.get('/:shortUrl', (req, res) => {

    connection.query('SELECT full FROM url_shortner WHERE short = ?', [req.params.shortUrl],  function (error, results, fields) {
        if (error){   
            console.log("Unable to find");
        }
        else{
            res.redirect(results[0].full);
        }
    });
    
  
    
  })


//get short url count
app.get('/api/checkUrlShortCount', (req, res) => {

    var queryObject = url.parse(req.url,true).query;

    var urlParse = queryObject.url;

    connection.query('SELECT COUNT(full) as count FROM url_shortner WHERE full = ?', [urlParse], function (error, results, fields) {
        if (error){   
            res.json({ count: 0 });
        }
        else{
            res.json(results[0]);
        }
    });
    
 });

//convert short to long url and route
app.post('/api/shortUrls', (req, res) => {

    var data = req.body;
    
    var short = generateShortUrl();

    var isUrlValid = CheckIfUrlValid(data.full);

    if(isUrlValid === false) 
    {
        res.json({error: "Invalid URL"})
    }
    else{
        data["short"] = short;
        
        connection.query('INSERT INTO url_shortner SET ?', data, function (error, results, fields) {
            if (error){   
                res.json({error: "Url Already Present!" });
            }
            else{
                res.json({success: data});
            }
        });
    }
 });
 

function generateShortUrl(){
     return shortid.generate();
}

function CheckIfUrlValid(url){
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(url);
}

function connectDB(){
     connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE
      });
       
      connection.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          return;
        }
       
        console.log('connected as id ' + connection.threadId);
      });
}

function setAppOptions(){
    app.use(cors({ allowedHeaders: 'Content-Type, Cache-Control' }));
    app.options('*', cors());
    app.use(bodyParser.json())
    app.use(express.urlencoded({ extended: false }))
}


//start app
app.listen(PORT, () => console.log(`Server Running on Port - ${PORT}`))