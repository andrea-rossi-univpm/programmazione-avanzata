module.exports = {
    _getCurrentTime: function() {
        const _date = new Date(Date.now());
        /* const day = _date.getDate();
        const month = _date.getMonth() + 1;
        const year = _date.getFullYear();
        const hours = _date.getHours();
        const minutes = _date.getMinutes();
        const seconds = _date.getSeconds(); */
        const milliseconds =   ('00' + _date.getMilliseconds()).slice(-3);

        const date = _date.toLocaleDateString("en-GB", { // you can use undefined as first argument
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        
        //format in DD/MM/YYYY HH:mm:SS:mss
        //return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
        return `${date}.${milliseconds}`;
    },
    _getCurrentTimeLinuxEpoch: function() {
        return `${Date.now()}`;
    },
};

//slice() method extracts a section of a string and returns it as a new string, without modifying the original string.