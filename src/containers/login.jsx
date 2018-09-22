import React, { Component } from 'react';
import Alert from '../components/alert';
import { post, CancelToken } from 'axios';
import { Redirect } from 'react-router-dom';
import { START, CONTINUE, BTN } from '../locales/main-button';
import PropTypes from 'prop-types';
import { hour } from '.';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', password: '', closeAlert: true, auth: false, error: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.request = CancelToken.source();
    this.cancel_msg = 'Unmounting login component';
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
          <input className="textbox separate" required type="text"
                value={this.state.username} name="username"
                onChange={this.handleInput}
                ref={(input) => {this.firstTextInput = input}}
          /><br/>
          <label className="separate" htmlFor="password">Constraseña</label><br/>
          <input className="textbox separate" required type="password"
                value={this.state.password} name="password"
                onChange={this.handleInput}
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

  componentWillUnmount() {
    this.request.cancel(this.cancel_msg);
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const { username, password } = this.state;
    const date = new Date();
    this.setState({ closeAlert: true, error: "" }); //reset alert
    post('/login', {
      username, password, date,
      diff: date.getTimezoneOffset() * -1
    }, { cancelToken: this.request.token })
      .then(function (response) {
        if (response.data.type === 'info') {
          const { username, dayHours, weekHours, remainingTime } = response.data;
          const state = { username, dayHours, weekHours, remainingTime };
          state.btnName = remainingTime % hour ? BTN(CONTINUE) : BTN(START);
          this.props.auth(state);
          this.setState({ auth: true });
          return;
        }
        throw 'this should not happend 0';
      }.bind(this))
      .catch(function ({ response, message }) {
        this.textInput.focus();
        if (response) {
          const { data } = response;
          if (data && data.type === 'error') {
            const { payload } = data;
            this.setState({ error: payload, closeAlert: false, password: '' });
          }
        } else if (message === this.cancel_msg) {
          console.info(message);
        } else {
          this.setState({ error: message, closeAlert: false, password: '' });
        }
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
