import React from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import App from '../containers/app.jsx';
import About from './about.jsx';
import Login from '../containers/login.jsx';
import SignUp from '../containers/signup.jsx';
import Welcome from './welcome.jsx';

function HoursTracking(props) {
  const { username } = props;

  return (<BrowserRouter>
    <div>
      <header>
        <h1 className="header">Mejora tu productividad con un botón</h1>
        <nav className="list-container">
          <ul className="list">
            <li className="list-item"><Link to="/">Inicio</Link></li>
            <li className="list-item"><Link to="/about">Acerca de</Link></li>
            {!!!username && <li className="list-item"><Link to="/login">Iniciar Sesión</Link></li>}
            {!!username && <li className="list-item"><a href="/logout">Cerrar Sesión</a></li>}
            {!!!username && <li className="list-item"><Link to="/signup">Registrarte</Link></li>}
          </ul>
        </nav>
      </header>
      <div>
        {<Welcome username={username}/>}
        <Route exact path="/"
          render={() => <App
            btnName={props.btnName}
            dayHours={props.dayHours}
            weekHours={props.weekHours}
            handleClick={props.handleClick}
            remainingTime={props.remainingTime}
            tickUpdate={props.tickUpdate}
            error={props.error}
            closeAlert={props.closeAlert}
            handleAlertClick={props.handleAlertClick}
          />}
        />
        <Route path="/about" render={() => <About version={props.version} />} />
        <Route path="/login" render={() => <Login auth={props.auth} />}/>
        <Route path="/signup" render={function () {
          return <SignUp auth={props.auth} username={username} />;
        }}/>
      </div>
    </div>
    </BrowserRouter>);
}

export default HoursTracking;
