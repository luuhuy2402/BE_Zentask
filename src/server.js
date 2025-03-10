// import express from "express";
const express = require('express')
const app = express();
const hostname = "localhost";
const port = 2402;

app.get("/", function (req, res) {
    res.send("hello");
});

app.listen(port, hostname, () => {
    console.log(`xeoxe, server running http://${hostname}:${port}/`);
});
