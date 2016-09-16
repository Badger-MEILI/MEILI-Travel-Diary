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

First, set up your database (see the **MEILI Database** docs).

Then go to the root folder of MEILI Travel Diary and start the Express app
```sh
$ cd /path/to/folder
$ npm start
```

Alternatively, you can setup your scripts and build operations in your IDE of choice.

### Development

Want to contribute? Great! See the Todos list for needed improvements. Also, you can contact me on github or my email address for further details. 
 
### Todos

 - Write unit tests
 - Figure out a smart way to do the localization 
 - AngularJS is used in a very hacky way, that should change  
 - Secure the password field when communicating to the MEILI Database 
 - Responsive design
 - Remove / improve the in-memory storage of the trips that are being annotated to maintain consistency with the remote database
 - Look into licensing of images and clipart 

Need help setting up MEILI in production
----
For any inquiries regarding setting up MEILI in production, you can contact the team leader for the MEILI system project (see http://adrianprelipcean.github.io/)

License
----

MEILI Travel Diary - web interface that allows to annotate GPS trajectories
 fused with accelerometer readings into travel diaries

Copyright &copy; 2014-2016 Adrian C. Prelipcean - http://adrianprelipcean.github.io/ 
Copyright &copy: 2016 Badger AB - https://github.com/Badger-MEILI

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
