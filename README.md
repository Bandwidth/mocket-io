Mocket.IO
=========
[![Build Status](https://travis-ci.org/inetCatapult/mocket-io.svg?branch=master)](https://travis-ci.org/inetCatapult/mocket-io)

A partial mock of Socket.IO for use with Incubator projects

##Usage

    var io = require("mocket-io").io;

    var socket = io.connect();
    var handler = sinon.spy();
    socket.on("event", handler);
    socket.emit("event", "message");

    expect(handler.called).to.be.true;

###Rooms

    var handler = sinon.spy();
    socket.on("roomEvent", handler);
    socket.join("room A");
    socketB.to("room A").emit("roomEvent", "message");
    
    expect(handler.called).to.be.true;

###Socket Options

    var io = require("mocket-io").io;

    io.connect.configure({ auth: { ... } });

    var socket = io.connect();
    expect(socket).to.have.property("auth");

###Middleware

    var io = require("mocket-io").io;

    io.use(function (socket, next) {
        socket.foo = "bar";
        next();
    });

    var socket = io.connect();
    expect(socket).to.have.property("foo");