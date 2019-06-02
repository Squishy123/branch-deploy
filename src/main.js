//setup env vars
require('dotenv').config();

//git bindings
const Git = require('nodegit');

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

router.use((req, res, next) => {
    req.data = {};
    req.data = Object.assign(req.data, req.params, req.body, req.query);
    console.log(req.data);
    next();
});

router.get('/', (req, res) => {
    res.send('Branch Deploy Working!');
});

/**
 * Opens a new branch and starts serving it
 * branch_name
 */
router.post('/open', async (req, res) => {
    try {
        if (!req.data.branch_name)
            return res.send({
                status: 'ERROR Missing required param: branch_name',
            });

        let id = shortid.generate().toLowerCase();

        db.get('jobs')
            .push({
                branch_id: id,
                branch_name: req.data.branch_name,
                status: 'pending',
            })
            .write();

        //clone repo in dir with id
        Git.Clone(
            process.env.REPO_URL,
            `./branches/${req.data.branch_name}_build_${id}`
        )
            .then(function(repo) {
                console.log('Completed clone of repo!');
                db.get('active_branches')
                    .push({
                        branch_name: req.data.branch_name,
                        branch_id: id,
                        path: `branches/${req.data.branch_name}_build_${id}`,
                    })
                    .write();

                db.get('jobs')
                    .find({ branch_id: id })
                    .set('status', 'completed')
                    .write();
            })
            .catch(function(err) {
                db.get('jobs')
                    .find({ branch_id: id })
                    .set('status', 'cancelled')
                    .set('message', `ERROR ${err}`)
                    .write();
            });

        return res.send({
            status: 'OK',
            branch_id: id,
            branch_name: req.data.branch_name,
            job: `/status/${id}`,
            job_status: 'pending',
        });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`,
        });
    }
});

router.get('/status/:branch_id', (req, res) => {
    return res.send({
        status: 'OK',
        job: db
            .get('jobs')
            .find({ branch_id: req.params.branch_id })
            .value(),
    });
});

/**
 * Closes a branch and stops serving it
 *
 */
router.post('/close', (req, res) => {});

router.get('/active_branches', (req, res) => {
    try {
        res.send({
            status: 'OK',
            active_branches: db.get('active_branches'),
        });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`,
        });
    }
});

router.get('/closed_branches', (req, res) => {
    try {
        res.send({
            status: 'OK',
            closed_branches: db.get('closed_branches'),
        });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`,
        });
    }
});

router.get('/branches', (req, res) => {
    try {
        res.send({
            status: 'OK',
            branches: {
                active_branches: db.get('active_branches'),
                closed_branches: db.get('closed_branches'),
            },
        });
    } catch (err) {
        return res.send({
            status: `ERROR ${err}`,
        });
    }
});

server.use('/branch-deploy', router);

server.listen(
    process.env.PORT ? process.env.PORT : 3000,
    process.env.HOST ? process.env.HOST : 'localhost',
    function() {
        console.log(
            `${server.name} listening at http://${
                process.env.HOST ? process.env.HOST : 'localhost'
            }:${process.env.PORT ? process.env.PORT : 3000}`
        );
    }
);

//start up stored branches
