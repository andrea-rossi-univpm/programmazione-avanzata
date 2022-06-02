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
### Logger Singleton
As the name suggest, this module implement a logger class using a `Singletone pattern`. <br>
This pattern ensures that there is only one instance of the logger class. To achieve this, the class has a static function called `getInstance` that create a new instance if there its the first time that its called, otherwise will return the previous created instance.