const mongoose = require('mongoose');
const accountSchema = require('./account');
const Bcrypt = require('bcrypt');
const moment = require('moment');
require('dotenv').config();

const db = mongoose.connection;
db.on('error', () => console.error('connection error'));
db.once('open', function () {
  console.log('mongoose connection');
});

const Account = mongoose.model('Account', accountSchema);
mongoose.connect(process.env.STR_DB_CON);

exports.addAccount = async function (email, username, password) {
  const hash = await Bcrypt.hash(password.toString(), 14);
  const account = new Account({ username, email, password: hash });
  const process = await account.save();
  process.log();
};

exports.getUsers = async function () {
  const users = await Account.find({}, {
    _id: 0, __v: 0,
    iterations: 0, createdAt: 0, updatedAt: 0 
  });
  return users.reduce(function (prev, curr) {
    prev[curr.username] = curr;
    return prev;
  }, {});
};

exports.closeConnection = function () {
  mongoose.connection.close();
};

exports.addIteration = function (username, iteration) {
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

exports.getDaySeconds = function (username, clientDate) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, account) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const dayIterations = reduceIterationToDay(account.iterations);
      const secondsDay = getDaySeconds(dayIterations);
      resolve(secondsDay);
    });
  });
  function reduceIterationToDay(iterations) {
    return iterations.filter(function ({ start, end }) {
      return isOfThisDay(start, end, clientDate);
    });
  }
  function isOfThisDay(start, end) {
    return moment(clientDate).isSame(start, 'day') ||
      moment(clientDate).isSame(end, 'day');
  }
  function getDaySeconds(iterations) {
    const seconds = (prev, start, end) => prev + moment(end).diff(start, 's');
    return iterations.reduce(function (prev, { start, end }) {
      const monthDay = moment(clientDate).date();
      const diff = moment(clientDate).utcOffset();
      if (moment(start).utcOffset(diff).date() < monthDay) {
        return seconds(prev, moment(clientDate).startOf('day'), end);
      } else if (moment(end).utcOffset(diff).date() > monthDay) {
        return seconds(prev, start, moment(clientDate).endOf('day'));
      }
      return seconds(prev, start, end);
    }, 0);
  }
};


exports.getHoursDay = async function (username, day) {
  const secondsDay = await exports.getDaySeconds(username, day);
  return Math.floor(secondsDay / (60 * 60));
};

exports.deleteUser = function (username) {
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

exports.getWeekSeconds = function (username, clientDate) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, user) {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }

      try {
        var m = moment(clientDate);
        var weekStart = moment(clientDate).startOf('week');
        var weekEnd = moment(clientDate).endOf('week');
        const weekIterations = user.iterations.filter(iterationToWeek);
        const weekSeconds = weekIterations.reduce(iterationsToWeekSeconds, 0);
        resolve(weekSeconds);
      } catch (err) {
        console.error(err.message);
        reject(err);
      }

      function iterationToWeek({ start, end }) {
        return m.isSame(start, 'week') || m.isSame(end, 'week');
      }

      function iterationsToWeekSeconds(prev, { start, end }) {
        const _start = m.isSame(start, 'week')? start: weekStart;
        const _end = m.isSame(end, 'week')? end: weekEnd;
        return prev + (moment(_end).diff(_start, 'seconds'));
      }
    });
  });
};
