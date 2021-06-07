const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

app.post('/campgrounds', catchAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
}))


app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    // console.log(req.body.campground)
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true })
    res.redirect(`/campgrounds/${req.params.id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}))

app.use((err, req, res, next) => {
    res.send('Oh boy, something went wrong!')
})

app.listen(3000, () => {
    console.log('Serving on port 3000!');
})