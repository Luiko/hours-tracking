import React, { Component } from 'react';

const START = 'Start';
const PAUSE = 'Pause';
const CONTINUE = 'Continue';
let timer;

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
    this.state = {
      name: START,
      dayHours: 0,
      weekHours: 0,
      remainingTime: 0
    };
    this.click = this.click.bind(this);
    this.setTimer = this.setTimer.bind(this);
  }

  setTimer() {
    timer = setInterval(function () {
      if (this.state.remainingTime > 0) {
        this.setState(prevState => ({ 
          remainingTime: prevState.remainingTime - 1
        }));
      }
    }.bind(this), 1000);
  }

  click() {
    const { name } = this.state;
    if (name === START) {
      this.setState({ name: PAUSE, remainingTime: 60 * 60 });
      this.setTimer();
    } else if (name === PAUSE) {
      this.setState({ name: CONTINUE });
      clearInterval(timer);
    } else if (name === CONTINUE) {
      this.setState({ name: PAUSE });
      this.setTimer();
    } else {
      throw 'This error should never happend';
    }
  }

  componentDidUpdate() {
    if (this.state.name === PAUSE && !this.state.remainingTime) {
      this.setState(function (prevState) {
        return {
          remainingTime: 60 * 60,
          dayHours: prevState.dayHours + 1,
          weekHours: prevState.weekHours + 1
        };
      });
    }
  }

  render() {
    return (<main>
      <button onClick={this.click}>{this.state.name}</button>
      <div id="record">
        <label htmlFor="dayhours">Horas del día completadas</label>
        <input readOnly type="number" id="dayhours" value={this.state.dayHours}/><br/>
        <label htmlFor="weekhours">Horas de la semana completadas</label>
        <input readOnly type="number" id="weekhours" value={this.state.weekHours}/><br/>
        <label htmlFor="remainingtime">Tiempo restante de hora de trabajo</label>
        <input readOnly type="text" id="remainingtime" value={convertStoM(this.state.remainingTime)}/>
      </div>
    </main>);
  }
}

export default App;
