const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BearSchema = new Schema({
    bearId: String,
    name: String,
    timestamp: String
});

BearSchema.index({bearId: 1});

module.exports.Bear = mongoose.model('Bear', BearSchema);


const eventProcessors = {
    create: async (model, event) => {
        model.bearId = event.bearId;
        model.name = event.name;
        model.timestamp = event.timestamp;
        return model;
    },
    update: async (model, event) => {
        model.name = event.name;
        model.timestamp = event.timestamp;
        return model;
    }
};

module.exports.eventProcessors = eventProcessors;