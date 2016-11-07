const superagent = require('superagent');
const cheerio = require('cheerio');
var getMovie = require('./spider.js');

var url = 'https://movie.douban.com/tag/2015';
superagent.get(url)
    .set({
        'Referer': 'https://movie.douban.com/subject_search?search_text=%E5%86%B0%E8%A1%80%E6%9A%B4&cat=1002',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36',
        'Host': 'movie.douban.com'
    })
    .end(function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        var $ = cheerio.load(res.text);
        $('.article > div > table a').each(function (i, elem) {
            var link = $(this).attr('href');
            getMovie(link);
        });
    });
