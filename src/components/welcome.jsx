import React from 'react';

function Welcome({ username }) {
  if (!!username) {
    return <div className="welcome-faded faded">
      Bienvenido {username}
    </div>;
  } else {
    return <div className="welcome-faded"></div>;
  }
}

export default Welcome;
