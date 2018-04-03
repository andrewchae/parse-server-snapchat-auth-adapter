// Helper functions for accessing the Snapchat API.
var https = require('https');
var Parse = require('parse/node').Parse;

function validateAuthToken(id, token) {
    return request("me", token)
        .then((response) => {
            if (response && response.data.me.externalId == id) {
                return;
            }
            throw new Parse.Error(
                Parse.Error.OBJECT_NOT_FOUND,
                'Snapchat auth is invalid for this user.');
        });
}

// Returns a promise that fulfills if this user id is valid.
function validateAuthData(authData) {
    return validateAuthToken(authData.id, authData.access_token).then(() => {
        // Validation with auth token worked
        return;
    });
}

// Returns a promise that fulfills if this app id is valid.
function validateAppId() {
    return Promise.resolve();
}

// A promisey wrapper for api requests
function request(path, token) {
    return new Promise(function(resolve, reject) {
        var req = https.request({
            hostname: "kit.snapchat.com",
            path: "/v1/" + path,
            method: 'POST',
            headers: {
                Authorization: 'bearer ' + token,
                'User-Agent': 'Gif Your Game'
            }
        }, function(res) {
            var data = '';
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                try {
                    data = JSON.parse(data);
                } catch(e) {
                    return reject(e);
                }
                resolve(data);
            });
        }).on('error', function() {
            reject('Failed to validate this access token with Snapchat.');
        });

        req.write(JSON.stringify({ query:"{me{displayName bitmoji{avatar} externalId}}" }));
        req.end();
    });
}

module.exports = {
    validateAppId: validateAppId,
    validateAuthData: validateAuthData
};