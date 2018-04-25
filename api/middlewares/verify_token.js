var jwt = require('jsonwebtoken');
var config = require('../../config/config');

function verifyToken(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // 1 check token else return
    if(!token){
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }

    // 2 checkif secret token was validate via jwverify
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          console.log('Failed to authenticate token.')
          return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
        } else {
            req.decoded = decoded;

        /*    if(req.params.user == decoded.name) {
              console.log("test")
          }*/

            next();
        }
    });

}

module.exports = verifyToken;
