// FILE: /routes/search.js

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
 
var mongoose   = require('mongoose'),
	express    = require('express'),
	bodyParser = require('body-parser');

var router	   = express.Router();
var Show       = require('../models/show');

var utils	   = require('../helpers/utils');

// GET /show/search/name/:name -> Busca shows que contengan :name en su título.
var getShowByPartialName = function(req, res) {
	var search = req.params.search + ".*";
	Show.find({ name : { $regex : search, $options : 'i'}}, function (err, show) {

		if (err) throw err;

		if (show === null) {

			console.log('GET /show/search/name/' + req.params.search + ' - [NULL]');
			res.status(500).json({ 'error' : true, 'error_id' : 0, 'message' : 'Error interno'});

		} else {

			console.log('GET /show/search/name/' + req.params.search + ' - [SUCCESS]');
			res.status(200).json({ 'error' : false, 'result_count' : show.length, 'result' : show});

		}
	});
}

// GET /show/search/seasons/:criteria/:seasons -> busca shows por número de temporadas
// que se ajusten al :criteria escogido {lt, lte, eq, gte, gt}
var getBySeasonsNumber = function(req, res) {
	var onResult = function(err, show) {

		if (err) throw err;

		if (show === null) {

			console.log('GET /show/search/seasons/' + req.params.criteria + '/' + req.params.seasons + ' - [NULL]');
			res.status(500).json({ 'error' : true, 'error_id' : 0, 'message' : 'Error interno'});

		} else{

			console.log('GET /show/search/seasons/' + req.params.criteria + '/' + req.params.seasons + ' - [SUCCESS]');
			res.status(200).json({ 'error' : false, 'result_count' : show.length, 'result' : show});

		}
	}
	switch(req.params.criteria){
		case "lt":
			Show.find({ seasons : { $lt : req.params.seasons } }, onResult);
			break;
		case "lte":
			Show.find({ seasons : { $lte : req.params.seasons } }, onResult);
			break;
		case "eq":
			Show.find({ seasons : req.params.seasons }, onResult);
			break;
		case "gte":
			Show.find({ seasons : { $gte : req.params.seasons } }, onResult);
			break;
		case "gt":
			Show.find({ seasons : { $gt : req.params.seasons } }, onResult);
			break;
		default:
			console.log('GET /show/search/seasons/' + req.params.criteria + '/' + req.params.seasons + ' - [FAILED] [CRITERIA]');
			res.status(400).json({ 'error' : true, 'error_id' : 2, 'message' : 'Criteria unrecognized.'});
			break;
	}
}

// GET /show/search/chapters/:criteria/:chapters -> busca shows por número de capítulos
// que se ajusten al :criteria escogido {lt, lte, eq, gte, gt}
var getByChaptersNumber = function(req, res) {
	var onResult = function(err, show) {

		if (err) throw err;

		if (show === null) {

			console.log('GET /show/search/chapters/'+ req.params.criteria + '/' + req.params.seasons + ' - [NULL]');
			res.status(500).json({ 'error' : true, 'error_id' : 0, 'message' : 'Error interno'});

		} else{

			console.log('GET /show/search/seasons/' + req.params.criteria + '/' + req.params.seasons + ' - [SUCCESS]');
			res.status(200).json({ 'error' : false, 'result_count' : show.length, 'result' : show});

		}
	}
	switch(req.params.criteria){
		case "lt":
			Show.find({ chapters : { $lt : req.params.chapters } }, onResult);
			break;
		case "lte":
			Show.find({ chapters : { $lte : req.params.chapters } }, onResult);
			break;
		case "eq":
			Show.find({ chapters : req.params.chapters }, onResult);
			break;
		case "gte":
			Show.find({ chapters : { $gte : req.params.chapters } }, onResult);
			break;
		case "gt":
			Show.find({ chapters : { $gt : req.params.chapters } }, onResult);
			break;
		default:
			console.log('GET /show/search/seasons/' + req.params.criteria + '/' + req.params.chapters + ' - [FAILED] [CRITERIA]');
			res.status(400).json({ 'error' : true, 'error_id' : 2, 'message' : 'Criteria unrecognized.'});
			break;
	}
}

router.get('/search/name/:search', getShowByPartialName);
router.get('/search/seasons/:criteria/:seasons', getBySeasonsNumber);
router.get('/search/chapters/:criteria/:chapters', getByChaptersNumber);

module.exports = router;