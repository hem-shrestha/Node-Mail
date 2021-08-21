var createServer = require("http").createServer;
var readFile = require("fs").readFile;
var url = require("url");
DEBUG = false;

var fu = exports;

var NOT_FOUND = "Not Found\n";

function notFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain"
                     , "Content-Length": NOT_FOUND.length
                     });
  res.end(NOT_FOUND);
}

var getMap = {};

fu.get = function (path, handler) {
  getMap[path] = handler;
};
var server = createServer(function (req, res) {
  if (req.method === "GET" || req.method === "HEAD") {
    var handler = getMap[url.parse(req.url).pathname] || notFound;

    res.simpleText = function (code, body) {
      res.writeHead(code, { "Content-Type": "text/plain"
                          , "Content-Length": body.length
                          });
      res.end(body);
    };

    res.simpleJSON = function (code, obj) {
      var body = Buffer.from(JSON.stringify(obj));
      res.writeHead(code, { "Content-Type": "text/json"
                          , "Content-Length": body.length
                          });
      res.end(body);
    };

    handler(req, res);
  }
});

fu.listen = function (port, host) {
  server.listen(port, host);
  console.log("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};

fu.close = function () { server.close(); };

function extname (path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
}

fu.staticHandler = function (filename) {
  var body, headers;
  var content_type = fu.mime.lookupExtension(extname(filename));

  function loadResponseData(callback) {
    if (body && headers && !DEBUG) {
      callback();
      return;
    }

    console.log("loading " + filename + "...");
    readFile(filename, function (err, data) {
      if (err) {
        console.log("Error loading " + filename);
      } else {
        body = data;
        headers = { "Content-Type": content_type
                  , "Content-Length": body.length
                  };
        if (!DEBUG) headers["Cache-Control"] = "public";
        console.log("static file " + filename + " loaded");
        callback();
      }
    });
  }

  return function (req, res) {
    loadResponseData(function () {
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    });
  }
};

// stolen from jack- thanks
fu.mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension : function(ext, fallback) {
    return fu.mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
  },

  // List of most common mime-types, stolen from Rack.
  TYPES : { ".3gp"   : "video/3gpp"
          , ".avi"   : "video/x-msvideo"
          , ".bmp"   : "image/bmp"
          , ".conf"  : "text/plain"
          , ".css"   : "text/css"
          , ".htm"   : "text/html"
          , ".html"  : "text/html"
          , ".ico"   : "image/vnd.microsoft.icon"
          , ".jpeg"  : "image/jpeg"
          , ".jpg"   : "image/jpeg"
          , ".js"    : "application/javascript"
          , ".json"  : "application/json"
          , ".log"   : "text/plain"
          , ".mov"   : "video/quicktime"
          , ".mp3"   : "audio/mpeg"
          , ".mp4"   : "video/mp4"
          , ".mpeg"  : "video/mpeg"
          , ".mpg"   : "video/mpeg"
          , ".pdf"   : "application/pdf"
          , ".png"   : "image/png"
          , ".ppt"   : "application/vnd.ms-powerpoint"
          , ".rss"   : "application/rss+xml"
          , ".svg"   : "image/svg+xml"
          , ".swf"   : "application/x-shockwave-flash"
          , ".text"  : "text/plain"
          , ".txt"   : "text/plain"
          , ".wsdl"  : "application/wsdl+xml"
          , ".xml"   : "application/xml"
          , ".yaml"  : "text/yaml"
          , ".yml"   : "text/yaml"
          , ".zip"   : "application/zip"
          }
};
