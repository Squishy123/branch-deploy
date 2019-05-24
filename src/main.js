//setup env vars
require('dotenv').config();

//unique gen
const shortid = require('shortid');

//start up local db
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
db.read();

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

let router = express.Router();

router.get('/', (req, res) => {
    res.send('Branch Deploy Working!');
});

/**
 * Opens a new branch and starts serving it
 * branch_name
 */
router.post('/open', (req, res) => {
    try {
        if (!req.params.branch_name)
            return res.send({
                status: 'ERROR Missing required param: branch_name'
            });


        let id = shortid.generate();
        //clone repo in dir with id


        db.get('active_branches')
            .push({
                branch_name: req.params.branch_name,
                branch_id: id
            });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`
        });
    }
});

router.get('/status/:branch_name', (req, res) => {

})

/**
 * Closes a branch and stops serving it
 * 
 */
router.post('/close', (req, res) => {

})

router.get('/active_branches', (req, res) => {
    try {
        res.send({
            status: 'OK',
            active_branches: db.get('active_branches')
        });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`
        });
    }
});

router.get('/closed_branches', (req, res) => {
    try {
        res.send({
            status: 'OK',
            closed_branches: db.get('closed_branches')
        });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`
        });
    }
});

router.get('/branches', (req, res) => {
    try {
        res.send({
            status: 'OK',
            branches: {
                active_branches: db.get('active_branches'),
                closed_branches: db.get('closed_branches')
            }
        });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`
        });
    }
});

server.use('/branch-deploy', router);

server.listen((process.env.PORT) ? process.env.PORT : 3000, process.env.HOST ? process.env.HOST : 'localhost', function () {
    console.log(`${server.name} listening at http://${process.env.HOST ? process.env.HOST : 'localhost'}:${(process.env.PORT) ? process.env.PORT : 3000}`);
});

//start up stored branches
