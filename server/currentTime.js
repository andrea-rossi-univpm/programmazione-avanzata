const getCurrentTime = () => {
    const _date = new Date(Date.now());
    const day = _date.getDate();
    const month = _date.getMonth() + 1;
    const year = _date.getFullYear();
    const hours = _date.getHours();
    const minutes = _date.getMinutes();
    const seconds = _date.getSeconds();
    const milliseconds = _date.getMilliseconds();
    
    //format in DD/MM/YYYY HH:mm:SS:mss
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

exports.getCurrentTime = getCurrentTime();