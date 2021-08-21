HOST = process.env.HOST || "0.0.0.0"; // localhost
PORT = process.env.PORT || 8000;

// when the daemon started
var starttime = (new Date()).getTime();

var mem = process.memoryUsage();
// every 10 seconds poll for the memory.
setInterval(function () {
    mem = process.memoryUsage();
}, 30 * 1000);

var fu = require("./fu"),
    url = require("url"),
    qs = require("querystring");
var nodemailer = require('nodemailer');

fu.listen(Number(PORT), HOST);

fu.get("/", fu.staticHandler("index.html"));
fu.get("/style.css", fu.staticHandler("style.css"));
fu.get("/client.js", fu.staticHandler("client.js"));
fu.get("/jquery-1.2.6.min.js", fu.staticHandler("jquery-1.2.6.min.js"));


fu.get("/status", function (req, res) {
    res.simpleJSON(200, {rss: mem.rss, starttime: starttime});
});

fu.get("/join", function (req, res) {
    var query = qs.parse(url.parse(req.url).query)
    var email = query.email;
    if (email === process.env.MAIL_FROM) {
        res.simpleJSON(200, {message: "success"});
    } else {
        res.simpleJSON(400, {message: "Invalid from email"});
    }
});

fu.get("/send", function (req, res) {
    var query = qs.parse(url.parse(req.url).query)
    var to = query.to || 'hereshem@gmail.com';
    var subject = query.subject || 'Test email from Node';
    var text = query.text || '<h1>Example HTML Message Body for Node</h1>';
    console.log("sending mail for " + to)
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || "smtp.google.com",
        port: process.env.MAIL_PORT || 587,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    });
    transporter.sendMail({
        from: process.env.MAIL_FROM || 'Node Mail <hereshem@gmail.com>',
        to: to,
        subject: subject,
        html: text
    }).then(function (info) {
        console.log(info);
        res.simpleJSON(200, info);
    }).catch((error) => {
        console.error(error);
        res.simpleJSON(400, error);
    });
});
