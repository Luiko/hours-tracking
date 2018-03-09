import React from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import App from '../containers/app.jsx';
import About from './about.jsx';
import Login from '../containers/login.jsx';
import SingUp from '../containers/signup.jsx';
import Welcome from './welcome.jsx';

function HoursTracking(props) {
  const { username } = props;
  return (<BrowserRouter>
    <div>
      <header>
        <h1>Mejora tu productividad con un botón</h1>
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/about">Acerca de</Link></li>
            {!!!username && <li><Link to="/login">Iniciar Sesión</Link></li>}
            {!!username && <li><a href="/logout">Cerrar Sesión</a></li>}
            {!!!username && <li><Link to="/signup">Registrarte</Link></li>}
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
          />}
        />
        <Route path="/about" component={About}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" render={function () {
          return <SingUp auth={props.auth} username={props.username} />
        }}/>
      </div>
    </div>
    </BrowserRouter>);
}

export default HoursTracking;
