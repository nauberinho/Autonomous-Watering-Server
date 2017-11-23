'use strict';
var mongoose = require('mongoose');

// Plant object schema
var plantSchema = mongoose.Schema({
    name: { type: String, required: true },
    slot: {type: String},
    date: {type: Date, default: Date.now}
});
// Construct export
var Plants = module.exports = mongoose.model('Plants', plantSchema);

// Get all plants
module.exports.getPlants = (callback, limit) => {
    Plants.find(callback).limit(limit);
}

module.exports.getOnePlant = (id, callback) => {
	Plants.findById({_id:id}, callback);
}

// Add plant
module.exports.addPlant = (payload, callback) => {


   /* {multi:false, upsert:false, safe:true}

    User.findOneAndUpdate({username: username},
        { $push:
           {station.name: stationName} plant }}, {}, callback);
           */

}

// Remove plant
module.exports.removePlant = (_id, callback) => {
    Plants.findByIdAndRemove(_id, callback);
}

// Edit plant
module.exports.editPlant = (_id, plant, options, callback) => {
    Plants.findOneAndUpdate({_id:_id}, plant, options, callback);
}



