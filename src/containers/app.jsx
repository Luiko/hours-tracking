import React, { Component } from 'react';

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

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.props.tickUpdate();
  }

  render() {
    return (<main>
      <h1>Horas Contadas</h1>
      <button aria-label="Botón principal" onClick={this.props.handleClick}>{this.props.btnName}</button>
      <div id="record">
        <label className="separate" htmlFor="dayhours">Horas del día completadas</label>
        <input className="separate" readOnly type="number" id="dayhours" value={this.props.dayHours}/>
        <label className="separate" htmlFor="weekhours">Horas de la semana completadas</label>
        <input className="separate" readOnly type="number" id="weekhours" value={this.props.weekHours}/>
        <label className="separate" htmlFor="remainingtime">Tiempo restante de hora de trabajo</label>
        <input className="separate" readOnly type="text" id="remainingtime" value={convertStoM(this.props.remainingTime)}/>
      </div>
    </main>);
  }
}

export default App;
