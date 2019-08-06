const express = require("express");
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./client_secret.json');
const app = express();
const pkg = require('./package.json');
const { port } = require('./config')

app.get("/google-spreadsheet", (req, res) => {
  
  // Identifying which document we'll be accessing/reading from
  var doc = new GoogleSpreadsheet('1nBVbqtmJpZry73GaHLP7ZDTyuVpcFcp2r7PJiUXB1JU');

  // Authentication
  doc.useServiceAccountAuth(creds, function (err) {
  
  // Getting cells back from tab #2 of the file
  doc.getRows(1, callback)
  
  // Callback function determining what to do with the information
  function callback(err, rows){
    
    // Logging the output or error, depending on how the request went
    console.log(rows)
    res.send({ rows: rows })
    console.log(err)
    
    // Rending the test page while passing in the response data through "rows". Can access specific data points via: rows[i]._value
    
  }
  });  
});

app.set('config', config);
app.set('pkg', pkg);
app.use(express.json());


app.listen(port, () => {
  console.info(`App listening on port ${port}`);
});