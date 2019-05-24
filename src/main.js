//setup env vars
require('dotenv').config();

//unique gen
const shortid = require('shortid');

//start up local db
const FileSync = require('lowdb/adapters/FileAsync');
const adapter = new FileSync('db.json');
const db = require('lowdb')(adapter);

/**DB Syntax
 * Branch
 * {
 * branch_name
 * branch_id //unique, generated shortid.generate()
 * }
 * 
 * Host
 * {
 * host_name //unique from branch_id
 * host_port 
 * branch_id //related branch_id
 * }
 */

//Start up server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

//create server
let server = express();

server.use(require('cors')());

server.use(bodyParser.json());

server.use(
    bodyParser.urlencoded({
        extended: true,
        type: 'application/*',
    })
);

server.get('/', (req, res) => {
    res.send('hello world!');
});

server.listen((process.env.PORT) ? process.env.PORT : 3000, process.env.HOST ? process.env.HOST : 'localhost', function () {
    console.log(`${server.name} listening at http://${process.env.HOST ? process.env.HOST : 'localhost'}:${(process.env.PORT) ? process.env.PORT : 3000}`);
});

//start up stored branches
