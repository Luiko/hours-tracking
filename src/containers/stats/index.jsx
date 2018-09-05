import React, { Component } from 'react';
import { get } from 'axios';
import Alert from '../../components/alert';
import WeekHours from './weekHours';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

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
    if (this.state.error === "Unauthenticated Session") {
      return <Redirect to="/login" />;
    }
    return (<main className="center">
      {/* <?xml version="1.0" standalone="no"?> */}
      <WeekHours week={week} days={days} max={max} multiple={multiple}/>
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
        if (response && response.status === 401) {
          this.props.auth(null);
          this.setState({ error: "Unauthenticated Session" });
          return;
        }
        this.setState({ alertClose: false, error: message });
      })
    ;
  }
}

Stats.propTypes = {
  dayHours: PropTypes.number.isRequired,
  auth: PropTypes.func.isRequired
};

export default Stats;
