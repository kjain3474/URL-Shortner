var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var url = require('url');
const dotenv = require('dotenv').config()
const shortid = require('shortid');
const connection = require("./db")

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
            res.json({error: "Unable to Find"});
        }
        else{
            try{
                res.redirect(results[0].full);
            }
            catch(e){
                return;
            }
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

function setAppOptions(){
    app.use(cors({ allowedHeaders: 'Content-Type, Cache-Control' }));
    app.options('*', cors());
    app.use(bodyParser.json())
    app.use(express.urlencoded({ extended: false }))
}

module.exports = app;