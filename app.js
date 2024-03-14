//app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors')

const userRoutes = require('./routes/users');
const auth = require('./routes/auth');
const app = express();

app.use(bodyParser.json());

// Enable CORS for all origins
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/mlm', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

app.use('/api/users', userRoutes);
app.use('/api/users', auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
