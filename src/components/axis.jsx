import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Axis extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { x, y, length, side, name } = this.props;

    if (side === 'vertical') {
      return (<g>
        <line x1={x} y1={y}
          x2={x}
          y2={y + length} stroke="black" />
        <text x={length / -2} y={y} transform="rotate(-90)">{name}</text>
      </g>);
    }
    if (side === 'horizontal') {
      return (<g>
        <line x1={x} y1={y}
          x2={x + length}
          y2={y} stroke="black" />
        <text x={length / 2 + x} y={y + 15} transform="rotate(0)">{name}</text>
      </g>);
    }
    return <g></g>;
  }
}

Axis.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
  side: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default Axis;
