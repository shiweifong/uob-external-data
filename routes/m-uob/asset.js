// Generic get method for asset
// Authorized - Admin, System Admin
var scrapeDataGov = exports.scrapeDataGov = function(req, res, override, callback, apiOptions) {

    // The URL we will scrape from - in our example Anchorman 2.

    var url = "https://data.gov.sg/search";

    var classifications = [
        "finance"
        // , "economy"
        // , "education"
        // , "environment"
        // , "health"
        // , "infrastructure"
        // , "society"
        // , "technology"
        // , "transport"
    ]

    var data;
    var resultsPerPage = 20;
    var results = {};

    // Steps to acheive the final scraped JSON
    async.waterfall([
            function(getScrapingIndex){
                res.json('Scrapping Started');
                console.log('STAGE 1 - Getting scraping directions');

                async.eachSeries(classifications, function(classification, crawlByClassification){

                        var urlString = url + "?groups=" + classification;
                        results[classification] = {};
                        results[classification].classification = classification;
                        results[classification].urlString = urlString;

                        async.waterfall([
                                function(loadFromWeb){
                                    request(urlString, function(error, response, html){
                                        // First we'll check to make sure no errors occurred when making the request
                                        if(!error){
                                            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
                                            $ = cheerio.load(html);
                                            loadFromWeb();
                                        }else{
                                            loadFromWeb("Unable to load web");
                                        }
                                    })
                                }
                                , function(getResults){
                                    $('.search-results-header h2').filter(function(){
                                        var data = $(this);
                                        results[classification].dataCount = data.html().toString();
                                        results[classification].dataCount = results[classification].dataCount.replace(/(?:\r\n|\r|\n)/g, '');
                                        results[classification].dataCount = results[classification].dataCount.trim();
                                        results[classification].dataCount = results[classification].dataCount.substring(0, results[classification].dataCount.indexOf('dataset'));
                                        results[classification].dataCount = results[classification].dataCount.trim();
                                        results[classification].dataCount = parseInt(results[classification].dataCount);
                                        results[classification].noOfPages = Math.ceil(results[classification].dataCount / resultsPerPage);
                                        results[classification].pages = [];
                                        _.times(results[classification].noOfPages, function(n){
                                            n += 1;
                                            var urlStringPage = results[classification].urlString + "&page=" + n;
                                            results[classification].pages.push(urlStringPage);
                                        })
                                        getResults();
                                    })
                                }
                            ]
                            , function(err){
                                crawlByClassification();
                                if (err) console.log(err);
                            })
                    }
                    , function(err){
                        if (!err){
                            console.log('STAGE 1 COMPLETE -- SCRAPPING INDEX FOUND');
                            getScrapingIndex();
                        }else{
                            console.log('ABORTING @ STAGE 1 -- UNABLE TO GET SCRAPING INDEX');
                            getScrapingIndex(err);
                        }
                    })
            }
            , function(startScraping){
                console.log('STAGE 2 - SCRAPPING INDEX');
                async.eachSeries(results, function(result, scrappingClassification){

                        console.log('STARTING TO SCRAPE ' + result.classification);
                        result.resources = [];
                        async.eachSeries(result.pages, function(page, scrapClassificationPage){

                                console.log('SCRAPPING INDEX - ' + page);
                                async.waterfall([
                                        function(loadIndividualPage){
                                            request(page, function(error, response, html){
                                                // First we'll check to make sure no errors occurred when making the request
                                                if(!error){
                                                    // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
                                                    $ = cheerio.load(html);
                                                    $('.package-card-details').each(function(i, elem) {
                                                        var resource = {};
                                                        resource.title = $(this).find('.ga-dataset-card-title').text();
                                                        resource.title = resource.title.replace(/(?:\r\n|\r|\n)/g, '');
                                                        resource.title = resource.title.trim();

                                                        resource.description = $(this).find('.package-card-description').text();
                                                        resource.description = resource.description.replace(/(?:\r\n|\r|\n)/g, '');
                                                        resource.description = resource.description.trim();

                                                        resource.org = $(this).find('.package-card-meta').text();
                                                        resource.org = resource.org.substring(0, resource.org.indexOf('/'));
                                                        resource.org = resource.org.replace(/(?:\r\n|\r|\n)/g, '');
                                                        resource.org = resource.org.trim();

                                                        resource.datePosted = $(this).find('.package-card-meta').text();
                                                        resource.datePosted = resource.datePosted.substring(resource.datePosted.indexOf('/') + 1, resource.datePosted.length);
                                                        resource.datePosted = resource.datePosted.replace(/(?:\r\n|\r|\n)/g, '');
                                                        resource.datePosted = resource.datePosted.trim();
                                                        resource.datePosted = moment(resource.datePosted.trim()).toISOString();

                                                        resource.link = 'https://data.gov.sg' + $(this).find('.ga-dataset-card-title').attr('href');

                                                        result.resources.push(resource);
                                                    });
                                                    loadIndividualPage();
                                                }else{
                                                    loadIndividualPage("Unable to load web");
                                                }
                                            })
                                        }
                                    ]
                                    , function(err){
                                        if (err) console.log(err);
                                        scrapClassificationPage();
                                    })
                            }
                            , function(err){
                                scrappingClassification();
                                if (err) console.log(err);
                            })
                    }
                    , function(err){
                        if (!err){
                            console.log('STAGE 2 COMPLETE');
                            startScraping();
                        }else{
                            console.log('ABORTING @ STAGE 2 -- UNABLE TO SCRAPE INDEX');
                            startScraping(err);
                        }
                    })
            }
            , function(scrapeResourceLinks){
                console.log('STAGE 2 - SCRAPPING INDIVIDUAL PAGES');
                async.eachSeries(results, function(result, scrappingClassification){
                    console.log('STARTING TO SCRAPE INDIVIDUAL RESOURCE');
                    async.eachSeries(result.resources, function(resource, scrapeResource){

                            var link = resource.link;
                            console.log('SCRAPPING PAGE - ' + link);

                            request(link, function(error, response, html){
                                // First we'll check to make sure no errors occurred when making the request
                                if(!error){
                                    // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
                                    $ = cheerio.load(html);

                                    // Scrape for the API Endpoint
                                    var dataModal = $('#dataAPIModal').html();
                                    resource.hasAPI = false;
                                    resource.apiLink = null;
                                    if (dataModal){
                                        $ = cheerio.load(dataModal);
                                        var query = $("#collapse-querying").children().children().first().next().text();
                                        query = query.trim();
                                        // remove the limit
                                        query = query.replace(/&limit=5/g, '')
                                        resource.apiLink = query;
                                        resource.hasAPI = true;
                                    }

                                    // Scrape for embed frame
                                    $ = cheerio.load(html);
                                    var embedModal = $('#embedModal').html();
                                    resource.hasEmbed = false;
                                    resource.frame = null;
                                    if (embedModal){
                                        $ = cheerio.load(embedModal);
                                        var embed = $(".language-html").html();
                                        resource.frame = embed;
                                        resource.frame = resource.frame.replace(/(?:\r\n|\r|\n)/g, '');
                                        resource.frame = resource.frame.trim();
                                        resource.hasEmbed = true;
                                    }

                                    // Scrape for the additional data for the data set
                                    $ = cheerio.load(html);
                                    var additionalData = $('.dataset-metadata').html();
                                    $ = cheerio.load(additionalData);

                                    resource.managedBy = "";
                                    resource.lastUpdated = "";
                                    resource.created = "";
                                    resource.coverage = "";
                                    resource.frequency = "";
                                    resource.sources = "";
                                    resource.sourceUrl = "";
                                    resource.licence = "";

                                    $('tr').each(function(i, elem) {

                                        var data = $(this);

                                        if (data.find('th').html().trim() === 'Managed By'){
                                            resource.managedBy = data.find('td a').html().trim();
                                        }
                                        if (data.find('th').html().trim() === 'Last Updated'){
                                            resource.lastUpdated = data.find('td').html().trim();
                                        }
                                        if (data.find('th').html().trim() === 'Created'){
                                            resource.created = data.find('td').html().trim();
                                        }
                                        if (data.find('th').html().trim() === 'Coverage'){
                                            resource.coverage = data.find('td').html().trim();
                                        }
                                        if (data.find('th').html().trim() === 'Frequency'){
                                            resource.frequency = data.find('td').html().trim();
                                        }
                                        if (data.find('th').html().trim() === 'Sources'){
                                            resource.sources = data.find('td').html().trim();
                                        }
                                        if (data.find('th').html().trim() === 'Source URL'){
                                            resource.sourceUrl = data.find('td a').html().trim();
                                        }
                                        if (data.find('th').html().trim() === 'licence'){
                                            resource.licence = data.find('td a').html().trim();
                                        }
                                    });

                                    resource.mt = metaTagHelper.autoMetaTagExtractor(resource.title, 10).concat(metaTagHelper.autoMetaTagExtractor(resource.description, 10));
                                    resource.mt = _(resource.mt).filter(function(item) {
                                        return item !== "";
                                    });
                                    resource.metaTags = [];
                                    _.each(resource.mt, function(tag){
                                        var capsTag = tag.charAt(0).toUpperCase() + tag.slice(1);
                                        capsTag = capsTag.trim();
                                        resource.metaTags.push(capsTag);
                                    });
                                    resource.metaTags = resource.metaTags.toString();
                                    resource.metaTags += "," + resource.title + ",External Data"; // add the title and external data
                                    console.log(resource.metaTags);




                                    // var addAssetReq = _.clone(req);
                                    // addAssetReq.body = {};
                                    // addAssetReq.body.Title = resource.title;
                                    // addAssetReq.body.Description = resource.description;
                                    // addAssetReq.body.Preview = resource.description.substring(0, 140);
                                    // addAssetReq.body.Link = resource.apiLink;
                                    // addAssetReq.body.Country = 'Singapore';
                                    // addAssetReq.body.Secured = false;
                                    // addAssetReq.body.Published = true;
                                    // addAssetReq.body.PublishDate = moment().toISOString();
                                    // addAssetReq.body.ExtGraphEmbed = resource.frame;
                                    // addAssetReq.body.ExtUpdateFrequency = resource.frequency;
                                    // addAssetReq.body.ExtCoverage = resource.coverage;
                                    // addAssetReq.body.ExtIdentifier = link;
                                    // addAssetReq.body.MetaTags = resource.metaTags;
                                    // addAssetReq.body.ExtSiteName = 'Data Gov';
                                    // addAssetReq.body.ExtSiteUrl = 'https://data.gov.sg';
                                    // if (resource.lastUpdated){
                                    //     addAssetReq.body.ExtLastUpdate = moment(resource.lastUpdated).toISOString();
                                    // }
                                    // addAssetReq.body.ExtPoc = resource.managedBy;
                                    // addAssetReq.body.ExtSource = resource.sources;
                                    // addAssetReq.body.ExtSourceUrl = resource.sourceUrl;
                                    // addAssetReq.body.ExtLicense = resource.licence;
                                    //
                                    // assetController.addAsset(addAssetReq, req, true, function(err, data, dataLength){
                                    //     if (err){
                                    //         console.log(err);
                                    //     }
                                    //     scrapeResource();
                                    // })

                                    scrapeResource();
                                }else{
                                    scrapeResource("Unable to load web");
                                }
                            });
                        }
                        , function(err){
                            scrappingClassification();
                        });

                }, function(err){
                    scrapeResourceLinks();
                })
            }
        ],
        function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log('COMPLETED')
            }
        })

};
