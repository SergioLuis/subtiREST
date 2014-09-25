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

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var show = new Schema({
	_id:		{ type : Number },
	name:		{ type : String },
	seasons:	{ type : Number },
	chapters:	{ type : Number },
	show_url:	{ type : String },
	base_url:	{ type : String }
},
	{ collection : 'show_index' });

module.exports = mongoose.model('Show', show);
