import React, { Component } from 'react';

class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      close: !!props.close
    };
  }
  render() {
    return (
      <div className={"note separate" + (!this.state.close? "" : " close")}>
        <span className="note-closer" aria-label="boton cerrar nota"
              onClick={() => this.setState({ close: true })}>&#x26DD;</span>
        <p><strong>Nota:</strong></p>
        <p className="text">
          Actualmente dejamos de pedir correo electronico en el registro,
          durante el desarrollo temprano de la app.
        </p>
      </div>);
  }
}

export default Alert;
