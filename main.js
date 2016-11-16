const superagent = require('superagent');
const cheerio = require('cheerio');
var getMovie = require('./spider.js');
const mongoose = require('mongoose');
const db = mongoose.createConnection('localhost', 'Movie');
const MovieModel = require('./MovieSchema.js');
const requestHeader = require('./header.js');
var urlencode = require('urlencode');

var page = 0;
var url;
// 所有标签
var tags = [];
var tagsLength;
var start = 0;

// db save
db.on('error', function() {
    console.log('连接错误');
});
db.on('open', function() {
    superagent.get('https://movie.douban.com/tag/')
        .set(requestHeader)
        .end(function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            var $ = cheerio.load(res.text);
            $('.tagCol td a').each(function(i, elem) {
                tags.push(urlencode($(this).text()));
            })
            tagsLength = tags.length;
            url = 'https://movie.douban.com/tag/' + tags[start] + '?start=' + page * 20 + '&type=T';
            getLink(url);
        })
})

function getLink(url) {
    console.log(url);
    superagent.get(url)
        .set(requestHeader)
        .timeout(5000)
        .end(function(err, res) {
            if (err) {
                if (err.timeout) {
                    console.log('超时');
                    getLink(url);
                }
                return;
            }
            var $ = cheerio.load(res.text);
            var links = $('.item .pl2 a');
            var listCount = links.length;
            if (!listCount) {
                setTimeout(function() {
                    if (start <= tagsLength) {
                        start = start + 1;
                        page = 0;
                        url = 'https://movie.douban.com/tag/' + tags[start] + '?start=' + page * 20 + '&type=T';
                        getLink(url);
                    } else {
                        console.log('全部标签已经爬完');
                    }
                }, 20000);
                return;
            }
            links.each(function(i, elem) {
                if (i + 1 == listCount) {
                    page = page + 1;
                    url = 'https://movie.douban.com/tag/' + tags[start] + '?start=' + page * 20 + '&type=T';
                    getLink(url);
                    return;
                }
                var link = $(this).attr('href');
                var movie = getMovie(link, save);
            });
        });
}

function save(movie, $) {
    MovieModel.findOne({ _id: movie._id }, function(err, res) {
        if (err) {
            console.log('保存问题')
            console.log(err);
        }
        if (res) {
            // console.log(movie.zh_name + '    已经存在');
            return;
        } else if ($('.episode_list').text()) {
            // console.log(movie.zh_name + '    电视剧不要～');
            return;
        } else {
            var movieEntity = new MovieModel(movie);
            movieEntity.markModified('directors');
            movieEntity.markModified('scenarists');
            movieEntity.markModified('actors');
            movieEntity.markModified('imdb');
            movieEntity.markModified('recommendations');
            movieEntity.save(function(error) {
                console.log(movie.zh_name + '保存成功');
            });
        }
    })
}
