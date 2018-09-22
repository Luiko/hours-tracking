import React, { Component } from 'react';
import { post, CancelToken } from 'axios';
import { Redirect } from 'react-router-dom';
import Alert from '../components/alert';
import PropTypes from 'prop-types';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      repeatpassword: '',
      error: '',
      closeAlert: true,
      closeAlertNote: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.request = CancelToken.source();
    this.cancel_msg = 'Unmounting signup component';
  }

  render() {
    if (this.props.username) {
      return <Redirect to="/" />
    }
    return (
      <main>
        <h2 className="center">Registarte</h2>
        <form className="pad-container" action="/signup" method="post" onSubmit={this.handleSubmit}>
          <label className="separate" htmlFor="username">Nombre de Usuario</label><br/>
          <input className="textbox separate" required type="text" id="username"
            name="username" ref={(input) => {this.firstTextInput = input}}
            value={this.state.username} onChange={this.handleInput}
          /><br/>
          <label className="separate" htmlFor="password">Constraseña</label><br/>
          <input className="textbox separate" required type="password" id="password" name="password"
            value={this.state.password} onChange={this.handleInput}
          /><br/>
          <label className="separate" htmlFor="repeatpassword">Repetir Constraseña</label><br/>
          <input className="textbox separate" required type="password" id="repeatpassword"
            name="repeatpassword" value={this.state.repeatpassword}
            onChange={this.handleInput}
          /><br/>
          <Alert close={this.state.closeAlert} type="error"
            handleClick={() => this.setState({ closeAlert: true })}>
                {this.state.error}
          </Alert>
          <Alert close={this.state.closeAlertNote} type="note"
            handleClick={() => this.setState({ closeAlertNote: true })}>
            Actualmente dejamos de pedir correo electrónico en el registro.
          </Alert>
          <input className="separate left-margin" type="submit"
                  value="Registarte" onChange={this.handleInput}/>
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

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.password !== this.state.repeatpassword) {
      this.setState({
        error: 'repeat the same password', closeAlert: false
      });
      return;
    }
    const { username, password } = this.state;
    this.setState({ closeAlert: true, error: "" }); //reset alert
    post('/signup', { username, password }, { cancelToken: this.request.token})
      .then(function ({ data: username }) {
        this.props.auth({ username });
      }.bind(this))
      .catch(function (err) {
        if (err.response) {
          if (err.response.data === 11000) {
            this.setState({
              error: 'duplicated key: we already have the same username',
              closeAlert: false
            });
          } else {
            this.setState({
              error: err.response.data.message, closeAlert: false
            });
          }
        } if (err.message === this.cancel_msg) {
          console.info(err.message);
        } else {
          this.setState({
            error: err.message, closeAlert: false
          });
        }
      }.bind(this))
    ;
  }

  handleInput(e) {
    const { target } = e;
    this.setState({ [target.name]: target.value });
  }
}

Signup.propTypes = {
  username: PropTypes.string,
  auth: PropTypes.func.isRequired
};

export default Signup;
