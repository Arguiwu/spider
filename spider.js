const superagent = require('superagent');
const cheerio = require('cheerio');
const url = require('url');

function getMovie(urlLink, save) {
    superagent.get(urlLink)
    .set({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch, br',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': 'll="118124"; bid=fn-RmlYyWng; _ga=GA1.2.1994921951.1470050267; ct=y; __ads_session=zF3nPylR0Aha7pkFiwA=; ap=1; _pk_ref.100001.4cf6=%5B%22%22%2C%22%22%2C1479051883%2C%22https%3A%2F%2Fwww.douban.com%2F%22%5D; _vwo_uuid_v2=B7BF2419FAC162BC07624ED70DA4E016|ca9450b179ebb65ef21ff14e960a416e; _pk_id.100001.4cf6=3a84fe7fdecfb7ec.1478178997.20.1479052900.1479048923.; _pk_ses.100001.4cf6=*; __utma=30149280.1994921951.1470050267.1479043908.1479051883.21; __utmb=30149280.0.10.1479051883; __utmc=30149280; __utmz=30149280.1478594157.12.3.utmcsr=movie.douban.com|utmccn=(referral)|utmcmd=referral|utmcct=/; __utma=223695111.1992274825.1478178997.1479043908.1479051883.19; __utmb=223695111.0.10.1479051883; __utmc=223695111; __utmz=223695111.1478917251.16.4.utmcsr=douban.com|utmccn=(referral)|utmcmd=referral|utmcct=/',
        'Host': 'movie.douban.com',
        'Referer': 'https://movie.douban.com/tag/',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36',
    })
    .end(function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        var $ = cheerio.load(res.text);
        var movie = {};
        // _id
        var pathnames = url.parse(urlLink).pathname.split('/');
        movie._id = pathnames[pathnames.length - 2];
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
        // 语言
        movie.languange = [];
        // 地区
        movie.region = [];
        // 又名
        movie.aka = [];
        $('#info').children().each(function(i, elem) {
            if ($(this).text().indexOf('语言') > -1 ) {
                movie.language = $(this).next()['0'].prev.data.split('/');
                for (var i = 0; i < movie.language.length; i++) {
                    movie.language[i] = movie.language[i].replace(/\s+/g, '');
                }
            }
            if ($(this).text().indexOf('制片国家') > -1 ) {
                movie.region = $(this).next()['0'].prev.data.split('/');
                for (var i = 0; i < movie.region.length; i++) {
                    movie.region[i] = movie.region[i].replace(/\s+/g, '');
                }
            }
            if ($(this).text().indexOf('又名') > -1 ) {
                movie.aka = $(this).next()['0'].prev.data.split('/');
                for (var i = 0; i < movie.aka.length; i++) {
                    movie.aka[i] = movie.aka[i].replace(/\s+/g, '');
                }
            }
        })
        // return movie;
        save(movie, $);
    })
}

module.exports = getMovie;
