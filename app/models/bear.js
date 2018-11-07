const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BearSchema = new Schema({
    bearId: String,
    name: String,
    timestamp: String
});

module.exports.Bear = mongoose.model('Bear', BearSchema);


const eventProcessors = {
    create: async (model, event) => {
        model.bearId = event.bearId;
        model.name = event.name;
        model.timestamp = event.timestamp;
        return model;
    }
};

module.exports.eventProcessors = eventProcessors;