import React, { Component } from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { get, post } from 'axios';
import App from './app.jsx';
import About from '../components/about.jsx';
import Login from './login.jsx';
import SingUp from './signup.jsx';
import Welcome from '../components/welcome.jsx';

const START = 'Start';
const PAUSE = 'Pause';
const CONTINUE = 'Continue';
let timer;
let start;

class HoursTracking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateName: START,
      dayHours: 0,
      weekHours: 0,
      remainingTime: 0,
      username: ''
    };
    this.handleClick = this.handleClick.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.tickUpdate = this.tickUpdate.bind(this);
    this.auth = this.auth.bind(this);
  }

  componentDidMount() {
    get('/auth')
      .then(function ({ data: { username, dayHours, remainingTime } }) {
        if (username) {
          this.setState({
            username, dayHours, remainingTime,
            stateName: remainingTime? CONTINUE : START
          });
        }
      }.bind(this))
      .catch(console.error)
    ;
  }

  render() {
    const { username } = this.state;
    return (<BrowserRouter>
    <div>
      <header>
        <nav>
          <li>
            <ul><Link to="/">Inicio</Link></ul>
            <ul><Link to="/about">Acerca de</Link></ul>
            {!!!username && <ul><Link to="/login">Iniciar Sesión</Link></ul>}
            {!!username && <ul><a href="/logout">Cerrar Sesión</a></ul>}
            {!!!username && <ul><Link to="/signup">Registrarte</Link></ul>}
          </li>
        </nav>
      </header>
      <div>
        {<Welcome username={username}/>}
        <Route exact path="/"
          render={() => <App
            stateName={this.state.stateName}
            dayHours={this.state.dayHours}
            weekHours={this.state.weekHours}
            handleClick={this.handleClick}
            remainingTime={this.state.remainingTime}
            tickUpdate={this.tickUpdate}
          />}
        />
        <Route path="/about" component={About}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" render={() => <SingUp auth={this.auth} />}/>
      </div>
    </div>
    </BrowserRouter>);
  }

  auth(username) {
    this.setState({ username });
  }

  setTimer() {
    start = Date.now();
    let cycle = start;
    timer = setInterval(function () {
      if (this.state.remainingTime > 0) {
        const now = Date.now();
        this.setState(prevState => ({
          remainingTime: prevState.remainingTime - Math.floor((now - cycle) / 1000)
        }));
        cycle = now;
      }
    }.bind(this), 1000);
  }

  handleClick() {
    const { stateName } = this.state;
    if (stateName === START) {
      this.setState({ stateName: PAUSE, remainingTime: 60 * 60 });
      this.setTimer();
    } else if (stateName === PAUSE) {
      post('/iterations', { start, end: Date.now() })
        .then(function (res) {
          console.log(res.data);
        })
        .catch(function (err) {
          console.error(err.message)
        });
      ;
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
}

export default HoursTracking;
