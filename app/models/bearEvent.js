var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BearEventSchema = new Schema({
    bearId: String,
    timestamp: Date,
    type: {type: String}
}, {strict: false});


BearEventSchema.index({bearId: 1, timestamp: 1}, {unique: true});
module.exports = mongoose.model('BearEvent', BearEventSchema);