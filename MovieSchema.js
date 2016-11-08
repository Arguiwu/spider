var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'Movie');

var MovieSchema = new mongoose.Schema({
    _id: Number,
    zh_name: String,
    foreign_name: String,
    image: String,
    directors: [mongoose.Schema.Types.Mixed],
    scenarists: [mongoose.Schema.Types.Mixed],
    actors: [mongoose.Schema.Types.Mixed],
    genres: [String],
    initialReleaseDate: [String],
    runtime: String,
    imdb: {},
    summary: String,
    recommendations: [mongoose.Schema.Types.Mixed],
    average: Number,
    tags: [String]
}, {
    _id: false
});

var MovieModel = db.model('t_movies', MovieSchema);

module.exports = MovieModel;