#!/bin/node

var http = require('http');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');

const BASE_DIR = process.argv[2] || "."
const PASSWORD = "SUPERSECRETPASSWORD";

var notAuthenticated = function(response) {
    response.writeHead(401, {"Content-Type": "text/html"});
    let data = fs.readFileSync(BASE_DIR + "/unauthorized.html");
    response.end(data, "utf-8");
}

var notFound = function(response) {
    response.writeHead(404, {"Content-Type": "text/html"});
    response.end();
}

// paths allowed without authentication, regex possible
let allowedpaths = [
    {"path": "/css/[^/]*.css", "type": "text/css"},
    {"path": "/images/favicon.png", "type": "text/javascript"}
]

var server = http.createServer(function (request, response) {

    let url = request.url.split('?');
    let file = url[0];
    if (file === "/") { file = "/gallery.html" }
    
    // 1. User tries getting acces with password
    // Store password in cookie if correct
    let password = querystring.parse(url[1])["password"];
    if (password) {
        if (password === PASSWORD) {
            response.setHeader("Set-Cookie", `password=${password}; Path=/`) // Session cookie
            response.writeHead(200);
        } else {
            response.writeHead(401, "Wrong password");
        }
        response.end();
        return;
    }

    // 2. User tries getting file
    let allowed = false;
    let type = "";
    // Extract password cookie
    if (request.headers.cookie) {
        password = request.headers.cookie.replace(/^(.*; )?password=([^;]*)(;.*)?$/, (match, g1, g2, g3) => g2);
        if (request.headers.cookie.match(/(^|; )password=/) && password === PASSWORD) {
            allowed = true;
        }
    }

    if (!allowed) {
        for (allowedpath of allowedpaths) {
            if (file.match(allowedpath["path"])) {
                allowed = true;
                type = allowedpath["type"];
                break;
            }
        }
    }

    if (allowed) {
        try {
            let data = fs.readFileSync(BASE_DIR + file);
            response.writeHead(200, {"Content-Type": type});
            response.end(data, "utf-8");
        } catch {
            notFound(response);
        }
    } else {
        notAuthenticated(response);
    }
});

server.listen(8000);

