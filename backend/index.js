require('dotenv').config();

const connection = require("./db");
const server = require('./server');

const PORT = process.env.PORT || 5000;

//start app
server.listen(PORT, () => console.log(`Server Running on Port - ${PORT}`))