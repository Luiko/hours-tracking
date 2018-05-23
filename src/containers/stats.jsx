import React, { Component } from 'react';
import { get } from 'axios';
import Axis from './axis';

const x = 40;
const y = 40;
const length = 300;
let max;
let multiple;

class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { data } = this.state;
    return (<main className="center">
      {/* <?xml version="1.0" standalone="no"?> */}
      <h1>Horas de la semana</h1>
      <svg version="1.1" baseProfile="full" width="400" height="400"
      xmlns="http://www.w3.org/2000/svg">
        <Axis x={x} y={y} length={length} side="vertical" name="days"/>
        <Axis x={x} y={y + length} length={length} side="horizontal" name="hours"/>
        {
          data &&
          Object.keys(data).map((d, i) => {
            return (<g key={d}>
              <text className="background" x={x} y={(y * 2) + (y * i) - 5}>
                {d}
              </text>
              <rect x={x} y={(y * 2) + (y * i)} height={10} width={data[d] * multiple}></rect>
            </g>);
          })
        }
        {
          data &&
          (new Array(max + 1)).fill(0).map((_, i) => (<g key={'number' + i} className="mark" fill="gray">
            <text x={multiple * i + x + 2} y={y + length - 5} >{i}</text>
            <line x1={multiple * i + x} y1={y + length}
                  x2={multiple * i + x} y2={y + length - 10} stroke="gray"/>
          </g>))
        }
      </svg>
    </main>);
  }
  componentDidMount() {
    get('/stats/week')
      .then(({ data }) => {
        const getMax = (max, key) => Math.max(max, data[key]);
        max = Object.keys(data).reduce(getMax, 0);
        multiple = max? length / max: 0;
        this.setState({ data });
      })
      .catch((response) => console.error('get /stats/week failed', response.message))
    ;
  }
}

export default Stats;
