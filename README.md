# MEILI Travel Diary

The MEILI Travel Diary is the web application module for the MEILI System, which allows users to attach travel diary semantics to their data collected via the **MEILI Mobility Collector**. The MEILI Travel Diary has the following functionality:
- Allows users to annotate their trajectories into trips and triplegs by specifying:
    - For trips:
        - trip start
        - trip end
        - trip destination
        - trip purpose
    - For triplegs: 
        - tripleg start
        - tripleg end 
        - tripleg transfer point
        - travel mode
- Basic CRUD operations 
- Provides an API for interacting with the **MEILI Database**

### Version
1.0.0

### Tech

The MEILI Database is built on top of NodeJS and ExpressJS and uses multiple third party libraries.

### Installation

Decide on the geographical region where you want to run MEILI and initialize the system with the following script.

```
$ cd /path/to/folder
$ npm run init_meili_with_zone -- --namedb=target_db --username=target_user --hostdb=target_host --min_lat=region_min_lat --min_lon=region_min_lon --max_lat=region_max_lat --max_lon=region_max_lon
```

#### Parameters

| Parameter        | Role           |
| ------------- |-------------|
| `--` namedb      | The name of the Postgres database you will use with MEILI |
| `--` username      | The Postgres username that will perform the operations on the database      |
| `--` hostdb | The host of the Postgres database      |
| `--` min_lat | The **minimum latitude** of the geographical region of interest (latitude of the lower left corner)     |
| `--` min_lon | The **minimum longitude** of the geographical region of interest (longitude of the lower left corner)      |
| `--` max_lat | The **maximum latitude** of the geographical region of interest (latitude of the upper right corner)      |
| `--` max_lon | The **maximum longitude** of the geographical region of interest (longitude of the upper right corner)      |

### Start up MEILI web app

If you already performed the previous step and want to start the web app, run:

```
$ cd /path/to/folder
$ npm start
```

Alternatively, you can setup your scripts and build operations in your IDE of choice.

### Test
#### Client integration tests
Mocha test run with Phanthomjs

1. Make sure database is running with test data, preferably run the docker container
2. Start the development server
3. `npm run test-client` 

for running tests without console logging run `SILENT=true npm run test-client`

### Development

Want to contribute? Great! See the Todos list for needed improvements. Also, you can contact me on github or my email address for further details. 
 
### Todos

 - Improve test coverage
 - Figure out a smart way to do the localization  
 - Secure the password field when communicating to the MEILI Database 
 - Responsive design 
 - License images and clipart 

## Building the API docs 

```sh
$ npm install apidoc -g
$ cd MEILI-Travel-Diary/
$ apidoc -i routes/apiv2/ -o apiDocs/
```


Need help setting up MEILI in production?
----
For any inquiries regarding setting up MEILI in production, you can contact the team leader for the MEILI system project (see http://adrianprelipcean.github.io/)

License
----

MEILI Travel Diary - web interface that allows to annotate GPS trajectories
 fused with accelerometer readings into travel diaries

Copyright &copy; 2014-2017 Adrian C. Prelipcean - http://adrianprelipcean.github.io/ 
Copyright &copy: 2016-2017 Badger AB - https://github.com/Badger-MEILI

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
