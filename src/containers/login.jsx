import React, { Component } from 'react';
import Alert from './alert.jsx';
import { post } from 'axios';
import { Redirect } from 'react-router-dom';
import { START, CONTINUE } from './index.jsx';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', password: '', closeAlert: true, auth: false, error: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  render() {
    if (this.state.auth) {
      return <Redirect to="/" />;
    }
    const { closeAlert: close, error } = this.state;
    return (
      <main>
        <h2 className="center">Iniciar Sesión</h2>
        <form className="pad-content" action="/login" method="post"
          onSubmit={this.handleSubmit}>
          <label className="separate" htmlFor="username">Nombre de Usuario</label><br/>
          <input className="separate" required type="text"
                value={this.state.username} name="username" onInput={this.handleInput}/><br/>
          <label className="separate" htmlFor="password">Constraseña</label><br/>
          <input className="separate" required type="password"
                value={this.state.password} name="password"
                onInput={this.handleInput}
                ref={(input) => { this.textInput = input; }}
          /><br/>
          <Alert type='error' close={close}
            handleClick={() => this.setState({ closeAlert: true })}>{error}</Alert>
          <input className="separate left-margin" type="submit" value="Iniciar Sesión"/>
        </form>
      </main>
    );
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const { username, password } = this.state;
    const clientDate = new Date();
    post('/login', {
      username, password, clientDate,
      diff: clientDate.getTimezoneOffset() * -1
    })
      .then(function (response) {
        if (response.data.type === 'info') {
          const { username, dayHours, weekHours, remainingTime } = response.data;
          const state = { username, dayHours, weekHours, remainingTime };
          state.btnName = remainingTime % 3600 ? CONTINUE : START;
          this.props.auth(state);
          this.setState({ auth: true });
          return;
        }
        throw 'this should not happend 0';
      }.bind(this))
      .catch(function (err) {
        this.textInput.focus();
        if (err.response) {
          const { data } = err.response;
          if (data && data.type === 'error') {
            const { payload } = data;
            this.setState({ error: payload, closeAlert: false, password: '' });
            return;
          }
        } else {
          this.setState({ error: err.message, closeAlert: false, password: '' });
          return;
        }
        throw 'this should not happend 1';
      }.bind(this))
    ;
  }

  handleInput(ev) {
    this.setState({ [ev.target.name]: ev.target.value });
  }
}

export default Login;
