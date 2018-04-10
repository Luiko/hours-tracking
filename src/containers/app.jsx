import React, { Component } from 'react';
import Alert from './alert.jsx';

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.props.tickUpdate();
  }

  render() {
    return (<main>
      <h2 className="center">Horas Contadas</h2>
      <button className="main-button sans" aria-label="Botón principal"
                                      onClick={this.props.handleClick}>
        {this.props.btnName}
      </button>
      <div id="record" className="pad-content">
        <label className="separate" htmlFor="dayhours">
          Horas del día completadas
        </label><br/>
        <input className="separate right-align" readOnly id="dayhours"
          value={this.props.dayHours}/><br/>
        <label className="separate" htmlFor="weekhours">
          Horas de la semana completadas
        </label><br/>
        <input className="separate right-align" readOnly id="weekhours"
          value={this.props.weekHours}/><br/>
        <label className="separate" htmlFor="remainingtime">
          Tiempo restante de hora de trabajo
        </label><br/>
        <input className="separate right-align" readOnly id="remainingtime"
          value={convertStoM(this.props.remainingTime)}/><br/>
        <Alert close={this.props.closeAlert} type="error"
          handleClick={this.props.handleAlertClick}>{this.props.error}</Alert>
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
