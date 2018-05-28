const mongoose = require('mongoose');
const accountSchema = require('./schemas/account');
const Bcrypt = require('bcrypt');

const Account = mongoose.model('Account', accountSchema);

async function addAccount(username, password) {
  const hash = await Bcrypt.hash(password, 14);
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

async function deleteUser(username, password) {
  const user = await Account.findOne({ username }, { password: 1 });
  if (await Bcrypt.compare(password, user.password)) {
    await Account.deleteOne({ username });
    console.info('account', username, 'deleted');
  }
};

async function changePassword(username, newPassword) {
  const user = await Account.findOne({ username });
  user.password = await Bcrypt.hash(newPassword, 14);
  await user.save();
}

module.exports = { addAccount, getUsers , deleteUser, changePassword };
