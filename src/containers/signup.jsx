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
          <input required type="text" id="username" name="username"/><br/>
          <label htmlFor="email">Email</label>
          <input required type="email" id="email" name="email"/><br/>
          <label htmlFor="password">Constraseña</label>
          <input required type="password" id="password" name="password"/><br/>
          <label htmlFor="repeatpassword">Repetir Constraseña</label>
          <input required type="password" id="repeatpassword" name="repeatpassword"/><br/>
          <input type="submit" value="Registarte"/>
        </form>
      </main>
    );
  }
}

export default Signup;
