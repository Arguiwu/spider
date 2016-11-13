const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = mongoose.createConnection('localhost', 'Movie');

var MovieSchema = new Schema({
    _id: Number,
    zh_name: String,
    foreign_name: String,
    image: String,
    directors: [{}],
    scenarists: [{}],
    actors: [{}],
    genres: [String],
    initialReleaseDate: [String],
    runtime: String,
    imdb: {},
    summary: String,
    recommendations: [{}],
    average: Number,
    tags: [String],
    language: [String],
    region: [String],
    aka: [String]
}, {
    _id: false
});

var MovieModel = db.model('t_movies', MovieSchema);

module.exports = MovieModel;