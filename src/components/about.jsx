import React, { Component } from 'react';

class App extends Component {
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
        Desarrollar una herramienta de productividad que haga la vida mas fácil y poder compartirla
      </p>
      <h3 id="status">Estado</h3>
      <p className="text">
        Actualmente la aplicación web se encuentra en estado <strong>Alfa</strong>;
        es decir en una etapa temprana que puede cambiar totalmente en la próxima actualización, <em>
        todos los datos registrados en esta etapa son temporales</em> y pueden ser reiniciados para
        la siguiente actualización o el lanzamiento de la versión beta.
      </p>
      <h3 id="contact">Contacto</h3>
      <p className="text">
        Si deseas contactar me <a href="mailto:luiko.luisgarcia@gmail.com">luiko.luisgarcia@gmail.com</a>.<br/>
        Cualquier comentario, sugerencia sera bien recibida, gracias de ante mano.<br/>
        Mi <a href="https://twitter.com/Luiko0">twitter</a>.
      </p>
    </article>);
  }
}

export default App;
