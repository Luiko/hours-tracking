import React, { Component } from 'react';
import { get } from 'axios';
import Axis from '../components/axis';
import Alert from '../components/alert';
import deepEqual from 'fast-deep-equal';
import PropTypes from 'prop-types';

const x = 40;
const y = 35;
const length = 290;
let max;
let multiple;

class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = { alertClose: true, error: "" };
  }
  render() {
    const { week, days } = this.state;
    return (<main className="center">
      {/* <?xml version="1.0" standalone="no"?> */}
      <h2 className="svg-fix">Horas de la semana</h2>
      <svg version="1.1" baseProfile="full" width="400" height="400"
      xmlns="http://www.w3.org/2000/svg" className="svg-fix">
        <Axis x={x} y={y} length={length} side="vertical" name="days"/>
        <Axis x={x} y={y + length}
              length={length} side="horizontal" name="hours"/>
        {
          week &&
          Object.keys(week).map((d, i) => {
            return (<g key={d}>
              <text className="background" x={x} y={(y * 2) + (y * i) - 5}>
                {d} {days[i]}
              </text>
              <rect
                x={x}
                y={(y * 2) + (y * i)}
                height={10}
                width={week[d] * multiple}/>
            </g>);
          })
        }
        {
          week &&
          (new Array(max + 1)).fill(0).map((_, i) => (<g
            key={'number' + i} className="mark" fill="gray">

            <text x={multiple * i + x + 2} y={y + length - 5} >{i}</text>
            <line x1={multiple * i + x} y1={y + length}
                  x2={multiple * i + x} y2={y + length - 10} stroke="gray"/>
          </g>))
        }
      </svg>
      <div className="pad-container">
        <Alert type="error" close={this.state.alertClose}
              handleClick={() => this.setState({ alertClose: true })}>
          {this.state.error}
        </Alert>
      </div>
    </main>);
  }
  componentDidMount() {
    get('/stats/week')
      .then(({ data: [ week, days ] }) => {
        const getMax = (max, key) => Math.max(max, week[key]);
        max = Object.keys(week).reduce(getMax, 0);
        multiple = max? length / max: 0;
        this.setState({ week, days });
      })
      .catch((error) => {
        const { message, response } = error;
        if (response && response.status === 500) {
          this.setState({
            alertClose: false,
            error: "Can't retrieve data, something happened." }
          );
          return;
        }
        this.setState({ alertClose: false, error: message });
      })
    ;
  }
  componentDidUpdate() {
    const today = new Date().getDate();
    const { week, days } = this.state;
    const { dayHours } = this.props;
    const nweek = {};
    let update = false;
    Object.entries(week).forEach((el, i) => {
      const [key, value] = el;
      if (days[i] === today) {
        if (max < dayHours) {
          max = dayHours;
          update = true;
        }
        if (value < dayHours) {
          nweek[key] = dayHours;
          update = true;
        } else {
          nweek[key] = value;
        }
      } else {
        nweek[key] = value;
      }
    });
    if (update) {
      this.setState({ week: nweek });
    }
  }
  shouldComponentUpdate(nextprops, nextstate) {
    if (!deepEqual(this.state, nextstate)
      || this.props.dayHours != nextprops.dayHours) {

      return true;
    }
    return false;
  }
}

Stats.propTypes = {
  dayHours: PropTypes.number.isRequired
};

export default Stats;
