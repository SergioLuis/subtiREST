# Copyright 2014 Sergio Luis Para
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

__author__ = 'Sergio Luis Para'

import zerorpc
from pymongo import MongoClient
from HTMLParser import HTMLParser
import urllib2
from bs4 import BeautifulSoup
import logging
import json
from pprint import pprint


class StupidParser(HTMLParser):
    title = ""

    def handle_data(self, data):
        self.title = data


class TitleScraper(object):
    def __init__(self, mongodb_host):
        self.db = MongoClient(mongodb_host).subtit_rest
        self.shows_db = self.db.show_index
        self.titles_db = self.db.title_index

    def scrap_title(self, show, season, chapter):
        if show is None:
            return True, "ERROR - no such show_id"
        url = show["base_url"] + str(season) + "x" + "{:0>2s}".format(str(chapter))
        try:
            request = urllib2.Request(url, headers={'User-agent': 'Mozilla/5.0'})
            raw_response = urllib2.urlopen(request).read()

        except urllib2.HTTPError:
            return True, "ERROR - no such chapter"

        response = BeautifulSoup(raw_response).find('h1', {'id': 'cabecera-subtitulo'})

        parser = StupidParser()
        parser.feed(str(response))

        title = str(parser.title)[parser.title.index("-") + 2:]
        self.titles_db.insert(
            {'show_id': show["_id"], 'show_name': show["name"], 'season': int(season), 'chapter': int(chapter),
             'title': title})

        return False, title

    def scrap_title_by_id(self, show_id, season, chapter):
        return self.scrap_title(self.shows_db.find_one({'_id': int(show_id)}), season, chapter)

    def scrap_title_by_showname(self, show_name, season, chapter):
        return self.scrap_title(self.shows_db.find_one({'name': str(show_name)}), season, chapter)


logging.basicConfig()

json_data = open('scrapers.config')
data = json.load(json_data)
pprint(data)
json_data.close()

# s = zerorpc.Server(TitleScraper(data["mongodb_host"]))
s = zerorpc.Server(TitleScraper("mongodb://127.0.0.1:27017"))
# s.bind(data["zerorpc_bind"])
s.bind("tcp://127.0.0.1:4242")
s.run()