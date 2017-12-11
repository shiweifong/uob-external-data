// Generic get method for asset
// Authorized - Admin, System Admin
var scrapeDataGov = exports.scrapeDataGov = function(req, res, override, callback, apiOptions) {

    // The URL we will scrape from - in our example Anchorman 2.

    var host = "https://data.gov.sg";
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
                var classification;
                async.eachSeries(results, function(result, scrappingClassification){
                        classification = result.classification;
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
                                                        resource.title = resource.title.replace(/, /g, ' | ')

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

                                                        resource.classification = classification;

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
                            console.log('GETTING DEEP LINKS - ' + link);

                            request(link, function(error, response, html){
                                // Check to make sure no errors occurred when making the request
                                if(!error){
                                    // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
                                    $ = cheerio.load(html);

                                    // Check if the page has got how many links.
                                    var detailedPages = [];
                                    $('.ga-dataset-resource-selector div').remove();
                                    $('.resource-selector li').each(function(i, elem) {
                                        var title = $(this).children().text().trim();
                                        var link = host + $(this).children().attr('href');
                                        var pageLink = {};
                                        pageLink.title = title;
                                        pageLink.link = link;
                                        detailedPages.push(pageLink);
                                    });

                                    async.eachSeries(detailedPages, function(detailedPage, scrapeDetailedPage){

                                        console.log('SCRAPPING PAGE - ' + link);

                                        var insertObj = resource;
                                        insertObj.title = detailedPage.title; // replace the title
                                        insertObj.link = detailedPage.link; // replace the link

                                        //scrape each link
                                        request(insertObj.link, function(error, response, html) {
                                            // Scrape for the API Endpoint
                                            var dataModal = $('#dataAPIModal').html();
                                            insertObj.hasAPI = false;
                                            insertObj.apiLink = null;
                                            if (dataModal){
                                                $ = cheerio.load(dataModal);
                                                var query = $("#collapse-querying").children().children().first().next().text();
                                                query = query.trim();
                                                // remove the limit
                                                query = query.replace(/&limit=5/g, '')
                                                insertObj.apiLink = query;
                                                insertObj.hasAPI = true;
                                            }

                                            // Get the DL link
                                            $ = cheerio.load(html);
                                            var dlLink = $('.ga-dataset-download').attr('href');
                                            insertObj.file = host + dlLink;

                                            // Get the data dictionary
                                            var dictionary = $('.resource-fields .hidden-phone').html();
                                            insertObj.dictionary = dictionary;

                                            // Scrape for embed frame
                                            var embedModal = $('#embedModal').html();
                                            insertObj.hasEmbed = false;
                                            insertObj.frame = null;
                                            if (embedModal){
                                                $ = cheerio.load(embedModal);
                                                var embed = $(".language-html").html();
                                                insertObj.frame = embed;
                                                insertObj.frame = insertObj.frame.replace(/(?:\r\n|\r|\n)/g, '');
                                                insertObj.frame = insertObj.frame.trim();
                                                insertObj.hasEmbed = true;
                                            }

                                            // Scrape for the additional data for the data set
                                            $ = cheerio.load(html);
                                            var additionalData = $('.dataset-metadata').html();
                                            $ = cheerio.load(additionalData);

                                            insertObj.managedBy = "";
                                            insertObj.lastUpdated = "";
                                            insertObj.created = "";
                                            insertObj.coverage = "";
                                            insertObj.frequency = "";
                                            insertObj.sources = "";
                                            insertObj.sourceUrl = "";
                                            insertObj.licence = "";

                                            $('tr').each(function(i, elem) {

                                                var data = $(this);

                                                if (data.find('th').html().trim() === 'Managed By'){
                                                    insertObj.managedBy = data.find('td a').html().trim();
                                                }
                                                if (data.find('th').html().trim() === 'Last Updated'){
                                                    insertObj.lastUpdated = data.find('td').html().trim();
                                                }
                                                if (data.find('th').html().trim() === 'Created'){
                                                    insertObj.created = data.find('td').html().trim();
                                                }
                                                if (data.find('th').html().trim() === 'Coverage'){
                                                    insertObj.coverage = data.find('td').html().trim();
                                                }
                                                if (data.find('th').html().trim() === 'Licence'){
                                                    insertObj.license = data.find('td').html().trim();
                                                }
                                                if (data.find('th').html().trim() === 'Frequency'){
                                                    insertObj.frequency = data.find('td').html().trim();
                                                }
                                                if (data.find('th').html().trim() === 'Source(s)'){
                                                    insertObj.sources = data.find('td').html().trim();
                                                }
                                                if (data.find('th').html().trim() === 'Source URL'){
                                                    insertObj.sourceUrl = data.find('td a').html().trim();
                                                }
                                            });


                                            // Scrape for the format of the data set
                                            $ = cheerio.load(html);
                                            var pageDetailAdditionalData = $('.resource-fields-additional-info').html();
                                            $ = cheerio.load(pageDetailAdditionalData);

                                            insertObj.fileType = "";
                                            $('tr').each(function(i, elem) {
                                                var data = $(this);
                                                if (data.find('th').html().trim() === 'Format'){
                                                    insertObj.fileType = data.find('td').html().trim();
                                                }
                                            });

                                            insertObj.mt = metaTagHelper.autoMetaTagExtractor(insertObj.title, 3).concat(metaTagHelper.autoMetaTagExtractor(insertObj.description, 8));
                                            insertObj.mt = _(insertObj.mt).filter(function(item) {
                                                return item !== "";
                                            });
                                            insertObj.metaTags = [];
                                            _.each(insertObj.mt, function(tag){
                                                var capsTag = tag.charAt(0).toUpperCase() + tag.slice(1);
                                                capsTag = capsTag.trim();
                                                insertObj.metaTags.push(capsTag);
                                            });
                                            insertObj.metaTags = insertObj.metaTags.toString();
                                            insertObj.classification = insertObj.classification.charAt(0).toUpperCase() + insertObj.classification.slice(1);
                                            insertObj.metaTags += "," + insertObj.title + ",External Data,Public Data,Data.gov.sg," + insertObj.classification; // add the title, external data, classification
                                            if (insertObj.hasAPI) insertObj.metaTags += ",JSON"; // has got JSON format
                                            if (insertObj.file && insertObj.fileType) insertObj.metaTags += "," + insertObj.fileType; // has got JSON format

                                            // KHL, SNP, CSV / Excel, Powerpoint, PDF
                                            var addAssetReq = _.clone(req);
                                            addAssetReq.body = {};
                                            addAssetReq.body.Title = insertObj.title;
                                            addAssetReq.body.Description = insertObj.description;
                                            addAssetReq.body.Preview = insertObj.description.substring(0, 140);
                                            addAssetReq.body.Link = insertObj.apiLink;
                                            addAssetReq.body.Country = 'Singapore';
                                            addAssetReq.body.Secured = false;
                                            addAssetReq.body.Published = true;
                                            addAssetReq.body.PublishDate = moment().toISOString();
                                            addAssetReq.body.ExtGraphEmbed = insertObj.frame;
                                            addAssetReq.body.ExtUpdateFrequency = insertObj.frequency;
                                            addAssetReq.body.ExtCoverage = insertObj.coverage;
                                            addAssetReq.body.MetaTags = insertObj.metaTags;
                                            addAssetReq.body.ExtSiteName = 'data.gov.sg';
                                            addAssetReq.body.ExtSiteUrl = 'https://data.gov.sg';
                                            addAssetReq.body.ExtIdentifier = insertObj.link;
                                            addAssetReq.body.ExtDictionary = insertObj.dictionary;
                                            addAssetReq.body.ExtFile = insertObj.file;
                                            addAssetReq.body.ExtFileType = insertObj.fileType;
                                            if (insertObj.lastUpdated){
                                                addAssetReq.body.ExtLastUpdate = moment(insertObj.lastUpdated).toISOString();
                                            }
                                            addAssetReq.body.ExtPoc = insertObj.managedBy;
                                            addAssetReq.body.ExtSource = insertObj.sources;
                                            addAssetReq.body.ExtSourceUrl = insertObj.sourceUrl;
                                            addAssetReq.body.ExtLicense = insertObj.licence;

                                            assetController.addAsset(addAssetReq, req, true, function(err, data, dataLength){
                                                if (err){
                                                    console.log(err);
                                                }
                                                scrapeDetailedPage();
                                            })
                                        });
                                    }, function(err){
                                        if (!err){
                                            scrapeResource();
                                        }else{
                                            scrapeResource("Unable to load children page");
                                        }
                                    })
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
