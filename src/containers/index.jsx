import React, { Component } from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import App from './app.jsx';
import About from '../components/about.jsx';
import Login from './login.jsx';
import SingUp from './signup.jsx';

class HoursTracking extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (<BrowserRouter>
    <div>
      <header>
        <nav>
          <li>
            <ul><Link to="/">Inicio</Link></ul>
            <ul><Link to="/about">Acerca de</Link></ul>
            <ul><Link to="/login">Iniciar Sesión</Link></ul>
            <ul><a href="/logout">Cerrar Sesión</a></ul>
            <ul><Link to="/signup">Registrarte</Link></ul>
          </li>
        </nav>
      </header>
      <div>
        <Route exact path="/" component={App}/>
        <Route path="/about" component={About}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={SingUp}/>
      </div>
    </div>
    </BrowserRouter>);
  }
}

export default HoursTracking;
