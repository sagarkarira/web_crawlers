var fs = require('fs');
//var S = require('string');
var request = require('request');
var cheerio = require('cheerio');
var url = [];

function main (){
        city = "noida-restaurants";
        start = 1;
        end = 75;
        urlGenrator(city, start, end, function() {
                crawler();
        });
};

function urlGenrator(city, start, end, callback) {
        for (i = start; i<end ; i++) {
                url.push('https://www.zomato.com/ncr/'+ city +'?page=' + i);
        }
        callback();
};


function crawler() {
        for (var i in url ) {
                request(url[i], function(error, response, html ) {
                        if (error) {
                            console.log(error);
                        }
                        var $ = cheerio.load(html);
                        var cat = "Restaurant";
                        $(".card.search-snippet-card.search-card ").each(function(val, element){
                            var name = $(this).find(".content").find(".result-title").text().trim();
                            var category = $(this).find(".content").find(".res-snippet-small-establishment").text().trim();
                            var rating = $(this).find(".content").find(".rating-popup").text().trim();
                            var reviews = $(this).find(".content").find(".result-reviews").text().trim();
                            var address = $(this).find(".content").find(".search-result-address").text().trim();
                            var phone = $(this).find(".res-snippet-ph-info").attr("data-phone-no-str");
                            var homeDelivery;
                            if ($(this).find(".o2_link")['0']) {
                                homeDelivery = "Yes";
                            } else {
                                homeDelivery = "No";
                            }
                            var metadata = {
                                name: name,
                                category: category,  
                                rating : rating,
                                reviews : reviews,
                                address : address,
                                phone   : phone,
                                homeDelivery : homeDelivery
                                };
                               
                            
                            fs.appendFile ('zomato.json', JSON.stringify(metadata,null,4)  + ',\n', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                console.log(name);
                                        
                            });
                        });

            });
        }

}

main();
