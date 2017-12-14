// Generic get method for asset
// Authorized - Admin, System Admin
var getAsset = exports.getAsset = function(req, res, override, callback, apiOptions) {
    var totalSizeCount = false
        , pageSize = null
        , skipSize = null
        , queryParms = {}
        , sort = {}
        , options = {}
        , assetFields = {};

    //key parameters
    if(req.query.Title) queryParms.title = req.query.Title;
    if(req.query.Preview) queryParms.preview = req.query.Preview;
    if(req.query.MetaTags) queryParms.meta_tags = req.query.MetaTags;
    if(req.query.Link) queryParms.link = req.query.Link;
    if(req.query.PointOfContact) queryParms.point_of_contact = req.query.PointOfContact;
    if(req.query.AssetGrade) queryParms.asset_grade = req.query.AssetGrade;
    if(req.query.Country) queryParms.country = req.query.Country;
    if(req.query.Nominated) queryParms.nominated = req.query.Nominated;
    if(req.query.BusinessUnit) queryParms.business_unit = req.query.BusinessUnit;
    if(req.query.AssetCreateDate) queryParms.assset_create_date = req.query.AssetCreateDate;
    if(req.query.Cover) queryParms.cover = req.query.Cover;
    if(req.query.Published || req.query.Published === false) queryParms.published = req.query.Published;
    if(req.query.PublishDate) queryParms.publish_date = req.query.PublishDate;
    if(req.query.Secured || req.query.Secured === false) queryParms.secured = req.query.Secured;
    if(req.query.Likes) queryParms.likes = req.query.Likes;
    if(req.query.Bookmarks) queryParms.bookmarks = req.query.Bookmarks;
    if(req.query.ExtId) queryParms.ext_id = req.query.ExtId;
    if(req.query.ExtIdentifier) queryParms.ext_identifier = req.query.ExtIdentifier;
    if(req.query.ExtSiteName) queryParms.ext_site_name = req.query.ExtSiteName;
    if(req.query.ExtSiteUrl) queryParms.ext_site_url = req.query.ExtSiteUrl;
    if(req.query.ExtSource) queryParms.ext_source = req.query.ExtSource;
    if(req.query.ExtPoc) queryParms.ext_poc = req.query.ExtPoc;
    if(req.query.ExtLicense) queryParms.ext_license = req.query.ExtLicense;
    if(req.query.ExtFile) queryParms.ext_file = req.query.ExtFile;
    if(req.query.ExtDictionary) queryParms.ext_dictionary = req.query.ExtDictionary;
    if(req.query.ExtFileType) queryParms.ext_file_type = req.query.ExtFileType;

    //paging parameters
    if (req.query.TotalSizeCount) totalSizeCount = req.query.TotalSizeCount;
    if (req.query.PageSize && !isNaN(req.query.PageSize)) pageSize = parseInt(req.query.PageSize);
    if (req.query.PageSize && !isNaN(req.query.SkipSize)) skipSize = parseInt(req.query.SkipSize);

    //additional options
    if(apiOptions)  options = apiOptions;

    //sort options
    if(options.sort)  sort = options.sort;

    //fields selection options
    assetFields.__v = 0;

    //default hidden hash fields

    if(options.assetFields) assetFields = options.assetFields;

    //prior to the query params, users extend parameters
    if(options.queryParms)  _.extend(queryParms, options.queryParms);

    //count the total number of rows
    mongodb.model('asset')
        .find(queryParms)
        .select(assetFields)
        .skip(skipSize)
        .limit(pageSize)
        .sort(sort)
        .exec(function(err, data){
            if (totalSizeCount){
                mongodb.model('asset').find(queryParms).count().exec(function(err, count){
                    apiHelper.getRes(req, res, err, data, count,callback);
                })
            }else{
                apiHelper.getRes(req, res, err, data, null, callback);
            }
        });
};

// Generic update method for asset
// Authorized - Admin, System Admin
var updateAsset = exports.updateAsset = function(req, res, override, callback){
    if(req.body.AssetId) {
        //Querying & edit Object
        var queryParms = {}
            , updateParms = {};
        if(req.body.AssetId)  queryParms._id = req.body.AssetId;

        //default values

        //parameter values
        if(req.body.Title) updateParms.title = req.body.Title;
        if(req.body.Preview) updateParms.preview = req.body.Preview;
        if(req.body.MetaTags) updateParms.meta_tags = req.body.MetaTags;
        if(req.body.Link) updateParms.link = req.body.Link;
        if(req.body.PointOfContact) updateParms.point_of_contact = req.body.PointOfContact;
        if(req.body.AssetGrade) updateParms.asset_grade = req.body.AssetGrade;
        if(req.body.Country) updateParms.country = req.body.Country;
        if(req.body.Nominated) updateParms.nominated = req.body.Nominated;
        if(req.body.BusinessUnit) updateParms.business_unit = req.body.BusinessUnit;
        if(req.body.AssetCreateDate) updateParms.assset_create_date = req.body.AssetCreateDate;
        if(req.body.Cover) updateParms.cover = req.body.Cover;
        if(req.body.Published || req.body.Published === false) updateParms.published = req.body.Published;
        if(req.body.PublishDate) updateParms.publish_date = req.body.PublishDate;
        if(req.body.Secured || req.body.Secured === false) updateParms.secured = req.body.Secured;
        if(req.body.Likes) updateParms.likes = req.body.Likes;
        if(req.body.Bookmarks) updateParms.bookmarks = req.body.Bookmarks;
        if(req.body.ExtId) updateParms.ext_id = req.body.ExtId;
        if(req.body.ExtGraphEmbed) updateParms.ext_graph_embed = req.body.ExtGraphEmbed;
        if(req.body.ExtUpdateFrequency) updateParms.ext_update_frequency = req.body.ExtUpdateFrequency;
        if(req.body.ExtCoverage) updateParms.ext_coverage = req.body.ExtCoverage;
        if(req.body.ExtLastUpdate) updateParms.ext_last_update = req.body.ExtLastUpdate;
        if(req.body.ExtPoc) updateParms.ext_poc = req.body.ExtPoc;
        if(req.body.ExtSource) updateParms.ext_source = req.body.ExtSource;
        if(req.body.ExtSourceUrl) updateParms.ext_source_url = req.body.ExtSourceUrl;
        if(req.body.ExtLicense) updateParms.ext_license = req.body.ExtLicense;
        if(req.body.ExtIdentifier) updateParms.ext_identifier = req.body.ExtIdentifier;
        if(req.body.ExtSiteName) updateParms.ext_site_name = req.body.ExtSiteName;
        if(req.body.ExtSiteUrl) updateParms.ext_site_url = req.body.ExtSiteUrl;
        if(req.body.ExtDictionary) updateParms.ext_dictionary = req.body.ExtDictionary;
        if(req.body.ExtFile) updateParms.ext_file = req.body.ExtFile;
        if(req.body.ExtFileType) updateParms.ext_file_type = req.body.ExtFileType;


        mongodb.model('asset').update(
            queryParms
            , updateParms
            , { multi : true }
            , function(err, data){
                var numberAffected = null;
                if (data) numberAffected = data.nModified;
                apiHelper.updateRes(req, res, err, data, numberAffected, callback);
            });

    } else {
        apiHelper.apiResponse(req, res, true, 500, "Not found", null, null, null, callback);
    }
};

// Generic add method for asset
// Authorized - Admin, System Admin
var addAsset = exports.addAsset = function(req, res, override, callback){
        var addParms = {}
            , assetModel = mongodb.model('asset');

        //default values
        addParms.asset_create_date = dateTimeHelper.utcNow();

        //parameter values
        if(req.body.Title) addParms.title = req.body.Title;
        if(req.body.Preview) addParms.preview = req.body.Preview;
        if(req.body.Description) addParms.description = req.body.Description;
        if(req.body.MetaTags) addParms.meta_tags = req.body.MetaTags;
        if(req.body.Link) addParms.link = req.body.Link;
        if(req.body.PointOfContact) addParms.point_of_contact = req.body.PointOfContact;
        if(req.body.AssetGrade) addParms.asset_grade = req.body.AssetGrade;
        if(req.body.AssetCreateDate) addParms.assset_create_date = req.body.AssetCreateDate;
        if(req.body.Country) addParms.country = req.body.Country;
        if(req.body.Nominated) addParms.nominated = req.body.Nominated;
        if(req.body.BusinessUnit) addParms.business_unit = req.body.BusinessUnit;
        if(req.body.Cover) addParms.cover = req.body.Cover;
        if(req.body.Published || req.body.Published === false) addParms.published = req.body.Published;
        if(req.body.PublishDate) addParms.publish_date = req.body.PublishDate;
        if(req.body.Secured || req.body.Secured === false) addParms.secured = req.body.Secured;
        if(req.body.Likes) addParms.likes = req.body.Likes;
        if(req.body.Bookmarks) addParms.bookmarks = req.body.Bookmarks;
        if(req.body.ExtId) addParms.ext_id = req.body.ExtId;
        if(req.body.ExtGraphEmbed) addParms.ext_graph_embed = req.body.ExtGraphEmbed;
        if(req.body.ExtUpdateFrequency) addParms.ext_update_frequency = req.body.ExtUpdateFrequency;
        if(req.body.ExtCoverage) addParms.ext_coverage = req.body.ExtCoverage;
        if(req.body.ExtLastUpdate) addParms.ext_last_update = req.body.ExtLastUpdate;
        if(req.body.ExtPoc) addParms.ext_poc = req.body.ExtPoc;
        if(req.body.ExtSource) addParms.ext_source = req.body.ExtSource;
        if(req.body.ExtSourceUrl) addParms.ext_source_url = req.body.ExtSourceUrl;
        if(req.body.ExtLicense) addParms.ext_license = req.body.ExtLicense;
        if(req.body.ExtIdentifier) addParms.ext_identifier = req.body.ExtIdentifier;
        if(req.body.ExtSiteName) addParms.ext_site_name = req.body.ExtSiteName;
        if(req.body.ExtSiteUrl) addParms.ext_site_url = req.body.ExtSiteUrl;
        if(req.body.ExtDictionary) addParms.ext_dictionary = req.body.ExtDictionary;
        if(req.body.ExtFile) addParms.ext_file = req.body.ExtFile;
        if(req.body.ExtFileType) addParms.ext_file_type = req.body.ExtFileType;

        var newAsset = new assetModel(addParms);
            newAsset.save(function(err, data){
                apiHelper.addRes(req, res, err, data, callback);
            });
};

// Generic delete method for asset
// Authorized - Admin, System Admin
var deleteAsset = exports.deleteAsset = function(req,res, override, callback){
        if(req.body.AssetId) {

            var queryParms = {};
            if(req.body.AssetId) queryParms._id = req.body.AssetId;

            mongodb.model('asset').remove(queryParms).exec(function(err, numberRemoved){
                apiHelper.deleteRes(req, res, err, numberRemoved, callback);
            });

        } else{
            apiHelper.apiResponse(req, res, true, 500, "Not found", null, null, null, callback);
        }
};