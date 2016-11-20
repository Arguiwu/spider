var MovieModel = require('./MovieSchema.js');
const mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'Movie');
const superagent = require('superagent');
const cheerio = require('cheerio');
const header = require('./header.js');

db.on('error', function(err) {
    if (err) {
        console.log(err);
    }
})
db.on('open', function() {
    var limit = 0;
    main(limit);
})

function main(limit) {
    MovieModel.find({}, { _id: 1 }, function(err, movies) {
        var count = 0;
        movies.forEach(function(movie) {
            count += 1;
            var url = 'https://movie.douban.com/subject/' + movie._id;
            var foo = function(url) {
                console.log(url)
                superagent.get(url)
                    .set(header)
                    .timeout(1000 * 10)
                    .end(function(err, res) {
                        if (err) {
                            if (err.timeout) {
                                foo(url);
                                console.log(err);
                            }
                            foo(url);
                            return;
                        }
                        var $ = cheerio.load(res.text);
                        var votes = +$('span[property="v:votes"]').text();

                        if (votes) {
                            MovieModel.update({ _id: movie._id }, { votes: votes }, function(err, res) {
                                console.log(movie._id + '保存成功');
                                var url = 'https://movie.douban.com/subject/' + movie._id;
                                if (count > 10) {
                                    limit += 1;
                                    main(limit);
                                } else {
                                    foo(url);
                                }
                            })
                        }
                    })
            }
            foo(url);
        })
    }).skip(limit * 10).limit((limit + 1) * 10)
}
