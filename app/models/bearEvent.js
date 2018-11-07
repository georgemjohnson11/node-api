var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BearEventSchema = new Schema({
    bearId: String,
    timestamp: Date,
    type: {type: String}
}, {strict: false});


BearEventSchema.index({bearId: 1, timestamp: 1}, {unique: true});
const BearEvent = module.exports.BearEvent = mongoose.model('BearEvent', BearEventSchema);


const eventFactories = {
    create: (uuid, data) => new BearEvent({
        name: data.name,
        type: "create",
        bearId: uuid,
        timestamp: new Date()
    }),
    update: (bearId, data) => new BearEvent({
        name: data.name,
        type: "update",
        bearId: bearId,
        timestamp: new Date()
    })
};

module.exports.eventFactories = eventFactories;