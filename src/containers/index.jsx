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
      btnName: START,
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
      .then(function (res) {
        const {
          username, dayHours, weekHours,
          remainingTime, start: _start
        } = res.data;
        if (_start) {
          start = _start;
          this.setState({
            username, dayHours, weekHours,
            remainingTime: remainingTime, btnName: PAUSE
          });
          this.setTimer();
        } else if (username) {
          this.setState({
            username, dayHours, remainingTime, weekHours,
            btnName: remainingTime && remainingTime % 3600 ? CONTINUE : START
          });
        }
      }.bind(this))
      .catch(function (err) {
        console.error(err.message);
      })
    ;
  }

  render() {
    const { username } = this.state;
    return (<BrowserRouter>
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/about">Acerca de</Link></li>
            {!!!username && <li><Link to="/login">Iniciar Sesión</Link></li>}
            {!!username && <li><a href="/logout">Cerrar Sesión</a></li>}
            {!!!username && <li><Link to="/signup">Registrarte</Link></li>}
          </ul>
        </nav>
      </header>
      <div>
        {<Welcome username={username}/>}
        <Route exact path="/"
          render={() => <App
            btnName={this.state.btnName}
            dayHours={this.state.dayHours}
            weekHours={this.state.weekHours}
            handleClick={this.handleClick}
            remainingTime={this.state.remainingTime}
            tickUpdate={this.tickUpdate}
          />}
        />
        <Route path="/about" component={About}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" render={function () {
          return <SingUp auth={this.auth} username={this.state.username} />
        }.bind(this)}/>
      </div>
    </div>
    </BrowserRouter>);
  }

  auth(username) {
    this.setState({ username });
  }

  setTimer() {
    timer = setTimeout(interval.bind(this, start), 1000);
    function interval(cycle) {
      const now = Date.now();
      const diff = now - cycle;
      const totalms = now - start;
      const time = 1000 - (totalms % 1000);
      const decrement = Math.round(diff / 1000);
      if (this.state.remainingTime > 0) {
        this.setState(function (prevState) {
          return {
            remainingTime: prevState.remainingTime - decrement
          };
        });
      }
      timer = setTimeout(interval.bind(this, now), time);
    }
  }

  handleClick() {
    const { btnName } = this.state;
    if (btnName === START) {
      this.saveState.call(this, PAUSE);
      this.setState({ btnName: PAUSE, remainingTime: 3600 });
    } else if (btnName === PAUSE) {
      post('/iterations', { start, end: Date.now() })
        .then(function (res) {
          console.log(res.data);
        })
        .catch(function (err) {
          console.error(err.message)
        });
      ;
      this.setState({ btnName: CONTINUE });
      clearTimeout(timer);
    } else if (btnName === CONTINUE) {
      start = Date.now();
      this.saveState.call(this, PAUSE);
      this.setState({ btnName: PAUSE });
    } else {
      throw 'This error should never happend';
    }
  }

  saveState(btnName) {
    start = Date.now();
    this.setTimer();
    post('/session', { start, btnName }).then(function (res) {
      console.log(res.data);
    }, function (err) {
      console.log(err.message);
    });
  }

  tickUpdate() {
    const { btnName, remainingTime } = this.state;
    const aHour = 60 * 60;
    if (btnName === PAUSE && remainingTime === 0) {
      this.setState(function (prevState) {
        return {
          remainingTime: aHour,
          dayHours: prevState.dayHours + 1,
          weekHours: prevState.weekHours + 1
        };
      });
    } else if (btnName === PAUSE && remainingTime < 0) {
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
