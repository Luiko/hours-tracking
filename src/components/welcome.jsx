import React from 'react';
import PropTypes from 'prop-types';

function Welcome({ username }) {
  if (!!username) {
    return <div className="welcome-faded faded">
      Bienvenido {username}
    </div>;
  } else {
    return <div className="welcome-faded"></div>;
  }
}

Welcome.propTypes = {
  username: PropTypes.string
};

export default Welcome;
