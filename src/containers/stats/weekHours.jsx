import React from 'react';
import Axis from '../../components/axis';
import PropTypes from 'prop-types';

const x = 40;
const y = 35;
const length = 290;

class WeekHours extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
    const { week, days, max, divider } = this.props;
		return (<div>
			<h2 className="svg-fix">Horas de la semana</h2>
			<svg version="1.1" baseProfile="full" width="400" height="400"
				xmlns="http://www.w3.org/2000/svg" className="svg-fix">
				<Axis x={x} y={y} length={length} side="vertical" name="days" />
				<Axis x={x} y={y + length}
					length={length} side="horizontal" name="hours" />
				{
					week &&
					Object.keys(week).map((d, i) => {
						const _y = (y * 2) + (y * i);
						return (<g key={d}>
							<text className="background" x={x} y={_y - 5}>
								{d} {days[i]}
							</text>
							<rect x={x} y={_y} height={10} width={week[d] * divider} />
						</g>);
					})
				}
				{
					week &&
					(new Array(max + 1)).fill(0).map((_, i) => {
						const _x = divider * i + x;
						return (<g key={'number' + i} className="mark" fill="gray">
							<text x={_x + 2} y={y + length - 5} >{i}</text>
							<line x1={_x} y1={y + length}
								x2={_x} y2={y + length - 10} stroke="gray" />
						</g>);
					})
				}
			</svg>
		</div>);
	}
}

WeekHours.propTypes = {
	week: PropTypes.shape({
		sunday: PropTypes.number.isRequired,
		monday: PropTypes.number.isRequired,
		tuesday: PropTypes.number.isRequired,
		wednesday: PropTypes.number.isRequired,
		thursday: PropTypes.number.isRequired,
		friday: PropTypes.number.isRequired,
		saturday: PropTypes.number.isRequired
	}),
	days: PropTypes.arrayOf(PropTypes.number.isRequired),
	max: PropTypes.number,
	divider: PropTypes.number
};

export default WeekHours;
