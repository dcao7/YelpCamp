const express = require('express');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console.error, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


const app = express();
const path = require('path');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
})

app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})

app.put('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true })
    res.redirect(`/campgrounds/${req.params.id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
})

app.listen(3000, () => {
    console.log('Serving on port 3000!');
})