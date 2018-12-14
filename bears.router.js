// Bear models lives here
var {Bear, eventProcessors} = require('./app/models/bear');
var {BearEvent, eventFactories} = require('./app/models/bearEvent');
var uuid = require('uuid/v4');

let processNewEvent = async function (baseModel, bearEvent) {
    let updatedModel = await eventProcessors[bearEvent.type](baseModel, bearEvent);
    return await new Bear(updatedModel).save();
};

let processUpdateEvent = async function (bearId, bearEvent) {
    let currentBear = (await Bear.findOne({bearId: bearId})) || new Bear({bearId});
    currentBear = await eventProcessors[bearEvent.type](currentBear, bearEvent);
    return await currentBear.save();
};
exports.createBearsRoute = (router) => {
    // on routes that end in /bears
    // ----------------------------------------------------
    router.route('/bears')

        // create a bear (accessed at POST http://localhost:8080/bears)
        .post(async (req, res) => {
            try {
                // create a new instance of the BearEvent model
                let bearEvent = eventFactories.create(uuid(), req.body);

                await bearEvent.save();

                // let's write our first Read Cache Model:
                let newBear = {};
                const bear = await processNewEvent(newBear, bearEvent);

                res.json(bear);

            } catch (err) {
                console.error("An error occurred while trying to save the event. ", err);
                res.send(err);
            }
        })

        // get all the bears (accessed at GET http://localhost:8080/api/bears)
        .get(async (req, res) => {
            try {

                res.json(await Bear.find());

            } catch (err) {
                console.error("An error occurred getting a Bear", err);
                return res.send(err);
            }
        });

    // on routes that end in /bears/:bear_id
    // ----------------------------------------------------
    router.route('/bears/:bear_id')
        // get the bear with that id
        .get(async (req, res) => {
            try {
                let bear = await Bear.findOne({bearId: req.params.bear_id});
                res.json(bear);
            } catch (err) {
                console.error("An error occurred while reading that Bear", err);
                res.send(err);
            }
        })

        // update the bear with this id
        .put(async (req, res) => {
            try {
                const bearId = req.params.bear_id;

                if (!bearId) {
                    console.warn("no bearId given");
                    return res.status(400).send("Please provide a bearId in your url")
                }

                // create a new instance of the BearEvent model using a factory
                let bearEvent = eventFactories.update(bearId, req.body);
                await bearEvent.save();

                // let's update our Read Cache Model:
                let currentBear = await processUpdateEvent(bearId, bearEvent);

                res.json(currentBear);

            } catch (err) {
                console.error("An error occurred while trying to save the event. ", err);
                res.send(err);
            }

        })

        // delete the bear with this id
        .delete(function (req, res) {
            Bear.remove({
                _id: req.params.bear_id
            }, function (err, bear) {
                if (err)
                    res.send(err);

                res.json({message: 'Successfully deleted'});
            });
        });

    router.route('/bears/:bear_id/refresh')
        .post(async (req, res) => {
            try {
                const bearId = req.params.bear_id;

                // get all the related Bear events
                const events = await BearEvent.find({bearId}).sort({timestamp: 1});

                // create a new Bear model to work with
                let model = new Bear({bearId});
                for (let event of events) {
                    model = await eventProcessors[event.type](model, event.toJSON());
                }
                // Save the new model
                await model.save();

                // remove old models
                await Bear.remove({bearId, _id: {$ne: model._id}});

                // send response to the client
                res.send(model);

            } catch (err) {
                console.error(`An error occurred while trying to refresh the bear ${req.params.bear_id}.`, err);
                return res.send("An error occurred");
            }
        });
};