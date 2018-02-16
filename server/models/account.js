const { Schema } = require('mongoose');

const schema = Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w\.]+@[a-z]+\.[a-z]+$/i
  },
  password: {
    type: String,
    required: true

  }
}, {
  timestamps: true
});

schema.methods = {
  log() {
    console.log(`new account ${this.username}`);
  }
};

module.exports = schema;
