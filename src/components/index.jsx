import React from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import About from './about';
import Login from '../containers/login';
import SignUp from '../containers/signup';
import Welcome from './welcome';
import Configuration from '../containers/configuration';
import Stats from '../containers/stats';
import Home from './main';
import PropTypes from 'prop-types';

function HoursTracking(props) {
  const { username } = props;

  return (<BrowserRouter>
    <div>
      <header>
        <h1 className="header">Mantén tu productividad con un botón</h1>
        <nav className="list-container">
          <ul className="list">
            <li className="list-item"><Link to="/">Inicio</Link></li>
            <li className="list-item"><Link to="/about">Acerca de</Link></li>
            {!!!username && <li className="list-item"><Link to="/login">Iniciar Sesión</Link></li>}
            {!!username && <li className="list-item"><a href="/logout">Cerrar Sesión</a></li>}
            {!!!username && <li className="list-item"><Link to="/signup">Registrarte</Link></li>}
            {!!username && <li className="list-item"><Link to="/configuration">Ajustes</Link></li>}
            {!!username && <li className="list-item"><Link to="/stats">Gráficas</Link></li>}
          </ul>
        </nav>
      </header>
      <div>
        <Welcome username={username}/>
        <Route exact path="/"
          render={() => <Home
            isAuthenticated={!!username}
            load={props.load}
            btnName={props.btnName}
            dayHours={props.dayHours}
            weekHours={props.weekHours}
            handleClick={props.handleClick}
            remainingTime={props.remainingTime}
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
        <Route path="/configuration" component={Configuration}/>
        <Route path="/stats" render={()=><Stats dayHours={props.dayHours}/>}/>
      </div>
      <footer>
        <p className="center">
          2018 Copyright &copy; Luis Carlos Garcia Barajas🇲🇽
        </p>
        <p className="center">
          Horas-Contadas web app is under <a
            href="https://github.com/Luiko/hours-tracking/blob/master/LICENSE"
            title="Licencia de la app web">MIT License</a>
        </p>
      </footer>
    </div>
  </BrowserRouter>);
}

HoursTracking.propTypes = {
  username: PropTypes.string.isRequired,
  load: PropTypes.bool.isRequired,
  btnName: PropTypes.string.isRequired,
  dayHours: PropTypes.number.isRequired,
  weekHours: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired,
  remainingTime: PropTypes.number.isRequired,
  error: PropTypes.string,
  closeAlert: PropTypes.bool.isRequired,
  handleAlertClick: PropTypes.func.isRequired,
  version: PropTypes.string.isRequired,
  auth: PropTypes.func.isRequired
};

export default HoursTracking;
