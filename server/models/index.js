const mongoose = require('mongoose');
const accountSchema = require('./account');
const Bcrypt = require('bcrypt');
const moment = require('moment');
require('dotenv').config();
const {
        reduceIterationToDay, reduceDaySeconds,
        iterationToWeek, iterationsToWeekSeconds } = require('./_index');

const db = mongoose.connection;
db.on('error', () => console.error('connection error'));
db.once('open', function () {
  console.log('mongoose connection');
});

const Account = mongoose.model('Account', accountSchema);
mongoose.connect(process.env.STR_DB_CON);

async function addAccount(email, username, password) {
  const hash = await Bcrypt.hash(password.toString(), 14);
  const account = new Account({ username, email, password: hash });
  const process = await account.save();
  process.log();
};

async function getUsers() {
  const users = await Account.find({}, {
    _id: 0, __v: 0,
    iterations: 0, createdAt: 0, updatedAt: 0 
  });
  return users.reduce(function (prev, curr) {
    prev[curr.username] = curr;
    return prev;
  }, {});
};

function closeConnection() {
  mongoose.connection.close();
};

function addIteration(username, iteration) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, user) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      if (user) {
        user.iterations.push(iteration);
        resolve(user.save());
      } else {
        reject({ message: `${username} not found`, statusCode: 404 });
      }
    });
  });
};

function getDaySeconds(username, clientDate) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, account) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const dayIterations = reduceIterationToDay(account.iterations, clientDate);
      const secondsDay = reduceDaySeconds(dayIterations, clientDate);
      resolve(secondsDay);
    });
  });
};

function deleteUser(username) {
  return new Promise(function (resolve, reject) {
    Account.deleteOne({ username }, function (err) {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      resolve();
    });
  });
};

function getWeekSeconds(username, clientDate) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, user) {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }

      try {
        const m = moment(clientDate);
        const weekStart = moment(clientDate).startOf('week');
        const weekEnd = moment(clientDate).endOf('week');
        const _iterationToWeek = function (data, index, array) {
          return iterationToWeek(data, index, array, m);
        };
        const _iterationsToWeekSeconds = function (data, index, array) {
          return iterationsToWeekSeconds(
                                    data, index, array, weekStart, weekEnd, m);
        };
        const weekIterations = user.iterations.filter(function () {
          return _iterationToWeek;
        });
        const weekSeconds = weekIterations.reduce(_iterationsToWeekSeconds, 0);
        resolve(weekSeconds);
      } catch (err) {
        console.error(err.message);
        reject(err);
      }
    });
  });
};

module.exports = {
  addAccount, getUsers, closeConnection,
  addIteration, getDaySeconds, deleteUser,
  getWeekSeconds
};
