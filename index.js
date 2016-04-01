
// jshint esversion: 6
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var querystring = require('querystring');
var app = express();

// Twilio Credentials
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// respond with "hello world" when a GET request is made to the homepage
app.post('/', function(req, res) {
    //console.log(req.body);

    res.set('Content-Type', 'text/plain');
    query = querystring.stringify({
        'output': 'json',
        'zip': parseZip(req.body.Body) || req.body.FromZip
    });

    var jsonBuf = '';
    request
        .get('http://whoismyrepresentative.com/getall_mems.php?' + query)
        .on('error', function(err) {
            console.log('Error: ' + error);
            res.sendStatus(400);
        })
        .on('response', function(response) {
            response.on('data', (chunk) => {
                jsonBuf += chunk;
            });
            response.on('end', () => {
                try {
                    var results = JSON.parse(jsonBuf).results;
                    var reply = formatReply(results);
                    res.send(reply);
                } catch (e) {
                    console.log(e);
                    res.sendStatus(400);
                }
            });

        });
});

app.listen(app.get('port'), function () {
  console.log('Reps app listening on port ' + app.get('port'));
});

function formatReply(results) {
    //console.log(results);
    var people = [];
    results.forEach(function(person) {
        people.push(person.name + ' ' + person.party + ' ' + person.link);
    });
    var reply = 'Your Representatives:\n';
    people.forEach(function(personString) {
        reply = reply.concat(personString + '\n');
    });

    console.log(reply);
    return reply;
}


function parseZip(body) {
    if (/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(body))
        return body;
    else
        return undefined;
}
