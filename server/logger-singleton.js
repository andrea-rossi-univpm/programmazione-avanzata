let instance = null

var fs = require('fs');

class SingletonClass {

    constructor() {
     this.value = Math.random(100);
     fs.writeFile('newfile.txt', 'Learn Node FS module', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }

    printValue() {
     console.log(this.value)
    }

    static getInstance() {
     if(!instance) {
         instance = new SingletonClass()
     }

     return instance
    }
}

module.exports = SingletonClass