import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (<main>
      <button>Start</button>
      <div id="record">
        <label htmlFor="dayhours">Horas del día completadas</label>
        <input readOnly type="number" id="dayhours"/><br/>
        <label htmlFor="weekhours">Horas de la semana completadas</label>
        <input readOnly type="number" id="weekhours"/><br/>
        <label htmlFor="remainingtime">Tiempo restante de hora de trabajo</label>
        <input readOnly type="text" id="remainingtime"/>
      </div>
    </main>);
  }
}

export default App;
