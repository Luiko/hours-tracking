import React from 'react';
import Axis from '../../components/axis';
import PropTypes from 'prop-types';

const x = 40;
const y = 35;
const length = 290;

class MonthProgress extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { month, max, divider } = this.props;
		if (month) {
			const monthLength = month.reduce(
				(sum, week) => sum + Object.keys(week).length, 0
			);
			this.dayDivider = length / monthLength;
		}
		let dayCounter = 1;
		const monthTextBarLabelSyle = {
			'--monthTextSize': this.dayDivider + 2 + 'px'
		};
		return (<div>
			<h2 className="svg-fix">Progreso del Mes</h2>
			<svg version="1.1" baseProfile="full" width="400" height="400"
				xmlns="http://www.w3.org/2000/svg" className="svg-fix">
				<Axis x={x} y={y} length={length} side="vertical" name="hours" />
				<Axis x={x} y={y + length}
					length={length} side="horizontal" name="days" />
					{
						month && <g>{month.map((week) => (
							Object.keys(week).map((day, i) => {
								const height = week[day] * divider;
								const _x = x + this.dayDivider * dayCounter - 5;
								const component = (<g key={`k${i}h${height}`}>
									<text
										transform={`translate(${_x},${y * 1.5 + length}) rotate(90)`}
										className="background monthTextLabel"
										style={monthTextBarLabelSyle}>
										{ `${day.slice(0, 3)} ${dayCounter}` }
									</text>
									<rect x={_x} y={y + length - height}
										height={height} width={3}
									/>
								</g>);
								dayCounter++;
								return component;
							})
						))}</g>
					}
					{
						month &&
						<g>{(new Array(max + 1)).fill(0).map((_, i) => {
							const _x = x + length + 5;
							const _y = y * 2 + length - (divider * i + y);
							return (<g key={'number' + i} className="mark" fill="gray">
								<text x={_x} y={_y + 2} >{i}</text>
								<line x1={_x} y1={_y}
									x2={_x - 10} y2={_y} stroke="gray" />
							</g>);
						})}</g>
					}
			</svg>
		</div>);
	}
}

MonthProgress.propTypes = {
	month: PropTypes.arrayOf(PropTypes.shape({
		sunday: PropTypes.number,
		monday: PropTypes.number,
		tuesday: PropTypes.number,
		wednesday: PropTypes.number,
		thursday: PropTypes.number,
		friday: PropTypes.number,
		saturday: PropTypes.number
	}).isRequired),
	max: PropTypes.number,
	divider: PropTypes.number
};

export default MonthProgress;
