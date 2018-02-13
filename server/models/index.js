const mongoose = require('mongoose');
const accountSchema = require('./account');
const Bcrypt = require('bcrypt');
require('dotenv').config();

const db = mongoose.connection;
db.on('error', () => console.error('connection error'));
db.once('open', function () {
  console.log('mongoose connection');
});

const Account = mongoose.model('Account', accountSchema);
mongoose.connect(process.env.STR_DB_CON);

exports.addAccount = async function (username, password) {
  try {
    const hash = await Bcrypt.hash(password.toString(), 14);
    const account = new Account({ username, password: hash });
    const process = await account.save();
    process.log();
  } catch (error) {
    console.error(error);
  }
}

exports.getUsers = async function () {
  try {
    const users = await Account.find({}, { _id: 0, __v: 0 });
    return users.reduce(function (prev, curr) {
      prev[curr.username] = curr;
      return prev;
    }, {});
  } catch (error) {
    console.error(error);
  }
}

exports.closeConnection = function () {
  mongoose.connection.close();
}
