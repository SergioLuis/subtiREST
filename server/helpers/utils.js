// FILE: /helpers/utils.js

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
 
var zerorpc		= require('zerorpc'),
	mongoose	= require('mongoose'),
	Show 		= require('../models/show'),
	Title 		= require('../models/title');

var zeroClient 	= new zerorpc.Client();
zeroClient.connect('tcp://127.0.0.1:4242');

function scrapTitleById(showId, season, chapter, callback){
	zeroClient.invoke("scrap_title_by_id", showId, season, chapter, function(err, res, more) {
		if (err) { throw err; }
		// ERROR - RESPUESTA
		callback(res[0], res[1]);
	});
}

function scrapTitleByShowName(showName, season, chapter, callback){
	zeroClient.invoke("scrap_title_by_showname", showName, season, chapter, function(err, res, more) {
		if (err) { throw err; }
		// ERROR - RESPUESTA
		callback(res[0], res[1]);
	});
}

exports.scrapTitleById = scrapTitleById;
exports.scrapTitleByShowName = scrapTitleByShowName;
