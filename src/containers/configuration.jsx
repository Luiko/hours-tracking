import React from 'react';
import Alert from "../components/alert";
import { put, CancelToken } from 'axios';

class Configuration extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      newPassword: '',
      repeatNewPassword: '',
      type: '',
      content: '',
      closeAlert: true
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.request = CancelToken.source();
    this.cancel_msg = 'Unmounting configuration component';
  }

  render() {
    return (<main>
      <h2 className="center">Ajustes</h2>
      <form className="pad-container expand" action="" onSubmit={this.handleSubmit}>
        <fieldset>
          <legend>Cambiar Contraseña</legend>
          <label className="separate" htmlFor="password">
                Contraseña Anterior</label><br/>
          <input className="textbox separate" id="password" type="password"
            ref={(input) => {this.password = input;}}
            onChange={this.handleInput} value={this.state.password}/><br/>
          <label className="separate" htmlFor="newPassword">
                Nueva Contraseña</label><br/>
          <input className="textbox separate" id="newPassword" type="password"
            ref={(input) => {this.newPassword = input;}}
            onChange={this.handleInput} value={this.state.newPassword}/><br/>
          <label className="separate" htmlFor="repeatNewPassword">
                Repetir Nueva Contraseña</label><br/>
          <input className="textbox separate" id="repeatNewPassword" type="password"
            onChange={this.handleInput}
            value={this.state.repeatNewPassword}/><br/>
          <input className="separate left-margin" type="submit" value="Cambiar"/>
        </fieldset>
        <Alert close={this.state.closeAlert} type={this.state.type}
          handleClick={() => this.setState({ closeAlert: true })}>
              {this.state.content}
        </Alert>
      </form>
    </main>);
  }

  componentWillUnmount() {
    this.request.cancel(this.cancel_msg);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { password, newPassword, repeatNewPassword } = this.state;
    this.setState({ closeAlert: true });
    if (!password || !newPassword || ! repeatNewPassword) {
      this.setState({
        type: 'error', content: 'insert valid fields', closeAlert: false
      });
      return;
    } else if (newPassword !== repeatNewPassword) {
      this.setState({
        type: 'error', content: 'repeat the same password', closeAlert: false,
        newPassword: '', repeatNewPassword: ''
      });
      this.newPassword.focus();
      return;
    }
    put('/password',
      { password, newPassword }, { cancelToken: this.request.token }
    )
      .then((response) => {
        this.setState({
          type: 'info', content: response.data.payload, closeAlert: false,
          password: '', newPassword: '', repeatNewPassword: ''
        });
      })
      .catch(({ message, response }) => {
        if (response && response.data && response.data.type
        && response.data.payload) {

          this.setState({
            type: 'error', content: response.data.payload, closeAlert: false,
            password: ''
          });
          this.password.focus();
        } else if (message === this.cancel_msg) {
          console.info(message);
        } else {
          console.error(message);
        }
      })
    ;
  }
  
  handleInput(e) {
    const { id, value } = e.target
    this.setState({ [id]: value });
  }
}

export default Configuration
