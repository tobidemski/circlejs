const path = require('path')
const express = require('express')
var os = require("os");
const app = express()
const port = 3000

app.use(express.static('examples'))
app.use('/src', express.static(path.join(__dirname, 'src')))
app.use('/dist', express.static(path.join(__dirname, 'dist')))

app.listen(port, (error) => {
    if (!error) {
        console.log(`Server is Successfully running and listening on port ${port}. Visit --> http://localhost:${port}`);
    }
    else {
        console.log("Error occurred, server can't start", error);
    }
})