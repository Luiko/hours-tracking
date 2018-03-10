import React, { Component } from 'react';

class Login extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <main>
        <h2 className="center">Iniciar Sesión</h2>
        <form className="pad-content" action="/login" method="post">
          <label className="separate" htmlFor="username">Nombre de Usuario</label><br/>
          <input className="separate" required type="text" id="username" name="username"/><br/>
          <label className="separate" htmlFor="password">Constraseña</label><br/>
          <input className="separate" required type="password" id="password" name="password"/><br/>
          <input className="separate left-margin" type="submit" value="Iniciar Sesión"/>
        </form>
      </main>
    );
  }
}

export default Login;
