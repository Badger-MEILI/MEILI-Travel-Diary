/*
 MEILI Travel Diary - web interface that allows to annotate GPS trajectories
 fused with accelerometer readings into travel diaries

 Copyright (C) 2014-2016 Adrian C. Prelipcean - http://adrianprelipcean.github.io/
 Copyright (C) 2016 Badger AB - https://github.com/Badger-MEILI

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var pg = require('pg');
var path = require('path');

var host = process.env.MEILI_HOST || 'localhost';
var port = process.env.MEILI_PORT || '5432';
var dbName = process.env.MEILI_DB_NAME || 'SPOT_Gothenburg';
var userName = 'postgres';
var password = 'postgres';

var connectionString =  process.env.MEILI_CONNECTION_STRING || 'postgres://'+userName+':'+password+'@'+host+':'+port+'/'+dbName;

// reveal connection string to other components
module.exports = connectionString;

//try connection string
var client = new pg.Client(connectionString);
client.connect();
client.end();