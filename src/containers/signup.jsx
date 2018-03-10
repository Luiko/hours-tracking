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

  render() {
    if (this.props.username) {
      return <Redirect to="/" />
    }
    return (
      <main>
        <h2 className="center">Registarte</h2>
        <form className="pad-content" action="/signup" method="post" onSubmit={this.handleSubmit}>
          <label className="separate" htmlFor="email">Email</label><br/>
          <input className="separate" required type="email" id="email" name="email"
            value={this.state.email} onInput={this.handleInput}
          /><br/>
          <label className="separate" htmlFor="username">Nombre de Usuario</label><br/>
          <input className="separate" required type="text" id="username" name="username"
            value={this.state.username} onInput={this.handleInput}
          /><br/>
          <label className="separate" htmlFor="password">Constraseña</label><br/>
          <input className="separate" required type="password" id="password" name="password"
            value={this.state.password} onInput={this.handleInput}
          /><br/>
          <label className="separate" htmlFor="repeatpassword">Repetir Constraseña</label><br/>
          <input className="separate" required type="password" id="repeatpassword"
            name="repeatpassword" value={this.state.repeatpassword}
            onInput={this.handleInput}
          /><br/>
          <input className="separate left-margin" type="submit" value="Registarte" onInput={this.handleInput}/>
        </form>
      </main>
    );
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
}

export default Signup;
