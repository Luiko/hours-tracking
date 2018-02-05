import React, { Component } from 'react';

class Signup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <main>
        <form action="/login" method="post">
        <label htmlFor="username">Nombre de Usuario</label>
        <input type="text" id="username" name="username"/>
        <label htmlFor="email">Nombre de Usuario</label>
        <input type="email" id="email" name="email"/>
        <label htmlFor="password">Constraseña</label>
        <input type="text" id="password" name="password"/>
        <label htmlFor="repeatpassword">Repetir Constraseña</label>
        <input type="text" id="repeatpassword" name="repeatpassword"/>
        <input type="submit" value="Registarte"/>
        </form>
      </main>
    );
  }
}

export default Signup;
