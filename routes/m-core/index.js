var apiHelper = _require('/helpers/api');

module.exports = function(req, res) {
    var base = req.params.base;
    var method = req.params.api;

    if (base){
        var basePage = null;
        try {
            basePage = require('./' + base);
        }catch (e) {
            console.log(e);
        }

        if(basePage) {
            if (method){
                if (typeof basePage[method] == 'function'){
                    basePage[method](req, res);
                }else{
                    apiHelper.apiResponse(req, res, true, 500, "Not found", null, null, null);
                }
            }else{
                apiHelper.apiResponse(req, res, true, 500, "Not found", null, null, null);
            }
        }else{
            apiHelper.apiResponse(req, res, true, 500, "Not found", null, null, null);
        }
    }


}