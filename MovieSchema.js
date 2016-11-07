var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'Movie');

var MovieSchema = new mongoose.Schema({
    id: Number,
    zh_name: String,
    foreign_name: String,
    image: String,
    directors: [String],
    scenarists: [String],
    actors: [String],
    genres: [String],
    initialReleaseDate: [String],
    runtime: String,
    imdb: {},
    summary: String,
    recommendations: [mongoose.Schema.Types.Mixed],
    average: Number,
    tags: [String]
});

var MovieModel = db.model('t_movies', MovieSchema);

module.exports = MovieModel;