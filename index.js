const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser')
const config = require('./config');
const GoogleSpreadsheet = require('google-spreadsheet');
const requestPromise = require('request-promise');
const creds = require('./client_secret.json');
const app = express();
const pkg = require('./package.json');
const { port } = config;

app.set('config', config);
app.set('pkg', pkg);
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post("/data/:userDni", (req, res) => {
  const { userDni } = req.params;
  const {referer} = req.headers;
  if (!userDni) {
    return res.status(403).json({ error: 'Bad request' })
  }
  if (!(referer === 'http://localhost:5500/dist/' || referer === 'https://score-financiero.firebaseapp.com/')) {
    return res.status(403).json({ error: 'Bad request' })
  }
  const { token } = req.body;
  const options = {
    method: 'POST',
    uri: `https://www.google.com/recaptcha/api/siteverify?secret=6LestLIUAAAAAIhztah6on5s-2msBSr9EQOw2aa9&response=${token}`,
    json: true
  };
  requestPromise(options)
    .then(({ success, hostname }) => {
      if (success && (hostname === 'localhost' || hostname === 'https://score-financiero.firebaseapp.com/')) {
        // Identifying which document we'll be accessing/reading from
        const doc = new GoogleSpreadsheet('1nBVbqtmJpZry73GaHLP7ZDTyuVpcFcp2r7PJiUXB1JU');

        // Authentication
        doc.useServiceAccountAuth(creds, function (err) {
          if (err) {
            return res.status(500).json({ error: err.message })
          }
          // Callback function determining what to do with the information
          const callback = (err, rows) => {
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
          // Getting cells back from tab #2 of the file
          doc.getRows(1, callback)
          
          
        });  
      } else {
        return res.status(403).json({ error: 'Bad request' })
      }
    })
    .catch(error => {
      return res.status(403).json({ error: error.message })
    })
});




app.listen(port, () => {
  console.info(`App listening on port ${port}`);
});