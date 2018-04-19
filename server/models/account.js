const mongoose = require('mongoose');
const accountSchema = require('./schemas/account');
const Bcrypt = require('bcrypt');

const Account = mongoose.model('Account', accountSchema);

async function addAccount(username, password) {
  const hash = await Bcrypt.hash(password.toString(), 14);
  const account = new Account({ username, password: hash });
  const process = await account.save();
  process.log();
};

async function getUsers() {
  const users = await Account.find({}, { _id: 0, username: 1, password: 1 });
  return users.reduce(function (prev, curr) {
    prev[curr.username] = curr;
    return prev;
  }, {});
};

async function deleteUser(username) {
  await Account.deleteOne({ username });
};

async function changePassword(username, newPassword) {
  const user = await Account.findOne({ username });
  user.password = await Bcrypt.hash(newPassword.toString(), 14);
  await user.save();
}

module.exports = { addAccount, getUsers , deleteUser, changePassword };
