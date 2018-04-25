module.exports = (app) => {

    var User = require('../models/user'),
        jwt = require('jsonwebtoken')

    app.post('/api/auth/login', (req, res) => {
        // find the user
        User.findOne({name: req.body.name}, function(err, user) {

            console.log("Finding user: " + req.body.name)

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                // check if password matches
                console.log(user.password)
                console.log(req.body.password)

                if (user.password != req.body.password) {
                  res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {
                      // if user is found and password is right
                      // create a token with only our given payload
                    // we don't want to pass in the entire user since that has the password
                    const payload = {
                        name: user.name
                    }

                    var token = jwt.sign(payload, app.get('superSecret'), { expiresIn: 60*60*24 })

                    // return the information including token as JSON
                    res.json({success: true, message: 'Enjoy your token!', token: token})
                }
            }
        })
    })
}
