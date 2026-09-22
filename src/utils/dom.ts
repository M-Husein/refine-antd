const getElement = (element: string | HTMLElement) => 
  typeof element === "string"
    ? document.querySelector<HTMLElement>(element)
    : element;

/**
 * Programatically trigger focus then keydown enter keyboard
 * @param element : string | HTMLElement (input, textarea)
 */
export const triggerFocusEnter = (element: string | HTMLElement) => {
  let node = getElement(element);

  if(node){
    node.focus();

    // dispatch the event on some DOM element
    node.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
    }));
  }
}

/**
 * Show/hide Splash Screen.
 * @returns void;
 */
export const toggleLoaderApp = (force?: boolean): void => {
  // (document.getElementById('loaderApp') as HTMLElement)?.classList.toggle('hidden', force);

  let loaderMain = document.getElementById('loaderApp') as HTMLElement;
  if(loaderMain){
    loaderMain.hidden = force ?? true;
    // Option Tailwind
    // loaderMain.classList.toggle('hidden', loaderMain.hidden);
  }
}

/**
 * Toggle element inert attribute
 * @param isInert boolean
 * @param element string  - HTML element or id, default 'app'
 * @returns 
 */
export const toggleInert = (
  isInert: boolean, 
  element: string | HTMLElement = '#app'
) => {
  let root = getElement(element);

  if(root){
    isInert 
      ? root.setAttribute('inert', '') 
      : root.removeAttribute('inert');
  }
}
