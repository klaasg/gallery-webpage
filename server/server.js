#!/bin/node

var http = require('http');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');

const BASE_DIR = "."
const PASSWORD = "SUPERSECRETPASSWORD";
// undefined for browser session, date for longer.
const LOGIN_MAX_AGE = "60"; // `${60*60*24*30*12*5}` <- 5 years

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
    
    // 1. User tries getting acces with password, this only happens once per session
    // Store password in cookie if correct
    let password = querystring.parse(url[1])["password"];
    if (password) {
        if (password === PASSWORD) {
            let cookie = `password=${password}; Secure;`
            if (LOGIN_MAX_AGE) { cookie += ` Max-Age=${LOGIN_MAX_AGE};`; }
            response.setHeader("Set-Cookie", cookie);
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
        let password_found = false;
        password = request.headers.cookie.replace(/^(.*; )?password=([^;]*)(;.*)?$/, (match, g1, g2, g3) => { password_found = true; return g2; });
        if (password_found && password === PASSWORD) {
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
            //response.writeHead(200, {"Content-Type": type});
            response.writeHead(200);
            response.end(data, "utf-8");
        } catch {
            notFound(response);
        }
    } else {
        notAuthenticated(response);
    }
});

server.listen(8000);

