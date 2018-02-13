import React, { Component } from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import App from './app.jsx';
import About from '../components/about.jsx';
import Login from './login.jsx';
import SingUp from './signup.jsx';

const START = 'Start';
const PAUSE = 'Pause';
const CONTINUE = 'Continue';
let timer;

class HoursTracking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateName: START,
      dayHours: 0,
      weekHours: 0,
      remainingTime: 0
    };
    this.handleClick = this.handleClick.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.tickUpdate = this.tickUpdate.bind(this);
  }

  setTimer() {
    let start = Date.now();
    timer = setInterval(function () {
      if (this.state.remainingTime > 0) {
        const now = Date.now();
        this.setState(prevState => ({
          remainingTime: prevState.remainingTime - Math.floor((now - start) / 1000)
        }));
        start = now;
      }
    }.bind(this), 1000);
  }

  handleClick() {
    const { stateName } = this.state;
    if (stateName === START) {
      this.setState({ stateName: PAUSE, remainingTime: 60 * 60 });
      this.setTimer();
    } else if (stateName === PAUSE) {
      this.setState({ stateName: CONTINUE });
      clearInterval(timer);
    } else if (stateName === CONTINUE) {
      this.setState({ stateName: PAUSE });
      this.setTimer();
    } else {
      throw 'This error should never happend';
    }
  }

  tickUpdate() {
    const { stateName, remainingTime } = this.state;
    const aHour = 60 * 60;
    if (stateName === PAUSE && remainingTime === 0) {
      this.setState(function (prevState) {
        return {
          remainingTime: aHour,
          dayHours: prevState.dayHours + 1,
          weekHours: prevState.weekHours + 1
        };
      });
    } else if (stateName === PAUSE && remainingTime < 0) {
      this.setState(function (prevState) {
        const hourPassed = Math.floor((-1 * prevState.remainingTime) / aHour);
        return {
          remainingTime: hourPassed? aHour * hourPassed + remainingTime: aHour + remainingTime,
          dayHours: prevState.dayHours + 1 + hourPassed,
          weekHours: prevState.weekHours + 1 + hourPassed
        };
      });
    }
  }

  render() {
    return (<BrowserRouter>
    <div>
      <header>
        <nav>
          <li>
            <ul><Link to="/">Inicio</Link></ul>
            <ul><Link to="/about">Acerca de</Link></ul>
            <ul><Link to="/login">Iniciar Sesión</Link></ul>
            <ul><a href="/logout">Cerrar Sesión</a></ul>
            <ul><Link to="/signup">Registrarte</Link></ul>
          </li>
        </nav>
      </header>
      <div>
        <Route exact path="/"
          render={() => <App
            { ...this.state }
            handleClick={this.handleClick}
            tickUpdate={this.tickUpdate}
          />}
        />
        <Route path="/about" component={About}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={SingUp}/>
      </div>
    </div>
    </BrowserRouter>);
  }
}

export default HoursTracking;
