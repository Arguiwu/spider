const superagent = require('superagent');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

var MovieModel = require('./MovieSchema.js');

function getMovie(url) {
    superagent.get(url)
    .set({
        'Referer': 'https://movie.douban.com/subject_search?search_text=%E5%86%B0%E8%A1%80%E6%9A%B4&cat=1002',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36',
        'Host': 'movie.douban.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch, br',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
        'Connection': 'keep-alive',
        'Cookie': 'll="118124"; bid=fn-RmlYyWng; _ga=GA1.2.1994921951.1470050267; ap=1; _pk_ref.100001.4cf6=%5B%22%22%2C%22%22%2C1478574935%2C%22https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3D28Uk4fXLf-6NI3cK1A3Kr66jWlNm1Dwh_az-ho_I7pelabNnVLmEztuHx_EI25Rv%26wd%3D%26eqid%3Da1835db300085b5600000003581f1a02%22%5D; _vwo_uuid_v2=B7BF2419FAC162BC07624ED70DA4E016|ca9450b179ebb65ef21ff14e960a416e; _pk_id.100001.4cf6=3a84fe7fdecfb7ec.1478178997.9.1478575923.1478572897.; _pk_ses.100001.4cf6=*; __utma=30149280.1994921951.1470050267.1478570364.1478574935.10; __utmb=30149280.0.10.1478574935; __utmc=30149280; __utmz=30149280.1478433289.3.2.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; __utma=223695111.1992274825.1478178997.1478570364.1478574935.9; __utmb=223695111.0.10.1478574935; __utmc=223695111; __utmz=223695111.1478433289.2.2.utmcsr=baidu|utmccn=(organic)|utmcmd=organic'
    })
    .end(function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        var $ = cheerio.load(res.text);
        var movie = {};
        // _id
        movie._id = $('#content .gtleft ul').children().last().find($('span[class="rec"]')).attr('id').split('-')[1];
        // 电影名
        var name = $('span[property="v:itemreviewed"]').text().split(' ');
        movie.zh_name = name[0];
        movie.foreign_name = name.splice(1).join(' ');
        // 海报
        movie.image = $('#mainpic img').attr('src');
        // 导演
        movie.directors = [];
        $('a[rel="v:directedBy"]').each(function(i, elem) {
            var celebrity = $(this).attr('href').split('/');
            var director = {
                name: $(this).text(),
                celebrity: celebrity[celebrity.length - 2]
            }
            movie.directors.push(director);
        });
        // 编剧
        movie.scenarists = [];
        var hasScenarist = $('#info > span').children().eq(2).text();
        if (hasScenarist == '编剧') {
            $('#info > span').children().eq(3).find('a').each(function(i, elem) {
                var celebrity = $(this).attr('href').split('/');
                var scenarist = {
                    name: $(this).text(),
                    celebrity: celebrity[celebrity.length - 2]
                }
                movie.scenarists.push(scenarist);
            })
        }
        // 演员
        movie.actors = [];
        $('a[rel="v:starring"]').each(function(i, elem) {
                var celebrity = $(this).attr('href').split('/');
                var actor = {
                    name: $(this).text(),
                    celebrity: celebrity[celebrity.length - 2]
                }
                movie.actors.push(actor);
            })
        // 类型
        movie.genres = [];
        $('span[property="v:genre"]').each(function(i, elem) {
                movie.genres.push($(this).text());
            })
        // 上映日期
        movie.initialReleaseDate = [];
        $('span[property="v:initialReleaseDate"]').each(function(i, elem) {
                movie.initialReleaseDate.push($(this).text());
            })
        // 片长
        movie.runtime = $('span[property="v:runtime"]').text();
        // imdb
        movie.imdb = {
                id: $('#info').children().eq(-2).text(),
                link: $('#info').children().eq(-2).attr('href')
            }
        // 简介
        movie.summary = $('span[property="v:summary"]').text().replace(/(^\s*)|(\s*$)/g, "");
        // 推荐
        movie.recommendations = [];
        $('#recommendations .recommendations-bd dl dd a').each(function(i, elem) {
                var film = {};
                film.name = $(this).text();
                var start = $(this).attr('href').indexOf('subject');
                var end = $(this).attr('href').indexOf('?');
                film.id = $(this).attr('href').slice(start + 8, end - 1);
                movie.recommendations.push(film);
            })
            // 评分
        movie.average = $('strong[property="v:average"]').text();
        // 标签
        movie.tags = [];
        $('.tags-body a').each(function(i, elem) {
            movie.tags.push($(this).text());
        }) 
        var db = mongoose.createConnection('localhost', 'Movie');
        // db save
        db.on('error', function() {
            console.log('连接错误');
        });
        db.once('open', function() {
            MovieModel.findOne({ _id: movie._id }, function(err, res) {
                if (res) {
                    console.log(movie.zh_name + '    已经存在');
                    db.close();
                    return;
                } else {
                    var movieEntity = new MovieModel(movie);
                    movieEntity.markModified('directors');
                    movieEntity.markModified('scenarists');
                    movieEntity.markModified('actors');
                    movieEntity.markModified('imdb');
                    movieEntity.markModified('recommendations');
                    movieEntity.save(function(err) {
                        console.log(movie.zh_name + '保存成功');
                    });
                    db.close();
                }
            })
        })
    })
}

module.exports = getMovie;
