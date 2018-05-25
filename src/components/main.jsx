import React from 'react';
import App from './app';
import Home from '../components/home';
import PropTypes from 'prop-types';

class HomeContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { load, isAuthenticated } = this.props;
    const props = Object.assign({ username: undefined }, this.props);
    if (load) {
      if (isAuthenticated) {
        return <App {...props}/>;
      } else {
        return <Home />;
      }
    } else {
      return <div className='loading'></div>;
    }
  }
}

HomeContainer.propTypes = {
  load: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired
};

export default HomeContainer;
