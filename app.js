/**
 * GLOBAL MODULES
 */

// set the environment
process.env.NODE_ENV = 'production';

_require = function(name) {
    return require(__dirname + name);
};

_ = require('underscore');
express = require('express');
fs = require('fs');
request = require('request');
cheerio = require('cheerio');
http = require('http');
expressLayouts = require('express-ejs-layouts');
morgan = require('morgan');
bodyParser = require('body-parser');
methodOverride = require('method-override');
async = require('async');
mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
moment = require('moment');
qs = require('qs');
config = require('./config');

/**
 * APP ROUTES
 */
// Web Pages
var environment = process.env.NODE_ENV
    , app = express();

/**
 * CUSTOM MODULES
 */
var routes = require('./routes'),
    mcore = require('./routes/m-core'),
    muob = require('./routes/m-uob'),
    mongoHelper = _require('/helpers/mongo');

/**
 * MODELS, CONTROLLERS, HELPERS
 */

appModels = _require('/app-models');
appHelpers = _require('/app-helpers');
appControllers = _require('/app-controllers');


/**
 * MONGODB CONNECTION
 */

mainConn = mongoHelper.formatConnString(config.mongo);
mongodb = mongoose.connect(mainConn);


/**
 * APP INIT CONFIGURATIONS
 */
app.set('port', process.env.PORT || 3999);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(morgan('common'));
app.use(bodyParser.urlencoded({extended: true,limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(methodOverride());
app.set('trust proxy', 1); //trust first proxy

app.get('/', routes.index);


// APIs
app.get('/mcore/:base/:api', mcore);
app.post('/mcore/:base/:api', mcore);
app.get('/muob/:base/:api', muob);
app.post('/muob/:base/:api', muob);

/**
 * SERVER START
 */

http.createServer(app).listen(app.get('port'), function () {
    var production = environment + ' mode';
    console.log(production + ' - server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err) {
    var errorThread = err.stack;
    console.log(errorThread);
});

process.on( 'SIGINT', function() {
    //shutting down
    console.log('Shutting down MongoDB connection');
    mongoose.connection.close();

    // some other closing procedures go here
    console.log('Exiting');
    process.exit();
});