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

var express = require('express');
var router = express.Router();

/**
 * Basic router for views and forms
 */

/* GET home page. */
router.get('/', function(req, res) {
  res.render('metapage.html', { title: 'ejs' });
});

router.get('/admin', function(req, res) {
  res.render('admin.html', { title: 'ejs' });
});

router.get('/login', function(req, res) {
  res.render('login.html', { title: 'ejs' });
});

router.get('/#', function(request, response) {
  response.render('views/' );
});

router.get('/views/:name', function(request, response) {
  var name = request.params.name;
  console.log('returning views/'+name);
  response.render('/public/views/' + name);
});

router.get('*', function(req, res) {
  console.log('protocol is '+req.originalUrl);
  res.redirect('/');
});


module.exports = router;