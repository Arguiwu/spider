const superagent = require('superagent');
const cheerio = require('cheerio');
var getMovie = require('./spider.js');

var page = 0;
var staticLink = 'https://movie.douban.com/tag/2013?start=';
var url = staticLink + page * 20 + '&type=T';
getLink(url);

function getLink(url) {
    console.log(url);
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
            console.log('连接成功');
            var $ = cheerio.load(res.text);
            var listCount = $('.article > div > table .pl2 > a').length;
            $('.article > div > table .pl2 > a').each(function(i, elem) {
                    var link = $(this).attr('href');
                    // console.log($(this).text() + link);
                    // 获取电影信息
                    getMovie(link);
                    if (i + 1 == listCount) {
                        page = page + 1;
                        url = staticLink + page * 20 + '&type=T';
                        getLink(url);
                    }
            });
        });
}
