var fs = require('fs');
//var S = require('string');
var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');

var url = [
                 'http://www.justdial.com/Noida/Flower-Shops/page-',
                 'http://www.justdial.com/Noida/Hardware-Shops/page-',
                 'http://www.justdial.com/Noida/Hardware-Dealers/page-',
                 'http://www.justdial.com/Noida/Hardware-Wholesalers/page-',
                 'http://www.justdial.com/Noida/Hardware-Material-Dealers/page-',
                 'http://www.justdial.com/Noida/Mineral-Water-Distributors/page-',
                 'http://www.justdial.com/Noida/Pharmaceutical-Distributors/page-',
                 'http://www.justdial.com/Noida/Coco-Cola-Soft-Drink-Distributors/page-',
                 'http://www.justdial.com/Noida/Soft-Drink-Distributors/page-',
                 'http://www.justdial.com/Noida/Newspaper-Distributors/page-',
                 'http://www.justdial.com/Noida/Medicine-Distributors/page-',
                 'http://www.justdial.com/Noida/FMCG-Product-Distributors/page-',
                 'http://www.justdial.com/Noida/Standy-Wholeseller/page-',
                 'http://www.justdial.com/Noida/Shoe-Dealers/page-',
                 'http://www.justdial.com/Noida/Grocery-Stores/page-',
                 'http://www.justdial.com/Noida/Grocery-Wholesalers/page-',
                 'http://www.justdial.com/Noida/Grocery-Home-Delivery-Services/page-',
                 'http://www.justdial.com/Noida/Grocery-Distributors/page-',
                 'http://www.justdial.com/Noida/Printers/page-',
                 'http://www.justdial.com/Noida/Printer-Dealers/page-',
                 'http://www.justdial.com/Noida/Stationery-Wholesalers/page-',
                 'http://www.justdial.com/Noida/Vegetable-Wholesalers/page-',
                 'http://www.justdial.com/Noida/Dry-Fruit-Wholesalers/page-',
                 'http://www.justdial.com/Noida/Gift-Retailers/page-',
                 'http://www.justdial.com/Noida/Homeopathic-Medicine-Retailers/page-',
                 'http://www.justdial.com/Noida/Allopathic-Medicine-Retailers/page-',

];

var asyncTasks = [];

console.log("Starting crawling");
for (var i in url ) {
    var urlList = [];
    for (j=1;j<30;j++) {
        urlList.push(url[i] + j);
        //console.log(url[i] + j);
    }
    asyncTasks.push(crawl.bind(null, urlList ));
}

async.parallel(asyncTasks, function(err) {
    if(err) {
        console.log(err);
    }
    console.log("Finished Crawling");
});

function crawl(urlList, callback) {
        
    var crawlTasks = [];
    for(var i =0; i < urlList.length; i++ ) {
        crawlTasks.push(crawlInternal.bind(null, urlList[i]));
    }
    async.series(crawlTasks, function(err){
        if(err){
            return callback(err);
        }
        callback();
    });

}

function crawlInternal(link, cb) {
    console.log("Begin crawling:- " +link);
    request(link, function(error, response, html ) {
        if(error || response.statusCode != 200){
            console.log(error);
            return cb(error);
        }
        var $ = cheerio.load(html);
        var cat = $("#srchbx").attr("value");
        var appendTasks = [];        
        $(".cntanr").each(function(val, element){
            var name = $(this).find(".jcn").children("a").html();
            var phone = $(this).find(".contact-info").children().next().text();
            var add = $(this).find(".address-info").children().children().children().text().trim();
            var ratings = $(this).find(".ipadabove").find(".rt_count").text().replace("Ratings", " ").trim();

            var metadata = {
                name		: 			name,
                cateogory 	: 		     cat,
                phone		:         phone,
                city		:  			"Noida",	
                address 	:     			add,
                ratings     :  			ratings

            }
            appendTasks.push(appendFile.bind(null, metadata));
        });
        
            
        function appendFile(metadata, callback){
            fs.appendFile('jusdialBetter.json', JSON.stringify(metadata,null,4)  + ',\n', function (err) {
                if (err){
                    return callback(err);
                }
                callback();  
            });
        }

        async.parallel(appendTasks, function(error){
            if(error){
                console.log(error);
                return cb(error);
            }
            console.log("Done crawling:- " +link);
            cb();
        });
        
    });

}