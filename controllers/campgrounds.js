const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    console.log(geoData.body.features[0].geometry.coordinates);
    res.send('OK!!')
    // const newCampground = new Campground(req.body.campground);
    // newCampground.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    // newCampground.author = req.user._id;
    // await newCampground.save();
    // // console.log(newCampground);
    // req.flash('success', 'Sucessfully made a new campground!');
    // res.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.showcampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.image.push(...imgs);
    campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Sucessfully updated a campground!');
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Sucessfully deleted a campground!');
    res.redirect('/campgrounds')
}