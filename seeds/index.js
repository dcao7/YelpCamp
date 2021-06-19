const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console.error, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor((Math.random() * 1000));
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '60c8dbe59cb0b96fa7f12446',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: [{
                url: 'https://source.unsplash.com/random/483251',
                filename: 'random/483251'
            }],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis fuga tempora impedit? Optio sint harum dolore vitae aspernatur. Omnis itaque vel pariatur distinctio officiis, sequi cum error non deserunt commodi.',
            price,
            geometry: {
                type: "Point",
                coordinates: [ -113.1131, 47.0202]
            }
        })

        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})