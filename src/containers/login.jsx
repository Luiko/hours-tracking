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
          <input required type="text" id="username" name="username"/><br/>
          <label htmlFor="password">Constraseña</label>
          <input required type="password" id="password" name="password"/><br/>
          <input type="submit" value="Iniciar Sesión"/>
        </form>
      </main>
    );
  }
}

export default Login;
