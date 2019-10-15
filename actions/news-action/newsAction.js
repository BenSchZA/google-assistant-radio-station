let fetch = require('request');
let cheerio = require('cheerio');

class NewsAction {

    constructor() {

    }

    deliverEWNNews(app) {
        return new Promise((resolve, reject) => {

            // Fetch HTML data
            fetch('http://ewn.co.za/', function (error, response, html) {
                if (error && response.statusCode !== 200) {
                    reject(Error('URL request failed'));
                    return;
                }

                // Process HTML data to find audio file URL
                let $ = cheerio.load(html);
                let audioFileUrl = $('#NewsBulletinAudio')
                    .attr('name', 'NewsBulletinAudio')
                    .find("[data-location=cpt]")
                    .attr('data-audiourl');

                if (audioFileUrl) {
                    console.log(audioFileUrl);
                    resolve(audioFileUrl)
                } else {
                    reject(Error('URL not valid'))
                }
            });

        }).then(audioFileUrl => {

            return new Promise(((resolve, reject) => {

                // Compile rich media response
                const richResponse = app.buildRichResponse()
                    .addSimpleResponse("Welcome to Eye Witness News! Your source of South African news.")
                    .addSimpleResponse("Here's your news bulletin...")
                    .addMediaResponse(app.buildMediaResponse()
                        .addMediaObjects([
                            app.buildMediaObject("EWN News", audioFileUrl)
                                .setDescription("South African news from EWN.")
                                .setImage("http://ewn.co.za/site/design/img/ewn-logo.png", app.Media.ImageType.LARGE)
                        ]))
                    .addSuggestions("More news")
                    .addSuggestionLink("EWN news", "http://ewn.co.za/");

                if (app.ask(richResponse)) {
                    resolve("DialogFlow response successful")
                } else {
                    reject("DialogFlow response failed")
                }

            }));

        }).catch(error => {
            // If the response fails, tell the user
            console.log(error);

            const richResponse = app.buildRichResponse()
                .addSimpleResponse("We couldn't fetch Eye Witness News right now. Try again later.");
            return app.ask(richResponse)
        });
    }
}

module.exports = NewsAction;