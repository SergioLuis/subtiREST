// FILE: /routes/info.js

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
var Title	   = require('../models/title');

var utils	   = require('../helpers/utils');

// GET /info/id/:id -> retorna los datos del show con el id equivalente.
var getShowById = function(req, res) {
	Show.find({ _id : req.params.id }, function (err, show) {

		if (err) { throw err; }

		if (show === null) {

			console.log('GET /show/id/' + req.params.id + ' - [NULL]');
			res.status(500).json({ 'error' : true, 'error_id' : 0, 'message' : 'Error interno'});
		
		} else{

			if (show.length === 0) {

				console.log('GET /show/id/' + req.params.id + ' - [SHOW NOT FOUND]');
				res.status(404).json({ 'error' : true, 'error_id' : 10, 'message' : 'Show not found'});

			} else {

				console.log('GET /show/' + req.params.id + ' - [SUCCESS]');
				res.json({ 'error' : false, 'show': show[0] });

			}
		}
	});
}

// GET /info/name/:name -> retorna los datos del show con el nombre. Estricto.
var getShowByName = function(req, res) {
	Show.find({ name : req.params.name }, function (err, show) {

		if (err) throw err;

		if (show === null) {

			console.log('GET /show/name/' + req.params.name + ' - [NULL]');
			res.status(500).json({ 'error' : true, 'error_id' : 0, 'message' : 'Error interno'});

		} else {

			if (show.length === 0) {

				console.log('GET /show/name/' + req.params.name + ' - [404]');
				res.status(404).json({ 'error' : true, 'error_id' : 10, 'message' : 'Show not found'});

			} else {

				console.log('GET /show/name/' + req.params.name + ' - [SUCCESS]');
				res.status(200).json({ 'error' : false, 'show' : show[0] });

			}
		}
	});
}

// GET /title/byid/:id/:season/:chapter
var scrapChapterTitleById = function(req, res) {
	Title.findOne({ show_id : req.params.id, season : req.params.season, chapter : req.params.chapter }, function (err, title){

		if (err) throw err;

		if (title === null) {

			utils.scrapTitleById(req.params.id, req.params.season, req.params.chapter, function (error, result) {

				if (!error) {

					console.log('GET /title/byid/' + req.params.id + '/' + req.params.season + '/' + req.params.chapter + ' - [SUCCESS] [SCRAPED]');
					res.status(200).json({ 'error' : false, 'title' : result });

				} else {

					console.log('GET /title/byid/' + req.params.id + '/' + req.params.season + '/' + req.params.chapter + ' - [FAILED] [NOT SCRAPED]');
					res.status(404).json({ 'error' : true, 'error_id' : 11, 'message' : 'Title not Found'});
				}
			});

		} else {

			console.log('GET /title/byid/' + req.params.id + '/' + req.params.season + '/' + req.params.chapter + ' - [SUCCESS] [NOT SCRAPED]');
			res.status(200).json({ 'error' : false, 'title' : title.title });

		}
	});
}

// GET /title/byname/:name/:season/:chapter
var scrapChapterTitleByShowname = function(req, res) {
	Title.findOne({ show_name : req.params.name, season : req.params.season, chapter : req.params.chapter }, function (err, title){

		if (err) throw err;

		if (title === null) {

			utils.scrapTitleByShowName(req.params.name, req.params.season, req.params.chapter, function (error, result) {

				if (!error) {

					console.log('GET /title/byname/' + req.params.name + '/' + req.params.season + '/' + req.params.chapter + ' - [SUCCESS] [SCRAPED]');
					res.status(200).json({ 'error' : false, 'title' : result });

				} else {

					console.log('GET /title/byname/' + req.params.name + '/' + req.params.season + '/' + req.params.chapter + ' - [FAILED] [NOT SCRAPED]');
					res.status(404).json({ 'error' : true, 'error_id' : 11, 'message' : 'Title not Found'});
				}
			});

		} else {

			console.log('GET /title/byname/' + req.params.name + '/' + req.params.season + '/' + req.params.chapter + ' - [SUCCESS] [NOT SCRAPED]');
			res.status(200).json({ 'error' : false, 'title' : title.title });

		}
	});
}

router.get('/info/id/:id', getShowById);
router.get('/info/name/:name', getShowByName);

router.get('/title/id/:id/:season/:chapter', scrapChapterTitleById);
router.get('/title/name/:name/:season/:chapter', scrapChapterTitleByShowname);

module.exports = router;