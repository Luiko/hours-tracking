import React from 'react';
import { get } from 'axios';
import Alert from '../../components/alert';
import WeekHours from './weekHours';
import MonthProgress from './monthProgress';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const length = 290;

class Stats extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { alertClose: true, error: "" };
  }
  render() {
    const {
      week, month, days, max, monthMax, weekDivider, monthDivider
    } = this.state;
    if (this.state.error === "Unauthenticated Session") {
      return <Redirect to="/login" />;
    }
    return (<main className="center">
      {/* <?xml version="1.0" standalone="no"?> */}
      <WeekHours week={week} days={days} max={max} divider={weekDivider}/>
      <MonthProgress month={month} divider={monthDivider} max={monthMax}/>
      <div className="pad-container">
        <Alert type="error" close={this.state.alertClose}
              handleClick={() => this.setState({ alertClose: true })}>
          {this.state.error}
        </Alert>
      </div>
    </main>);
  }
  componentDidMount() {
    const reduceObjectToMax = (obj, func) => Object.keys(obj).reduce(func, 0);
    const getMaxOfWeek = (week, max, day) => Math.max(max, week[day]);
    function handleError(interval, error) {
      const { response } = error;
      if (response && response.status === 500) {
        this.setState({
          alertClose: false,
          error: `Can't retrieve ${interval} data, something happened.`
        });
      } else if (response && response.status === 401) {
        this.props.auth(null);
        this.setState({
          alertClose: false, error: "Unauthenticated Session"
        });
      } else {
        throw error;
      }
    }
    get('/stats/week')
      .then(({ data: [ week, days ] }) => {
        const max = reduceObjectToMax(week, getMaxOfWeek.bind(null, week));
        const weekDivider = max? length / max: 0;
        this.setState({ week, days, max, weekDivider });
      }).catch(handleError.bind(null, 'week'))
    ;
    get('/stats/month')
      .then(({ data: month }) => {
        console.log(month);
        const getMaxOfMonth = (max, week) => Math.max(
          reduceObjectToMax(week, getMaxOfWeek.bind(null, week)), max);
        const max = month.reduce(getMaxOfMonth, 0);
        const monthDivider = max? length / max: 0;
        this.setState({ month, monthDivider, monthMax: max });
      }).catch(handleError.bind(null, 'month'))
    ;
  }
}

Stats.propTypes = {
  dayHours: PropTypes.number.isRequired,
  auth: PropTypes.func.isRequired
};

export default Stats;
