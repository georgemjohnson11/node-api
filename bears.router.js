// Bear models lives here
var {Bear, eventProcessors} = require('./app/models/bear');
var BearEvent = require('./app/models/bearEvent');
var uuid = require('uuid/v4');

exports.createBearsRoute = (router) => {
    // on routes that end in /bears
    // ----------------------------------------------------
    router.route('/bears')

        // create a bear (accessed at POST http://localhost:8080/bears)
        .post(async (req, res) => {
                try {
                    // create a new instance of the BearEvent model
                    let bearEvent = new BearEvent({
                        name: req.body.name,
                        type: "create",
                        bearId: uuid(),
                        timestamp: new Date()
                    });

                    await bearEvent.save();

                    // let's write our first read cache model:
                    let newBear = {};
                    newBear = await eventProcessors.create(newBear, bearEvent);
                    const bear = await new Bear(newBear).save();
                    res.json(bear);

                } catch (err) {
                    console.error("An error occurred while trying to save the event. ", err);
                    res.send(err);
                }
            }
        )

        // get all the bears (accessed at GET http://localhost:8080/api/bears)
        .get(function (req, res) {
            Bear.find(function (err, bears) {
                if (err)
                    res.send(err);

                res.json(bears);
            });
        });

    // on routes that end in /bears/:bear_id
    // ----------------------------------------------------
    router.route('/bears/:bear_id')
        // get the bear with that id
        .get(function (req, res) {
            Bear.findById(req.params.bear_id, function (err, bear) {
                if (err)
                    res.send(err);
                res.json(bear);
            });
        })

        // update the bear with this id
        .put(function (req, res) {
            Bear.findById(req.params.bear_id, function (err, bear) {

                if (err)
                    res.send(err);

                bear.name = req.body.name;
                bear.save(function (err) {
                    if (err)
                        res.send(err);

                    res.json({message: 'Bear updated!'});
                });

            });
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

};