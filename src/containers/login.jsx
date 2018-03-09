import React, { Component } from 'react';

class Login extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <main>
        <h2>Iniciar Sesión</h2>
        <form action="/login" method="post">
          <label htmlFor="username">Nombre de Usuario</label><br/>
          <input required type="text" id="username" name="username"/><br/>
          <label htmlFor="password">Constraseña</label><br/>
          <input required type="password" id="password" name="password"/><br/>
          <input type="submit" value="Iniciar Sesión"/>
        </form>
      </main>
    );
  }
}

export default Login;
