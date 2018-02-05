import React, { Component } from 'react';

class Login extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <main>
        <form action="/login" method="post">
        <label htmlFor="username">Nombre de Usuario</label>
        <input type="text" id="username" name="username"/>
        <label htmlFor="password">Constraseña</label>
        <input type="text" id="password" name="password"/>
        <input type="submit" value="Iniciar Sesión"/>
        </form>
      </main>
    );
  }
}

export default Login;
