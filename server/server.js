/*
 * Copyright 2014 Sergio Luis Para
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
var express 	   = require('express'),
    app	    	   = express(),
    bodyParser 	   = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose	   = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/subtit_rest', function(err, res) {
	if (err) throw err;
	console.log('Conectado a la base de datos');
});

var models = require('./models/show')(app, mongoose);

var info = require('./routes/info');
var search = require('./routes/search');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());
app.use(methodOverride());

app.use('/api/v1/', info);
app.use('/api/v1/', search);

app.listen(3000, function() {
	console.log("Node server running on http://localhost:3000");
});
