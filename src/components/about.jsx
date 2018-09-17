import React from 'react';

class About extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (<article className="pad-late">
      <h2 id="about">Acerca de HorasContadas</h2>
      <p className="text">
        Aplicación web de productividad para llevar el seguimiento una sola tarea,
        midiendo las horas de empeño sin contar tiempos muertos e interrupciones.
      </p>
      <p className="text">
        ¿Necesitas llevar seguimiento a alguna tarea? ¿quieres saber el tiempo que utilizas?
        ¿buscas una forma sencilla de ver el verdadero tiempo que gastas?
      </p>
      <h3 id="motivation">Motivación</h3>
      <p className="text">
        Desarrollar una herramienta de productividad y poder compartirla.
      </p>
      <h3 id="status">Estado</h3>
      <p className="text">
        Actualmente la aplicación web se encuentra en la  etapa <strong>Alfa(v
        {this.props.version})</strong>; es decir en una etapa temprana que puede
        cambiar totalmente en la próxima actualización, <em>todos los datos registrados en
        esta etapa son temporales</em> y pueden ser reiniciados para la siguiente actualización
        o el lanzamiento de la versión beta.
      </p>
      <h3 id="contact">Contacto</h3>
      <p className="text">
        Si deseas contactar me <a href="mailto:luiko.luisgarcia@gmail.com"
        title="correo electrónico">luiko.luisgarcia@gmail.com</a>.<br/>
        Cualquier comentario, sugerencia sera bien recibida.<br/><a
        className="twitter-icon" href="https://twitter.com/Luiko0"
        title="red social de contacto">twitter
        </a>. <a href="https://github.com/Luiko" title="red social de creadores"
        className="github-icon">GitHub</a>.
      </p>
    </article>);
  }
}

About.propTypes = {
  version(props, name) {
    if (!/^\d\.\d\.\d$/.test(props[name])) {
      return new Error('prop do not match with version format');
    }
  }
};

export default About;
