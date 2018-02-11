const { Schema } = require('mongoose');

const schema = Schema({
  username: String,
  password: String
});

schema.methods = {
  log() {
    console.log(`new account ${this.username}`);
  }
};

module.exports = schema;
