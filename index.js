const express = require("express");
const config = require('./config');
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./client_secret.json');
const app = express();
const pkg = require('./package.json');
const { port } = config;

app.get("/data/:userDni", (req, res) => {
  const { userDni } = req.params;
  if (!userDni) {
    return res.status(404).json({ error: 'Bad request' });
  }
  // Identifying which document we'll be accessing/reading from
  var doc = new GoogleSpreadsheet('1nBVbqtmJpZry73GaHLP7ZDTyuVpcFcp2r7PJiUXB1JU');

  // Authentication
  doc.useServiceAccountAuth(creds, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    // Getting cells back from tab #2 of the file
    doc.getRows(1, callback)
    
    // Callback function determining what to do with the information
    function callback(err, rows){
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      // Logging the output or error, depending on how the request went
      const user = rows.find(user => user.dni === userDni);
      if (!user) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.send(user);
    }
  });  
});

app.set('config', config);
app.set('pkg', pkg);
app.use(express.json());


app.listen(port, () => {
  console.info(`App listening on port ${port}`);
});