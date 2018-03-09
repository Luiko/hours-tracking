import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.props.tickUpdate();
  }

  render() {
    return (<main>
      <h2>Horas Contadas</h2>
      <button className="left-margin" aria-label="Botón principal" onClick={this.props.handleClick}>
        {this.props.btnName}
      </button>
      <div id="record" className="pad-content">
        <label htmlFor="dayhours">Horas del día completadas</label><br/>
        <input className="align-content-right" readOnly id="dayhours"
          value={this.props.dayHours}/><br/>
        <label htmlFor="weekhours">Horas de la semana completadas</label><br/>
        <input className="align-content-right" readOnly id="weekhours"
          value={this.props.weekHours}/><br/>
        <label htmlFor="remainingtime">
          Tiempo restante de hora de trabajo
        </label><br/>
        <input className="align-content-right" readOnly id="remainingtime"
          value={convertStoM(this.props.remainingTime)}/><br/>
      </div>
    </main>);
  }
}

export default App;

function twoDigPadding(dig) {
  return dig.toString().length === 1? `0${dig}`: dig;
}

function convertStoM(seconds) {
  let min = Math.floor(seconds / 60);
  seconds %= 60;
  const hour = Math.floor(min / 60);
  min %= 60;
  return `${hour}:${twoDigPadding(min)}:${twoDigPadding(seconds)}`;
}
