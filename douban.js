const superagent = require('superagent');
const cheerio = require('cheerio');

var url = 'https://movie.douban.com/subject/1292067/';
superagent.get(url).end(function (err, res) {
    if (err) {
        console.log(err);
    }
    var $ = cheerio.load(res.text);
    // id
    var id = $('#content .gtleft ul').children().last().find($('span[class="rec"]')).attr('id').slice(3);
    console.log('id---------  ' + id);
    // 电影名
    var name = $('span[property="v:itemreviewed"]').text().split(' ');
    var zh_name = name[0];
    var foreign_name = name.splice(1).join(' ');
    console.log('中文名-----  ' + zh_name);
    console.log('外文名-----  ' + foreign_name);
    // 海报
    var image = $('#mainpic img').attr('src');
    console.log('海报-------  ' + image);
    // 导演
    var directors = [];
    $('a[rel="v:directedBy"]').each(function (i, elem) {
        var director = $(this).text();
        console.log(director);
        directors.push(director);
    });
    console.log(directors);
    // 编剧
    var scenarists = $('#info > span').children().eq(1).text();
    scenarists = scenarists.split('/');
    console.log(scenarists);
    // 演员
    var actors = [];
    $('a[rel="v:starring"]').each(function (i, elem) {
        actors[i] = $(this).text();
    })
    console.log(actors);
})