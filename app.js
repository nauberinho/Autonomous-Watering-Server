'use strict';
//Require user model. Needed for chip requests.
var User = require('./src/models/user.js');

/* Express + Express-session */
var app = require('express')();
var session = require('express-session');

/* Socket.io */
var http = require('http').Server( app );

var multer  = require('multer');

/* MongoDB + Mongoose */
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://sigma-itc-admin:sigma2013!@ds133465.mlab.com:33465/sigma-itc-autonomous-watering', {useMongoClient:true});
mongoose.connect('mongodb://localhost/sigma-watering', {useMongoClient:true});

/* Uuid Generator */
const uuidv4 = require('uuid/v4');

/*----- Make app use body query parser ----- */
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ type: 'application/json' });
app.use(jsonParser);

/* Express settings */
app.set('port', 3000);
app.use(require('body-parser').json({type: 'application/json'})); 
app.use((req, res, next) => {res.header("Access-Control-Allow-Origin", "*"); res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); next();});

/* Sessions - Express-session depricated? */
app.use(session({
  secret: 'hx79oj23-h874-j894-mv24',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  genid: function(req) {
    return uuidv4() 
  },
}));


// configuring Multer to use files directory for storing files
// this is important because later we'll need to access file path
const storage = multer.diskStorage({
    destination: './files',
    filename(req, file, cb) {
        cb(null, `${new Date()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

/********----ROUTES FOR DEV MODE----**************/
//app.get('/',                  (req, res) => { res.sendFile("./src/routes/client/index.html", {root:__dirname}); });
app.get('/',                  (req, res) => { res.send("Dev site")});
app.get('/dev',               (req, res) => { /*console.log(req.session);*/ res.sendFile("./src/routes/dev/index.html", {root:__dirname});});
app.get('/api/plants/postmeasurements',    (req, res) => { res.sendFile("./src/routes/api/add.html",    {root:__dirname}); });

/* Module to handle Socket.io requests */
var SocketHandler = require('./src/exports/SocketHandler.js');

// express route where we receive files from the client
// passing multer middleware
app.post('/api/user-add-plant-image', upload.single('file'), (req, res) => {
    const file = req.file; // file passed from client
    console.log(file, req.body)
    const meta = req.body; // all other values passed from the client, like name, etc..
})

/******************--------SYSTEM/AUTHENTICATION POSTS-----************/
    app.post('/api/system-add-user', (req, res) => {
        var payload = req.body;
        User.addUser(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}});
    });
    app.post('/api/system-login-user', (req, res) => {
        User.loginUser(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}});
    });
    app.post('/api/system-get-users', (req, res) => {
        User.getUsers(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}});
    });
    app.post('/api/system-remove-user', (req, res) => {
        User.removeUser(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}});
    });

/********************----USER-------****************************/
    /*************----STATION POSTS----*************/
    app.post('/api/user-add-station', (req, res) => {
        var payload = req.body;
        User.addStation(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });
    app.post('/api/user-update-station', (req, res) => {
        var payload = req.body;
        User.updateStation(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });
    app.post('/api/user-get-stations', (req, res) => {
        var payload = req.body;
        User.getStations(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });
    app.post('/api/user-get-one-station', (req, res) => {
        var payload = req.body;
        User.getOneStation(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });
    app.post('/api/user-delete-one-station', (req, res) => {
        var payload = req.body;
        User.deleteOneStation(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });

    /*************----PLANT POSTS----************/
    app.post('/api/user-add-plant', (req, res) => {
        var payload = req.body;
        User.addPlant(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });
    app.post('/api/user-get-one-plant', (req, res) => {
        var payload = req.body;
        User.getOnePlant(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });
    app.post('/api/user-remove-one-plant', (req, res) => {
        var payload = req.body;
        User.removeOnePlant(payload, (err, success) => {
            success ? res.send(success) : (err) => {throw err}})
    });

/************************----CHIP POSTS----***********************/
    app.post('/api/getStation', (req, res) => {
        var payload = req.body;
        User.chipGetStation(payload, (station) => {
            station ? res.send(station) : console.log('Station not found.')})
    });


//**************------START APP ON PORT (port)--------**********************//
http.listen(app.get('port'),  () => { console.log('Node app is running on port', app.get('port')); });
