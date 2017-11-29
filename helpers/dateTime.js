// Config
var defaultTz = config.tz.defaultTz;

exports.utcNow = function(req, res){
    return moment().utc();
};

exports.now = function(req, res){
    return moment().format();
}

exports.convertToUtc = function (req, res, dateTime){
    if (dateTime){
        return moment(dateTime).utc().format();
    }else{
        return false;
    }
}

exports.daemonTimeToISOString = function (req, res, daemonTime, timezoneId){
    if (daemonTime || daemonTime == '0'){
        daemonTime = parseInt(daemonTime);
        var hour = parseInt(daemonTime / 60);
        var min = parseInt(daemonTime % 60);
        var formattedTime = moment({hour : hour, minute : min }).toISOString();
        if (timezoneId) formattedTime = moment(moment({hour : hour, minute : min }).format('YYYY-MM-DDTHH:mm:ss') + moment().tz(timezoneId).format('Z')).toISOString();
        return formattedTime;
    }else{
        return false;
    }
}

exports.parseDateTimeToGlobalTimezoneArray = function(req, res, dateTime){
    var timezoneOffsets = [];
    timezoneOffsets.push('-0600');
    timezoneOffsets.push('-0500');
    timezoneOffsets.push('-0430');
    timezoneOffsets.push('-0330');
    timezoneOffsets.push('-0300');
    timezoneOffsets.push('-0200');
    timezoneOffsets.push('-0100');
    timezoneOffsets.push('+0000');
    timezoneOffsets.push('+0200');
    timezoneOffsets.push('+0300');
    timezoneOffsets.push('+0330');
    timezoneOffsets.push('+0400');
    timezoneOffsets.push('+0430');
    timezoneOffsets.push('+0500');
    timezoneOffsets.push('+0530');
    timezoneOffsets.push('+0545');
    timezoneOffsets.push('+0600');
    timezoneOffsets.push('+0700');
    timezoneOffsets.push('+0800');
    timezoneOffsets.push('+0845');
    timezoneOffsets.push('+0900');
    timezoneOffsets.push('+0930');
    timezoneOffsets.push('+1000');
    timezoneOffsets.push('+1030');
    timezoneOffsets.push('+1100');
    timezoneOffsets.push('+1130');
    timezoneOffsets.push('+1200');
    timezoneOffsets.push('+1245');
    timezoneOffsets.push('+1300');
    timezoneOffsets.push('+1400');

    var parsedGlobalDateTimes = null;
    if (moment(dateTime).isValid()){
        parsedGlobalDateTimes = [];
        _.each(timezoneOffsets, function(offset){
            var parsedDateTime = moment(moment(dateTime).format('YYYY-MM-DDTHH:mm:ss' + offset)).toISOString();
            parsedGlobalDateTimes.push(parsedDateTime);
        });
    }

    return parsedGlobalDateTimes;
}

exports.roundTo = function(req, res, dateTime, roundTo){
    if (roundTo > 60){
        return null;
    }else{
        var start = moment(dateTime);
        var remainder = (roundTo - start.minute()) % roundTo;
        return moment(start).add(remainder, "minutes");
    }
}

exports.toLocalISOString = function(req, res, dateTimeString, timezoneId){
    var isoString = null;
    if (!timezoneId) timezoneId = defaultTz;

    if (dateTimeString){
        // convert date time string to local timing
        var convertedDateTimeString = moment(dateTimeString).tz(timezoneId).format('YYYY-MM-DDTHH:mm:ss');
        isoString = moment(convertedDateTimeString + moment().tz(timezoneId).format('Z')).toISOString();
    }
    return isoString;
}

exports.toLocal12amISOString = function (req, res, dateTimeString, dateString, timezoneId){
    var isoString = null;
    if (!timezoneId) timezoneId = defaultTz;

    if (dateTimeString || dateString){
        if (dateString){
            isoString = moment(dateString + 'T00:00:00' + moment().tz(timezoneId).format('Z')).toISOString();
        }else if (dateTimeString){
            // convert date time string to 12am
            var convertedDateTimeString = moment(dateTimeString).tz(timezoneId).format('YYYY-MM-DDT00:00:00');
            isoString = moment(convertedDateTimeString + moment().tz(timezoneId).format('Z')).toISOString();
        }
    }else{
        var convertedDateTimeString = moment().format('YYYY-MM-DDT00:00:00')
        if (!timezoneId){
            isoString = moment(convertedDateTimeString).toISOString();
        }else{
            isoString = moment(convertedDateTimeString + moment().tz(timezoneId).format('Z')).toISOString();
        }

    }
    return isoString;
}

exports.toLocal2359pmISOString = function (req, res, dateTimeString, dateString, timezoneId){
    var isoString = null;
    if (!timezoneId) timezoneId = defaultTz;

    if (dateTimeString || dateString){
        if (dateString){
            isoString = moment(dateString + 'T23:59:59' + moment().tz(timezoneId).format('Z')).toISOString();
        }else if (dateTimeString){
            // convert date time string to 12am
            var convertedDateTimeString = moment(dateTimeString).tz(timezoneId).format('YYYY-MM-DDT23:59:59');
            isoString = moment(convertedDateTimeString + moment().tz(timezoneId).format('Z')).toISOString();
        }
    }else{
        var convertedDateTimeString = moment().format('YYYY-MM-DDT23:59:59')
        if (!timezoneId){
            isoString = moment(convertedDateTimeString).toISOString();
        }else{
            isoString = moment(convertedDateTimeString + moment().tz(timezoneId).format('Z')).toISOString();
        }

    }
    return isoString;
}
