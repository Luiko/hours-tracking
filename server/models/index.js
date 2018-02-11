const mongoose = require('mongoose');
const accountSchema = require('./account');

const stringConn = 'mongodb://localhost/test';

const db = mongoose.connection;
db.on('error', () => console.error('connection error'));
db.once('open', function () {
  console.log('mongoose connection');
});

const Account = mongoose.model('Account', accountSchema);

exports.addAccount = async function (username, password) {
  try {
    await mongoose.connect(stringConn);
    const account = new Account({ username, password });
    const process = await account.save();
    process.log();
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}

exports.getUsers = async function () {
  try {
    await mongoose.connect(stringConn);
    const users = await Account.find({}, { _id: 0, __v: 0 });
    return users.reduce(function (prev, curr) {
      prev[curr.username] = curr;
      return prev;
    }, {});
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}
