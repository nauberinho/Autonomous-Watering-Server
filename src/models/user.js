'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var Plant = require('./../models/plant.js');

/*   User(username, password) > [station](name, id) > [Plants](name, id, slot) > [Measurements](time, value)   */

var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  stations: [
      {
          name: {type: String, required: true},
          key: {type: String, required: true},
          plants: [
              {
                  name: {type: String, required: true},
                  imgUrl: {type: String, required: false},
                  category: {type: String, required: false},
                  description: {type: String, required: false},
                  slot: {type: Number, required: false},
                  date: {type: Date, default: new Date()},
                  humidity_measurements: [
                          {
                                value: {type: Number, default: 0.5},
                                date: {type: String, default: "2017-11-22T10:19:43"}
                          },
                      { value: 0.5, date: "2017-11-22T10:19:43" }
                  ]
              }
          ],
          settings: {
              measure_humidity: {type: String, required: true, default: "10"}
          }
      }
  ]
});


var User = module.exports = mongoose.model('User', userSchema);

/*********--------SYSTEM/AUTHENTICATION FUNCTIONS----************/

    /*****----ADD A USER----******/
    module.exports.addUser = (payload, callback) => {
        var username = payload.username;
        var password = payload.password;
        /* User.findOne({username:username}, (err, user) => {
          if(user) {callback('User already exists')}
        }) */
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if(!err) {
                password = hash;
                var newUser = new User();
                User.create(newUser, callback)
                newUser.username = username;
                newUser.password = password;
                //newUser.save();
            } else {console.log(err)};
        });
    };

    /*****----LOG IN USER----******/
    module.exports.loginUser = (payload, callback) =>  {
        User.findOne({username:payload.username}, (err, user) => {
            if(user) {
                bcrypt.compare(payload.password, user.password, (err, res) => {
                    if(res) {
                        console.log('Password matched stored hash. \nLogging in.')
                        // Create sessions
                    } else {
                        console.log('Password did not match stored hash. \nTry again.')
                    }
                });
            } else {
                console.log('User ' + payload.username + ' could not be found.');
            }
        });
    };

    /*****----RETURN USERS----******/
    module.exports.getUsers = (payload, callback) =>   {
        console.log('get users')
        User.find(callback);
    }

    /*****----REMOVE ONE USER----******/
    module.exports.removeUser = (payload, callback) => {
        User.findByIdAndRemove(
            {_id:payload.id},
            callback
        );
    };


/********************----USER FUNCTIONS-------****************************/

    /*************----STATION FUNCTIONS----*************/

        /*****----RETURN USERS STATIONS----******/
        module.exports.getStations = (payload, callback) => {
          var username = payload.user.username;
          User.findOne({username:username}, (err, user) => {
            if(user) {
              if(user.stations !== null || user.stations.length === 0) {
                callback(null, user.stations)
              } else {
                callback(null, 'User has no stations, or the stations directory is prohibited.')
              }
            } else {
              callback(null, 'User could not be found.');
            }
          })
        };

        /*****----RETURN ONE STATION----******/
        module.exports.getOneStation = (payload, callback) => {
            var username = payload.user.username;
            var stationName = payload.station.name;
            User.findOne({username:username}, (err, user) => {
                if(user) {
                    if(user.stations !== null || user.stations.length === 0) {
                        for(var station in user.stations){
                            if(user.stations[station].name === stationName){
                                callback(null, user.stations[station]);
                            }
                        }
                    } else {
                        callback(null, 'User has no stations, or the stations directory is prohibited.')
                    }
                } else {
                    callback(null, 'User could not be found.');
                }
            })
        };

        /*****----ADD A STATION TO USER----******/
        module.exports.addStation = (payload, callback) => {
              var stationToAdd = payload.station;
              var username = payload.user.username;
            User.findOne({username: username}, (err, user) => {
                let filteredStations = user.stations.filter((filterStation) => {
                    return filterStation.name === stationToAdd.name
                });
                if(filteredStations.length === 0){
                    user.stations.push(stationToAdd);
                    User.findOneAndUpdate({username: username}, {$set: user}, (err, user) =>
                    {
                        //RETURN SOMETHING
                    });
                }
                else{
                    callback('Station already exists', user)
                }
            })
        };

        /*****----UPDATE A STATION----******/
        module.exports.updateStation = (payload, callback) => {
            var updatedStation = payload.station;
            var username = payload.user.username;
            console.log('asdsfsdfsdf')
            User.findOne({username: username}, (err, user) => {
                if(user) {
                    console.log(user, '=sersdjfgkhsdgf')
                    let stations = user.stations;
                    for(var station in user.stations){
                        console.log(station)
                        if(user.stations[station].name === updatedStation.name){

                            stations[station] = updatedStation;
                        }
                        user.stations = stations;
                    }
                    User.findOneAndUpdate({username: username}, {$set: user}, (err, user) =>
                    {
                        User.findOne({username: username}, callback(null, user.stations));
                    })
                }
            })
        };

        /*****----DELETE ONE STATION----******/
        module.exports.deleteOneStation = (payload, callback) => {
            var username = payload.user.username;
            let stationName = payload.station.name;
            User.findOne({username: username}, (err, user) => {
                if(user) {
                    console.log(user, '=sersdjfgkhsdgf');
                    let stations = user.stations;
                    for(var station in user.stations){
                        console.log(station)
                            stations = user.stations.filter((station) => {
                                return station.name !== stationName;
                            })
                            user.stations = stations;
                    }
                    User.findOneAndUpdate({username: username}, {$set: user}, (err, user) =>
                    {
                        User.findOne({username: username}, callback(null, user.stations));
                    })
                };
            })
        };


    /*************----PLANT FUNCTIONS----*************/

    /*****----ADD A PLANT TO A STATION----******/
    module.exports.addPlant = (payload, callback) => {
        User.findOne({username: payload.user.username}, (err, user) => {
            let stations = user.stations;
            let plantToAdd = payload.plant;
            for(var station in user.stations){
              if(user.stations[station].name === payload.station.name){
                  user.stations[station].plants.push(plantToAdd);
              }
            }
        User.findOneAndUpdate({username: payload.user.username}, {$set: user}, callback);
    })
    };

    /*****----REMOVE A PLANT----******/
    module.exports.removeOnePlant = (payload, callback) => {
        let plantName = payload.plant.name;
        let stationName = payload.station.name;
        let username = payload.user.username;
        User.findOne({username: username}, (err, user) => {
            let stations = user.stations;
            for(let station in stations){
                if(stations[station].name === stationName){
                    stations = stations[station].plants.filter((plant) => {
                                return plant.name !== plantName;
                    });
                    user.stations[station].plants = stations;
                }
            }
            User.findOneAndUpdate({username: payload.user.username}, {$set: user}, (err, user) => {
                User.findOne({username: username}, callback(null, user.stations));
            })
        })
    };

/********************----CHIP FUNCTIONS-------****************************/

    module.exports.chipInitializeStation = (payload, callback) =>  {
        User.find({"stations":{"$elemMatch":{"key": payload.station.key}}},
            (err, success) => {
                if(success){
                    for(var station in success.stations) {
                        if (station.key === payload) {
                            callback(success.stations[station]);
                        }
                    }
                }
            }
        )
    };

    module.exports.chipGetStation = (payload, callback) =>  {
        User.find({"stations":{"$elemMatch":{"key": payload.key}}},
            (err, success) => {
            var user = success [0];
                if(success){
                    for(var station in success[0].stations) {
                        if (success[0].stations[station].key === payload.key) {
                            callback(success[0].stations[station])
                        }
                    }
                }
            }
        )
    }


