import React, { Component } from 'react';
import { post } from 'axios';
import { Redirect } from 'react-router-dom';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      repeatpassword: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.password !== this.state.repeatpassword) {
      console.log('repeat the same password');
      return;
    }
    post('/signup', this.state)
      .then(function ({ data: username }) {
        this.props.auth(username);
      }.bind(this))
      .catch(function (err) {
        if (err.response.data === 11000) {
          console.error('duplicated key: we already have the same username or email')
        } else {
          console.error(err);
        }
      })
    ;
  }

  handleInput(e) {
    const { target } = e;
    this.setState({ [target.name]: target.value });
  }

  render() {
    if (this.props.username) {
      return <Redirect to="/" />
    }
    return (
      <main>
        <h1>Registarte</h1>
        <form action="/signup" method="post" onSubmit={this.handleSubmit}>
          <label htmlFor="email">Email</label>
          <input required type="email" id="email" name="email"
            value={this.state.email} onInput={this.handleInput}
          /><br/>
          <label htmlFor="username">Nombre de Usuario</label>
          <input required type="text" id="username" name="username"
            value={this.state.username} onInput={this.handleInput}
          /><br/>
          <label htmlFor="password">Constraseña</label>
          <input required type="password" id="password" name="password"
            value={this.state.password} onInput={this.handleInput}
          /><br/>
          <label htmlFor="repeatpassword">Repetir Constraseña</label>
          <input required type="password" id="repeatpassword"
            name="repeatpassword" value={this.state.repeatpassword}
            onInput={this.handleInput}
          /><br/>
          <input type="submit" value="Registarte" onInput={this.handleInput}/>
        </form>
      </main>
    );
  }
}

export default Signup;
