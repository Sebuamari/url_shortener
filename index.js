require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose');
mongoose.connect(
  process.env.MONGO_URI, 
  { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  }
);

var urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true
  }
})
const Schema = mongoose.Schema;

var url = mongoose.model('url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static('public'));
app.use(express.static(__dirname + "/public"));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:number', function(req, res) {
  const short_url = req.params.number;

  url.findOne({
    short_url: short_url
  }).then((data) => {
    if(data) {
      res.redirect(data.original_url);
    } else {
      res.json({
        error: 'No short url found for given input'
      });
    }
  });
});

app.post('/api/shorturl', function(req,res) {
  const original_url = req.body.url;
  const URL_regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

  if(!URL_regex.test(original_url)) {
    res.json({
      error: 'invalid url'
    });
  }

  url.findOne({
    original_url: original_url
  }).then((data) => {
    if(data) {
      res.json({
        original_url: data.original_url,
        short_url: data.short_url
      });
    }
  });
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
