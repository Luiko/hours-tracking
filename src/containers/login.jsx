import React, { Component } from 'react';
import Alert from '../components/alert';
import { post } from 'axios';
import { Redirect } from 'react-router-dom';
import { START, CONTINUE, BTN } from '../locales/main-button';
import PropTypes from 'prop-types';

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
        <form className="pad-container" action="/login" method="post"
          onSubmit={this.handleSubmit}>
          <label className="separate" htmlFor="username">Nombre de Usuario</label><br/>
          <input className="separate" required type="text"
                value={this.state.username} name="username"
                onInput={this.handleInput}
                ref={(input) => {this.firstTextInput = input}}
          /><br/>
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

  componentDidMount() {
    this.firstTextInput.focus();
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const { username, password } = this.state;
    const date = new Date();
    this.setState({ closeAlert: true, error: "" }); //reset alert
    post('/login', {
      username, password, date,
      diff: date.getTimezoneOffset() * -1
    })
      .then(function (response) {
        if (response.data.type === 'info') {
          const { username, dayHours, weekHours, remainingTime } = response.data;
          const state = { username, dayHours, weekHours, remainingTime };
          state.btnName = remainingTime % 3600 ? BTN(CONTINUE) : BTN(START);
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

Login.propTypes = {
  auth: PropTypes.func.isRequired
};

export default Login;
