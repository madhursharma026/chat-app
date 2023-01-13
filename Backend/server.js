console.log("Server JS")

var express = require("express")

var app = express()

app.use(function (request, result, next) {
    result.setHeader("Access-Control-Allow-Origin", "*");
    next()
})

var http = require("http").createServer(app)

var io = require("socket.io")(http, { cors: { origin: "*" } });

var mysql = require("mysql")

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "web_chat"
})

connection.connect(function (error) {
    console.log("MySql Connection Error", error)
})

io.on("connection", function (socket) {
    console.log("User connected", socket.id)

    // socket.on("new_message", function (data) {
    //     console.log("Client says", data)

    //     io.emit("new_message", data)

    //     connection.query("INSERT INTO messages (message) VALUES ('" + data + "' )", function (error, result) {
    //         console.log("MySql Insert Error", error)
    //     })
    // })

    socket.on("new_message", function (data) {
 
        // save message in database
        connection.query("INSERT INTO messages(username, message) VALUES('" + data.username + "', '" + data.message + "')", function (error, result) {
            data.id = result.insertId;
            io.emit("new_message", data);
        });
    });

})

app.get("/get_messages", function (request, result) {
    connection.query("SELECT * FROM messages", function (error, messages) {
        result.end(JSON.stringify(messages))
    })
})

app.get("/", function (request, result) {
    result.send("Hello World!")
})

const hostname = '127.0.0.1';
const port = 3007;

http.listen(port, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
})
