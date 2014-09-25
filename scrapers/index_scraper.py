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

from HTMLParser import HTMLParser
import urllib2
from bs4 import BeautifulSoup
from pymongo import MongoClient
import time
import datetime
import os

directory_url = "http://subtitulos.es/series"
updating_str = "Updated: {:s}, previous: {:d}s, {:d}c. Current: {:d}s, {:d}c."
inserting_str = "Inserted: {:s}, {:d} seasons, {:d} chapters, {:s} absolute url, {:s} base url."
ignoring_str = "Ignored: {:s}, stored: {:d}s, {:d}c. Got {:d}s, {:d}c."

inserted = []
updated = []
ignored = []


class Show():
    site_url = "http://subtitulos.es"

    __season_count = -1
    __chapter_count = -1
    __name = ""
    __absolute_url = ""
    __base_url = ""
    __show_id = -1

    def __init__(self, name, url):
        self.__name = name
        self.__absolute_url = self.site_url + url
        self.__base_url = self.site_url + "/" + str(name).lower().replace(" ", "-") + "/"
        self.__show_id = int(str(url).split("/")[2])

    def add_seasons_and_chapters(self, season_count, chapter_count):
        self.__season_count = season_count
        self.__chapter_count = chapter_count

    def as_dictionary(self):
        return {"_id": self.__show_id, "name": self.__name, "seasons": self.__season_count,
                "chapters": self.__chapter_count, "show_url": self.__absolute_url, "base_url": self.__base_url}

    def get_name(self):
        return str(self.__name)

    def get_id(self):
        return {"_id": self.__show_id}

    def get_seasons_and_chapters_as_dictionary(self):
        return {"seasons": self.__season_count, "chapters": self.__chapter_count}

    def get_seasons_count(self):
        return self.__season_count

    def get_chapters_count(self):
        return self.__chapter_count

    def get_absolute_url(self):
        return self.__absolute_url

    def get_base_url(self):
        return self.__base_url

    def __str__(self):
        return "_id: {:d}, name: {:s}, seasons: {:d}, chapters: {:d}, show_url: {:s}, base_url: {:s}".format(
            self.__show_id,
            self.__name,
            self.__season_count,
            self.__chapter_count,
            self.__absolute_url,
            self.__base_url)


class SubtitulosEsCollector(HTMLParser):
    __shows = []

    __flag_name = False
    __count_data = 0
    __show_name = ""
    __show_url = ""

    def handle_starttag(self, tag, attrs):
        if tag in ["a"]:
            self.__show_url = attrs[0][1]  # URL del show
            self.__flag_name = True

    def handle_data(self, data):
        if self.__flag_name is True:
            self.__show_name = data
            self.__shows.append(Show(self.__show_name, self.__show_url))
            self.__flag_name = False
        else:
            if "," in data:
                raw = str(data).split(",")
                seasons = raw[0].split(" ")[0]
                chapters = raw[1].split(" ")[1]
                self.__shows[self.__count_data].add_seasons_and_chapters(season_count=int(seasons),
                                                                         chapter_count=int(chapters))
                self.__count_data += 1

    def get_result(self):
        return self.__shows

def ensure_logs_path():
    if not os.path.exists("./logs"):
        os.makedirs("logs")

def save_log(t_ini, t_fin):
    ensure_logs_path()
    file = open("./logs/index_scraper_" + datetime.datetime.fromtimestamp(t_ini).strftime('%Y-%m-%d-%H%M%S.log'), 'w')

    file.write("Started at " + str(datetime.datetime.fromtimestamp(t_ini).strftime('%Y-%m-%d %H:%M:%S')) + "\n\n")

    if not len(inserted) is 0:
        for i in inserted:
            file.write(i + "\n")
        file.write("\n")

    if not len(updated) is 0:
        for i in updated:
            file.write(i + "\n")
        file.write("\n")

    if not len(ignored) is 0:
        for i in ignored:
            file.write(i + "\n")
        file.write("\n")

    file.write("Ended at " + str(datetime.datetime.fromtimestamp(t_fin).strftime('%Y-%m-%d %H:%M:%S')))
    file.close()


def main():
    t_ini = time.time()
    print "Starting at", datetime.datetime.fromtimestamp(t_ini).strftime('%Y-%m-%d %H:%M:%S'), "\n"

    request = urllib2.Request(directory_url, headers={'User-agent': 'Mozilla/5.0'})
    raw_response = urllib2.urlopen(request).read()
    response = BeautifulSoup(raw_response).find('div', {'id': 'showindex'})

    shows_recollector = SubtitulosEsCollector()
    shows_recollector.feed(str(response))

    client = MongoClient()
    db = client.subtit_rest.show_index

    for show in shows_recollector.get_result():
        data_stored = db.find_one(show.get_id())
        if data_stored is None:
            inserted.append(inserting_str.format(show.get_name(), show.get_seasons_count(), show.get_chapters_count(),
                                       show.get_absolute_url(), show.get_base_url()))
            db.insert(show.as_dictionary())
        else:
            if data_stored["seasons"] is not show.get_seasons_count() or data_stored[
                "chapters"] is not show.get_chapters_count():

                updated.append(updating_str.format(show.get_name(), data_stored["seasons"], data_stored["chapters"],
                                          show.get_seasons_count(), show.get_chapters_count()))
                db.update(show.get_id(), {'$set': show.get_seasons_and_chapters_as_dictionary()})
            else:
                ignored.append(ignoring_str.format(show.get_name(), data_stored["seasons"], data_stored["chapters"],
                                          show.get_seasons_count(), show.get_chapters_count()))

    if not len(inserted) is 0:
        for i in inserted:
            print i
        print ""

    if not len(updated) is 0:
        for i in updated:
            print i
        print ""

    if not len(ignored) is 0:
        for i in ignored:
            print i
        print ""

    t_fin = time.time()
    print "Ended at", datetime.datetime.fromtimestamp(t_fin).strftime('%Y-%m-%d %H:%M:%S')
    print "\nSaving log..."
    save_log(t_ini, t_fin)
    print "Exiting..."

    exit(0)


if __name__ == '__main__':
    main()
