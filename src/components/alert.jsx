import React, { Component } from 'react';

class Alert extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { type, close, handleClick, className } = this.props;
    const cname = className? className + ' ' : '';
    const setclose = close? ' close' : '';
    return (
      <div
        className={`${cname}${type} separate${setclose}`}>
        <span className={`${type}-closer`} aria-label="boton cerrar"
              onClick={handleClick}>❎</span>
        <p className="capitalize flat"><strong>{type}:</strong></p>
        <p className="text">{this.props.children}</p>
      </div>);
  }
}

export default Alert;
