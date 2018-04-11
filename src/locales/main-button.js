export const START = 'Start';
export const PAUSE = 'Pause';
export const CONTINUE = 'Continue';
const LANGUAGE = 'es';
const btnNames = {
  [START]: {
    en: 'Start',
    es: 'Iniciar'
  },
  [PAUSE]: {
    en: 'Pause',
    es: 'Pausar'
  },
  [CONTINUE]: {
    en: 'Continue',
    es: 'Continuar'
  }
}
export const BTN = (NAME) => btnNames[NAME][LANGUAGE];
