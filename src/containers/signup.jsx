import React, { Component } from 'react';
import { post } from 'axios';
import { Redirect } from 'react-router-dom';
import Alert from './alert';

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
  }

  render() {
    if (this.props.username) {
      return <Redirect to="/" />
    }
    return (
      <main>
        <h2 className="center">Registarte</h2>
        <form className="pad-content" action="/signup" method="post" onSubmit={this.handleSubmit}>
          <label className="separate" htmlFor="username">Nombre de Usuario</label><br/>
          <input className="separate" required type="text" id="username"
            name="username" ref={(input) => {this.firstTextInput = input}}
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
          <Alert close={this.state.closeAlert} type="error"
            handleClick={() => this.setState({ closeAlert: true })}>
                {this.state.error}
          </Alert>
          <Alert close={this.state.closeAlertNote} type="note"
            handleClick={() => this.setState({ closeAlertNote: true })}>
            Actualmente dejamos de pedir correo electrónico en el registro.
          </Alert>
          <input className="separate left-margin" type="submit"
                  value="Registarte" onInput={this.handleInput}/>
        </form>
      </main>
    );
  }

  componentDidMount() {
    this.firstTextInput.focus();
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.password !== this.state.repeatpassword) {
      this.setState({
        error: 'repeat the same password', closeAlert: false
      });
      return;
    }
    post('/signup', this.state)
      .then(function ({ data: username }) {
        this.props.auth({ username });
      }.bind(this))
      .catch(function (err) {
        if (err.response && err.response.data === 11000) {
          this.setState({
            error: 'duplicated key: we already have the same username', closeAlert: false
          });
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

export default Signup;
