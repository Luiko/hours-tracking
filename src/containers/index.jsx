import React, { Component } from 'react';
import axios, { post, CancelToken } from 'axios';
import BrowserRouter from '../components/index';
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
 
export const hour = 3600;

class HoursTrackingContainer extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, initialState);
    this.handleClick = this.handleClick.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.auth = this.auth.bind(this);
    this.requests = CancelToken.source();
    this.cancel_msg = 'Unmounting app container component';
  }

  render() {
    return (<BrowserRouter
      {...this.state}
      auth={this.auth}
      handleClick={this.handleClick}
      handleAlertClick={() => this.setState({ closeAlert: true })}
    />);
  }

  componentDidMount() {
    const date = new Date();
    post('/auth',
      { date, diff: date.getTimezoneOffset() * -1 },
      { cancelToken: this.requests.token }
    )
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
          state.btnName = remainingTime % hour ? BTN(CONTINUE) : BTN(START);
          this.setState(state);
        }
      }.bind(this))
      .catch(function ({ response, message }) {
        if (response && response.status === 401) {
          const version = response.data;
          console.error(message);
          this.setState({ version });
        } else if (message === this.cancel_msg) {
          console.info(message);
        } else {
          console.error(message);
        }
      }.bind(this))
      .then(() => {
        this.setState({ load: true });
      })
    ;
  }

  componentWillUnmount() {
    clearTimeout(timer);
    this.requests.cancel(this.cancel_msg);
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
    const second = 1000;
    timer = setTimeout(interval.bind(this, start), second);
    function interval(cycle) {
      const now = Date.now();
      const diff = now - cycle;
      const totalms = now - start;
      const time = second - (totalms % second);
      const decrement = Math.round(diff / second);
      if (this.state.remainingTime > 0) {
        this.setState(function (prevState) {
          return {
            remainingTime: prevState.remainingTime - decrement
          };
        });
      } else {
        const { remainingTime } = this.state;
        if (remainingTime === 0) {
          this.setState(function (prevState) {
            return {
              remainingTime: hour,
              dayHours: 1 + prevState.dayHours,
              weekHours: 1 + prevState.weekHours
            };
          });
        } else if (remainingTime < 0) {
          this.setState(function (prevState) {
            const hourPassed = -Math.floor((prevState.remainingTime) / hour);
            return {
              remainingTime: hour * hourPassed + prevState.remainingTime,
              dayHours: prevState.dayHours + hourPassed,
              weekHours: prevState.weekHours + hourPassed
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
      this.setState({ btnName: BTN(PAUSE), remainingTime: hour });
      this.saveState.call(this);
    } else if (btnName === BTN(PAUSE)) {
      this.setState({ closeAlert: true, error: "" }); //reset alert
      post('/iterations',
        { start, end: Date.now() },
        { cancelToken: this.requests.token }
      )
        .then(function (res) {
          console.log(res.data);
        })
        .catch(function ({ response, message }) {
          if (!response) {
            this.setState({ error: message, closeAlert: false });
          } else if (response && response.status === 401) {
            this.setState({ closeAlert: false, error: "Unauthenticated Session" });
          } else if (message === this.cancel_msg) {
            console.info(message);
          } else {
            console.error(message);
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
      headers: { 'Content-Type': 'text/plain' },
      cancelToken: this.requests.token
    }).then(function (res) {
      console.log(res.data);
    }, function ({ response, message }) {
      if (!response) {
        this.setState({ error: message, closeAlert: false });
      } else if (response && response.status === 401) {
        this.setState({ closeAlert: false, error: "Unauthenticated Session" });
      } else if (message === this.cancel_msg) {
        console.info(message);
      } else {
        console.error(message);
      }
    }.bind(this));
  }
}

export default HoursTrackingContainer;
