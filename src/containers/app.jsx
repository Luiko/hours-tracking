import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (<main>
      <div id="record">
      <label htmlFor="dayhours">Horas del día completadas</label>
      <input type="number" id="dayhours"/>
      <label htmlFor="weekhours">Horas de la semana completadas</label>
      <input type="number" id="weekhours"/>
      <label htmlFor="remainingtime">Tiempo restante de hora de trabajo</label>
      <input type="time" id="remainingtime"/>
      </div>
      <button>Start</button>
    </main>);
  }
}

export default App;
