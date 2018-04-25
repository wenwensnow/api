module.exports = (app) => {

    var User = require('../models/user'),
        jwt = require('jsonwebtoken'),
        File = require('../models/file'),
        serialization = require('../middlewares/serialization')

    app.get('/api/auth/setup', function(req, res) {

        // create a sample user
        var nick = new User({
            name: 'test',
            password: '123',
        });

        // save the sample user
        nick.save(function(err) {
            if (err) throw err;

            console.log('User saved successfully');
            res.json({ success: true });
        });
    });

    app.get('/api/file/setup', function(req, res) {

            // create a sample user
            var file = new File({
                owner: 'hey',
                name: "myfile.txt",
                size: 150000,
                ino: 05123523156
            });

            // save the sample user
            file.save(function(err) {
                if (err) throw err;

                console.log('File added successfully');
                res.json({ success: true });
            });

    });

    app.get('/api/serialize', function(req, res) {
        console.log("hello".hashCode())
        console.log("hello".hashCode())
        console.log("12345645dlmfjmsldjfmkljsdmjfmldksdkj_dq@@@@".hashCode())

        console.log(")))))))))))sdkj_dq@@@@".hashCode())
        console.log(")))))))))))))))))))))))))))sdkj_dq@@@@".hashCode())
        console.log(")))))))))))))))))))))))))))))))))))))))))))))))sdkj_dq@@@@".hashCode())
        res.json({ success: true });
    });


}
