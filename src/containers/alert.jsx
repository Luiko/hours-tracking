import React, { Component } from 'react';

class Alert extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { type, close, handleClick } = this.props;
    return (
      <div className={`${type} separate ${(!close? "" : "close")}`}>
        <span className={`${type}-closer`} aria-label="boton cerrar"
              onClick={handleClick}>&#x26DD;</span>
        <p className="capitalize flat"><strong>{type}:</strong></p>
        <p className="text">{this.props.children}</p>
      </div>);
  }
}

export default Alert;
