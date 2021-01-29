#!/bin/node

var http = require('http');
var fs = require('fs');
var path = require('path');

const BASE_PATH = ".";
const BASE_PATH_SLASH = BASE_PATH + "/";
const PASSWORD = "SUPERSECRETPASSWORD";
const unauthorised_response = fs.readFileSync(BASE_PATH_SLASH + "unauthorized.html");

var notAuthenticated = function(response) {
    response.setHeader("WWW-Authenticate", 'Basic realm="Auth"');
    response.writeHead(401, {"Content-Type": "text/html"});
    response.end(unauthorised_response, "utf-8");
}

// paths allowed without authentication, regex possible
let allowedpaths = [
    {"path": BASE_PATH_SLASH + "css/normalize.css", "type": "text/css"},
    {"path": BASE_PATH_SLASH + "css/skeleton.css", "type": "text/css"},
    {"path": BASE_PATH_SLASH + "css/unauthorized.css", "type": "text/css"},
    {"path": BASE_PATH_SLASH + "images/favicon.png", "type": "text/javascript"}
]

var server = http.createServer(function (request, response) {

    console.log(url);
    let path = BASE_PATH + request.url.split('?')[0];
    if (!request.headers.authorization) {

        console.log(path);

        let allowed = false;
        let type = "";
        for (allowedpath of allowedpaths) {
            if (path.match(allowedpath["path"])) {
                allowed = true;
                type = allowedpath["type"];
                break;
            }
        }

        if (allowed) {
            response.writeHead(200, {"Content-Type": type});
            let data = fs.readFileSync(path);
            response.end(data, "utf-8");
        } else {
            notAuthenticated(response);
        }
        return;
    }

    console.log(request.headers.authorization);

    let b64auth = (request.headers.authorization || '').split(' ')[1] || '';
    let auth = Buffer.from(b64auth, 'base64').toString("utf-8");
    let password = auth.substring(auth.indexOf(":") + 1);

    console.log(password);

    if (password === PASSWORD) {
        console.log("JUIST")
        console.log(request.headers)
        if (path ==
        let data = fs.readFileSync(path);
        response.writeHead(200);
        response.end(data, "utf-8");
    } else {
        console.log("FOUT")
        notAuthenticated(response);
    }
});

server.listen(8000);

