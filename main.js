var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var exphbs = require('express-handlebars');

var nodemailer = require('nodemailer');

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:admin@ds231199.mlab.com:31199/kpmgdb";

var eventos;
var urlencoderParser =

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("kpmgdb");
  dbo.collection("eventos").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    eventos = result;
    db.close();
  });
}); 

app.set('views', path.join(__dirname,'views'));
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

app.set('port',(process.env.PORT || 8080));


app.post('/contact', urlencodedParser, function (req, res) {
  if (!req.body) return

  console.log(req.body.email + " " + req.body.evento);
    MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("kpmgdb");
  dbo.collection("eventos").update(
    { nombre: req.body.evento.toString(),}, 
    {$push: { participantes: req.body.email.toString() }}
)
    
}); 
    var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cristopherjrivasc@gmail.com',
    pass: 'bigboss060895'
  }
});

var mailOptions = {
  from: 'cristopherjrivasc@gmail.com',
  to: req.body.email.toString(),
  subject: 'Gracias por registrarte en nuestro evento',
  text: 'Gracias por registrarte a nuestro evento.' 
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
}); 
    res.render('contact-success',{data: req.body,eventos: eventos});
});

app.get('/', function(req,res){
    res.render('home',{
        eventos: eventos
    });
});
app.listen(app.get('port'), function(){
    console.log("Server start on port" + app.get('port'));
});