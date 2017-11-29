var Schema = mongoose.Schema;

assetSchema = new Schema({
    title : {type: String, default : null}
    , preview :  {type: String, default : null}
    , description :  {type: String, default : null}
    , meta_tags : {type: String, default : null}
    , link :  {type: String, default : null}
    , point_of_contact :  {type: String, default : null}
    , asset_grade :  {type: String, default : null}
    , country :  {type: String, default : null}
    , nominated :  {type: String, default : null}
    , business_unit :  {type: String, default : null}
    , asset_create_date :  {type: Date, default : null}
    , cover : {type: String, default : null}
    , published : {type: Boolean, default : null}
    , publish_date : {type: Date, default : null}
    , secured : {type: Boolean, default : null}
    , likes : {type: String, default : null}
    , bookmarks : {type: String, default : null}
});

mongoose.model('asset', assetSchema, 'asset');