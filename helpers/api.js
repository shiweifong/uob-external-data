exports.countRes = function(req, res, err, count, callback){
    if (callback){
        callback(err, count);
    }else{
        if (err){
            res.json({
                TotalRows : null,
                Error : true,
                ErrorDesc : err,
                ErrorCode: 500
            });
        }else{
            res.json({
                TotalRows : count,
                Error : false,
                ErrorDesc : null,
                ErrorCode: null
            });
        }
    }
}

exports.apiRes = function(req, res, totalRows, rowsReturned, data, errorDesc, errorCode, callback){
    var error = false;
    if (!totalRows) totalRows = rowsReturned;
    if (errorDesc) error = true;
    if (callback){
        var result = {};
        result.TotalRows = totalRows;
        result.RowsReturned = rowsReturned;
        result.Data = data;
        result.Error = error;
        result.ErrorDesc = errorDesc;
        result.ErrorCode = errorCode;
        callback(result);
    }else{
        res.json({
            TotalRows : totalRows,
            RowsReturned : rowsReturned,
            Data : data,
            Error : error,
            ErrorDesc : errorDesc,
            ErrorCode: errorCode
        });
    }
}

exports.updateRes = function (req, res, err, data, numberAffected, callback){
    if(callback){
        callback(err, data, numberAffected);
    }else {
        if (err){
            res.json({
                RowsReturned : null,
                Data : null,
                Error : true,
                ErrorDesc : err,
                ErrorCode: 500
            });
        }else{
            res.json({
                RowsReturned : null,
                Data : data,
                Error : false,
                ErrorDesc : null,
                ErrorCode: null
            });
        }
    }
}

exports.getRes = function (req, res, err, data, count, callback){
    var dataLength = 0;
    if (data) {
        if (_.isArray(data)){
            dataLength = data.length;
        }else{
            dataLength = 1;
        }
    };
    if (count){
        if(callback){
            callback(err, data, dataLength, count);
        }else {
            if (err){
                res.status(500).json({
                    TotalRows : null
                    , RowsReturned : dataLength
                    , Data : data
                    , Error : true
                    , ErrorDesc : err
                    , ErrorCode: 500
                });
            }else{
                res.json({
                    TotalRows : count
                    , RowsReturned : dataLength
                    , Data : data
                    , Error : false
                    , ErrorDesc : null
                    , ErrorCode: null
                });
            }
        }
    }else{
        if(callback){
            callback(err, data, dataLength, count);
        }else {
            if (err){
                res.status(500).json({
                    TotalRows : null
                    , RowsReturned : dataLength
                    , Data : data
                    , Error : true
                    , ErrorDesc : err
                    , ErrorCode: 500
                });
            }else{
                res.json({
                    TotalRows : dataLength
                    , RowsReturned : dataLength
                    , Data : data
                    , Error : false
                    , ErrorDesc : null
                    , ErrorCode: null
                });
            }
        }
    }

}
exports.addRes = function (req, res, err, data, callback){
    var dataLength = 0;
    if (data) {
        if (_.isArray(data)){
            dataLength = data.length;
        }else{
            dataLength = 1;
        }
    };
    if(callback){
           callback(err, data, dataLength);
    }else {
        if (err){
            res.status(500).json({
                RowsReturned : dataLength,
                Data : data,
                Error : true,
                ErrorDesc : err,
                ErrorCode: 500
            });
        }else{
            res.json({
                RowsReturned : dataLength,
                Data : data,
                Error : false,
                ErrorDesc : null,
                ErrorCode: null
            });
        }
    }
}

exports.deleteRes = function (req, res, err, numberRemoved, callback){
    if(callback){
        callback(err, numberRemoved);
    }else {
        if (err) {
            res.status(500).json({
                RowsReturned: null,
                Data: null,
                Error: true,
                ErrorDesc: err,
                ErrorCode: 500
            });
        } else {
            res.json({
                RowsReturned: numberRemoved,
                Data: true,
                Error: false,
                ErrorDesc: null,
                ErrorCode: null
            });
        }
    }
}

exports.apiResponse = function(req, res, err, errCode, errDesc, dbCount, data, numberAffected, callback){
    var dataLength = null;
    if (data) {
        if (_.isArray(data)){
            dataLength = data.length;
        }else{
            dataLength = 1;
        }
    };
    
    if (!err) err = false; // fix to return no error instead of returning null error.

    if(callback){
            callback(err, errCode, errDesc, data, dataLength, dbCount, numberAffected);
    }else {
        if (err){
            res.status(500).json({
                TotalRows : dbCount
                , RowsReturned : dataLength
                , NumAffected : numberAffected
                , Data : data
                , Error : err
                , ErrorDesc : errDesc
                , ErrorCode: errCode
            });
        }else{
            res.json({
                TotalRows : dbCount
                , RowsReturned : dataLength
                , NumAffected : numberAffected
                , Data : data
                , Error : err
                , ErrorDesc : null
                , ErrorCode: null
            });
        }
    }
}
