# Project of Advance Programming
## Purpose of the project
The project is focused on building from scratch a web application, using the newest, powerful and open source developing technologies such as NodeJS, Angular, Docker, Redis, proj4js, Visual Studio code as IDE and a modern browser like Google Chrome with its developer tool.

|Technology|Version|
|----------|-------|
|NodeJS|16.15.0|
|Angular|13.3.0|
|proj4|2.8.0|
|redis|4.1.0|
|express|4.18.1|


The functioning of the web application provides the possibility to convert a latitude / longitude pair, an array of pairs or a geoJSON specifying the source system and the destination system.
<br><br>
Different systems of conversion are loaded by an official `epsg` file where each system has its own representation recipe. <br><br>
The conversion its handled in the end by `proj4js` lib, so the web application could be defined asa wrapper towards the library.
<br><br>
Accessing the application for using a conversion its restricted to users defined in an assets file with an authentication based on bearer json web token, formely know as `JWT`. For completing a conversion request the user must have a credit. At the startup of the application each user has a default credit, on each request (also an incorrect request) the credit are decrement. An user that has finished the credit can't make request anymore, in that case the user is `unauthorized`. For adding a new credit to user is provided one method accessible only for Administrator user, the role is also defined in the assets file.

## Structure of the Web Application
In the back-end side the application is writtern in pure Javascript, known also as `Vanilla Javascript`. Its used also open source express framework for making in fact an a WebAPI.
<br><br>
For a better programming and a scalable code index file use a lot of modules exported from other js files. Included modules will in turn include other modules as needed. In particoular, project dir has different folders, analyzed in the below section.

## Assets
Contains assets file like:
1. List of users as JSON file: User is defined as follow:
    * username
    * email (primary key)
    * role
2. EPSG registry for handling different systems of rappresentation.

## Models
1. CoordinatesLatLon-Proxy
Implementation of `Proxy Pattern` for validation Latitude and Longitude inputs. The validation checks if the value provided is not null, undefined, empty string and its a number. If the validation fail, will be thrown an exception, (caught in the caller) about the detailed validation fail message. 
2. httpsStatusCode
Javascript style enumeration for the most common 30x, 4xx,5xx Http status code.
3. logLevel
Enumeration like previous, rappresenting different levels of log.

## Modules
### Current time
An helper module that provide functions about getting current time: <br>
1. `GetCurrentTime`: that return a date formatted as follow: DD/MM/YYYY HH:mm:SS:mss
2. `GetCurrentTimeLinuxEpoch`: that return date in linux epoch, so the number of seconds since January 1, 1970 at 00:00 Greenwich Mean Time.
### Error Factory
This module expose a class based on `Factory design pattern` that allows to handle different http status code to be created in a flexible and reusable way, using a generic interface. (Since in javascript interfaces does not exists, this is implemented using a class with extends keywords)

### Logger Singletone

As the name suggest, this module implement a logger class using a `Singletone pattern`. <br>
This pattern ensures that there is only one instance of the logger class. To achieve this, the class has a static function called `getInstance` that create a new instance if there its the first time that its called, otherwise will return the previous created instance.
<br>When its created the first and only instance, obviously will be called the constructor of the class and the logger will be initialized as below:<br>
 1. Name of the log are setted concatenating a prefix string (Node_) and current time in linux epoch.
 2. Requiring `fs` will be created if not exist in the parent folder of working dir a folder called 'Logs' (that is setted as parameter).
 3. The logger is ready 
<br> <br>
The logger class expose these methods:
* LOG_TRADE(...)
* LOG_DEBUG(...)
* LOG_INFO(...) -> wrap a console.log
* LOG_WARNING(...) -> wrap a console.warning
* LOG_ERROR(...) -> wrap a console.error
* LOG_FATAL(...) -> throw an exception stopping the program
That incapsulating the log process (act as wrapper), where the message is written using `appendFileSync` function.
<br>
The message appended at the end of file its format with:
    * Level of log
    * Current time stamp with milliseconds
    * Message

In the project the logger is injected almost in all modules and the message are formatted using the factory design pattern described below.

### Users Loader
This module takes care about loading the users from assets file. Use simply the following instrunction:
```` javascript
JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
````
Where after loading with `readFileSync` with UTF-8 encoding will try to parse the JSON. If everything does not throw up any exception after that will be check if records has a duplicate Email value. This is important becouse redis will use this data and can't permit duplicate primary key.
The duplicate check is being made by double sort (using quick sort) where the second sort in the comparing function compare previous with current element.
After that users loaded are exported using `module.exports`.