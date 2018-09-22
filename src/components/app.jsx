import React, { Component } from 'react';
import Alert from './alert';
import PropTypes from 'prop-types';

class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (<main>
      <h2 className="center">Horas Contadas</h2>
      <div id="record" className="pad-container">
        <button className="main-button sans" aria-label="Botón principal"
                                        onClick={this.props.handleClick}>
          {this.props.btnName}
        </button>
        <label className="separate" htmlFor="dayhours">
          Horas del día completadas
        </label><br/>
        <input className="textbox separate right-align" readOnly
          id="dayhours"
          value={this.props.dayHours}/><br/>
        <label className="separate" htmlFor="weekhours">
          Horas de la semana completadas
        </label><br/>
        <input className="textbox separate right-align" readOnly
          id="weekhours"
          value={this.props.weekHours}/><br/>
        <label className="separate" htmlFor="remainingtime">
          Tiempo restante de hora de trabajo
        </label><br/>
        <input className="textbox separate right-align" readOnly
          id="remainingtime"
          value={convertStoM(this.props.remainingTime)}/><br/>
        <Alert close={this.props.closeAlert} type="error"
          handleClick={this.props.handleAlertClick}>{this.props.error}</Alert>
      </div>
    </main>);
  }
}

App.propTypes = {
  handleClick: PropTypes.func.isRequired,
  btnName: PropTypes.string.isRequired,
  dayHours: PropTypes.number.isRequired,
  weekHours: PropTypes.number.isRequired,
  remainingTime: PropTypes.number.isRequired,
  closeAlert: PropTypes.bool.isRequired,
  handleAlertClick: PropTypes.func.isRequired,
};

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
