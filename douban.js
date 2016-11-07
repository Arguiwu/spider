const superagent = require('superagent');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

var MovieModel = require('./MovieSchema.js');

var url = 'https://movie.douban.com/subject/26683290/';
superagent.get(url)
.set({
    'Referer': 'https://movie.douban.com/subject_search?search_text=%E5%86%B0%E8%A1%80%E6%9A%B4&cat=1002',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36',
    'Host': 'movie.douban.com'
})
.end(function (err, res) {
    if (err) {
        console.log(err);
        return;
    }
    var $ = cheerio.load(res.text);
    var movie = {};
    // id
    movie.id = $('#content .gtleft ul').children().last().find($('span[class="rec"]')).attr('id').slice(3);
    console.log('id---------  ' + movie.id);
    // 电影名
    var name = $('span[property="v:itemreviewed"]').text().split(' ');
    movie.zh_name = name[0];
    movie.foreign_name = name.splice(1).join(' ');
    console.log('中文名-----  ' + movie.zh_name);
    console.log('外文名-----  ' + movie.foreign_name);
    // 海报
    movie.image = $('#mainpic img').attr('src');
    console.log('海报-------  ' + movie.image);
    // 导演
    movie.directors = [];
    $('a[rel="v:directedBy"]').each(function (i, elem) {
        var director = $(this).text();
        movie.directors.push(director);
    });
    console.log('导演');
    console.log(movie.directors);
    // 编剧
    movie.scenarists = $('#info > span').children().eq(3).text();
    movie.scenarists = movie.scenarists.split('/');
    console.log('编剧');
    console.log(movie.scenarists);
    // 演员
    movie.actors = [];
    $('a[rel="v:starring"]').each(function (i, elem) {
        movie.actors[i] = $(this).text();
    })
    console.log('演员');
    console.log(movie.actors);
    // 类型
    movie.genres = [];
    $('span[property="v:genre"]').each(function (i, elem) {
        movie.genres.push($(this).text());
    })
    console.log('类型');
    console.log(movie.genres);
    // 上映日期
    movie.initialReleaseDate = [];
    $('span[property="v:initialReleaseDate"]').each(function(i, elem) {
        movie.initialReleaseDate.push($(this).text());
    })
    console.log(movie.initialReleaseDate);
    // 片长
    movie.runtime = $('span[property="v:runtime"]').text();
    console.log(movie.runtime);
    // imdb
    movie.imdb = {
        id: $('#info').children().eq(-2).text(),
        link: $('#info').children().eq(-2).attr('href')
    }
    console.log(movie.imdb);
    // 简介
    movie.summary = $('span[property="v:summary"]').text();
    console.log(movie.summary);
    // 推荐
    movie.recommendations = [];
    $('#recommendations .recommendations-bd dl dd a').each(function (i, elem) {
        var film = {};
        film.name = $(this).text();
        var start = $(this).attr('href').indexOf('subject');
        var end = $(this).attr('href').indexOf('?');
        film.id = $(this).attr('href').slice(start + 8, end - 1);
        movie.recommendations.push(film);
    })
    console.log(movie.recommendations);
    // 评分
    movie.average = $('strong[property="v:average"]').text();
    console.log(movie.average);
    // 标签
    movie.tags = [];
    $('.tags-body a').each(function (i, elem) {
        movie.tags.push($(this).text());
    })
    console.log('标签');
    console.log(movie.tags);

    var db = mongoose.createConnection('localhost', 'Movie');
    // db save
    db.on('error', function(){
        console.log('连接错误');
    });
    db.once('open', function(){
        console.log('连接成功');
        console.log(movie);
        var movieEntity = new MovieModel(movie);
        movieEntity.markModified('imdb');
        movieEntity.markModified('recommendations');
        movieEntity.save(function(err) {
            console.log(err);
        });
        db.close();
    })
})