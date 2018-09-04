import React, { Component } from 'react';
import axios, { post } from 'axios';
import HoursTrackingComponent from '../components/index';
import { START, PAUSE, CONTINUE, BTN } from '../locales/main-button';

let timer;
let start;
const initialState = {
  btnName: BTN(START),
  dayHours: 0,
  weekHours: 0,
  remainingTime: 0,
  username: '',
  version: '0.0.0',
  error: '',
  closeAlert: true,
  load: false
};

class HoursTrackingContainer extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, initialState);
    this.handleClick = this.handleClick.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.auth = this.auth.bind(this);
  }

  render() {
    return (<HoursTrackingComponent
      {...this.state}
      auth={this.auth}
      handleClick={this.handleClick}
      handleAlertClick={() => this.setState({ closeAlert: true })}
    />);
  }

  componentDidMount() {
    const date = new Date();
    post('/auth', { date, diff: date.getTimezoneOffset() * -1 })
      .then(function (res) {
        const {
          username, dayHours, weekHours,
          remainingTime, version, start: _start,
        } = res.data;
        const state = {
          username, dayHours, weekHours, remainingTime, version
        };
        if (_start) {
          start = _start;
          state.btnName = BTN(PAUSE);
          this.setState(state);
          this.setTimer();
        } else if (username) {
          state.btnName = remainingTime % 3600 ? BTN(CONTINUE) : BTN(START);
          this.setState(state);
        }
      }.bind(this))
      .catch(function (err) {
        if (err.response.status === 401) {
          const version = err.response.data;
          console.error(err.message);
          this.setState({ version });
        } else {
          console.error(err.message);
        }
      }.bind(this))
      .then(() => {
        this.setState({ load: true });
      })
    ;
  }

  auth(account) {
    if (account === null) {
      this.setState(Object.assign({}, initialState, { load: true }));
      return;
    }
    if (timer) {
      clearTimeout(timer);
    }
    this.setState(account);
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
      } else {
        const { remainingTime } = this.state;
        const aHour = 60 * 60;
        if (remainingTime === 0) {
          this.setState(function (prevState) {
            return {
              remainingTime: aHour,
              dayHours: prevState.dayHours + 1,
              weekHours: prevState.weekHours + 1
            };
          });
        } else if (remainingTime < 0) {
          this.setState(function (prevState) {
            const hourPassed = Math.floor((-1 * prevState.remainingTime) / aHour);
            return {
              remainingTime: hourPassed? aHour * hourPassed + remainingTime
                                      : aHour + remainingTime,
              dayHours: prevState.dayHours + 1 + hourPassed,
              weekHours: prevState.weekHours + 1 + hourPassed
            };
          });
        }
      }
      timer = setTimeout(interval.bind(this, now), time);
    }
  }

  handleClick() {
    const { btnName } = this.state;
    if (btnName === BTN(START)) {
      this.saveState.call(this);
      this.setState({ btnName: BTN(PAUSE), remainingTime: 3600 });
    } else if (btnName === BTN(PAUSE)) {
      this.setState({ closeAlert: true, error: "" }); //reset alert
      post('/iterations', { start, end: Date.now() })
        .then(function (res) {
          console.log(res.data);
        })
        .catch(function (err) {
          if (!err.response) {
            this.setState({ error: err.message, closeAlert: false });
          } else if (err.response && err.response.status === 401) {
            this.setState({ closeAlert: false, error: "Unauthenticated Session" });
          } else {
            console.error(err.message);
          }
        }.bind(this))
      ;
      this.setState({ btnName: BTN(CONTINUE) });
      clearTimeout(timer);
    } else if (btnName === BTN(CONTINUE)) {
      this.saveState.call(this);
      this.setState({ btnName: BTN(PAUSE) });
    } else {
      throw 'This error should never happend';
    }
  }

  saveState() {
    start = Date.now();
    this.setState({ closeAlert: true, error: "" }); //reset alert
    this.setTimer();
    axios({
      method: 'post', url: '/session', data: start,
      headers: { 'Content-Type': 'text/plain' }
    }).then(function (res) {
      console.log(res.data);
    }, function (err) {
      if (!err.response) {
        this.setState({ error: err.message, closeAlert: false });
      } else if (err.response && err.response.status === 401) {
        this.setState({ closeAlert: false, error: "Unauthenticated Session" });
      } {
        console.error(err.message);
      }
    }.bind(this));
  }
}

export default HoursTrackingContainer;
