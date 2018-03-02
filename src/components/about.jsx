import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (<main>
      <h1 id="about">Acerca de HorasContadas</h1>
      <p>
        Aplicación web de productividad para llevar el seguimiento una sola tarea,
        midiendo las horas de empeño sin contar tiempos muertos e interrupciones.
      </p>
      <p>
        ¿Necesitas llevar seguimiento a alguna tarea? ¿quieres saber el tiempo que utilizas?
        ¿buscas una forma sencilla de ver el verdadero tiempo que gastas?
      </p>
      <h2 id="motivation">Motivación</h2>
      <p>
        Desarrollar una herramienta de productividad que haga la vida mas fácil y poder compartirla
      </p>
      <h2 id="status">Estado</h2>
      <p>
        Actualmente la aplicación web se encuentra en estado <strong>Alfa</strong>;
        es decir en una etapa temprana que puede cambiar totalmente en la próxima actualización, <em>
        todos los datos registrados en esta etapa son temporales</em> y pueden ser reiniciados para
        la siguiente actualización o el lanzamiento de la versión beta.
      </p>
      <h2 id="contact">Contacto</h2>
      <p>
        Si deseas contactar me <a href="mailto:luiko.luisgarcia@gmail.com">luiko.luisgarcia@gmail.com</a>.
        Cualquier comentario, sugerencia sera bien recibida, Gracias de ante mano.
        Mi <a href="https://twitter.com/Luiko0">twitter</a>
      </p>
    </main>);
  }
}

export default App;
