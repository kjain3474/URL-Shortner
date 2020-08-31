var mysql = require('mysql');

var connection = null;

//connect to MySQL DB
connectDB();

function connectDB(){
    connection = mysql.createConnection({
       host     : process.env.DB_HOST,
       user     : process.env.DB_USER,
       password : process.env.DB_PASSWORD,
       database : process.env.NODE_ENV === "test" ? process.env.DB_DATABASE_TEST : process.env.DB_DATABASE
     });
      
     connection.connect(function(err) {
       if (err) {
         return;
       }
     });


}

module.exports = connection;