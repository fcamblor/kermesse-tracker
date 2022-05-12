import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {CSS_Global} from "./styles/ConstructibleStyleSheets";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('kermesse-tracker-app')
export class KermesseTrackerApp extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`
    :host {
      display: block;
      padding: 16px;
    }
  `]

  @property()
  families: Family[] = []

  @property()
  checkins: Checkin[] = []

  constructor() {
    super();

    fetch('https://gist.githubusercontent.com/fcamblor/277f0d79f6ae94f3ebcc7c183973c21f/raw/kermesse-2022.json')
        .then(resp => resp.json())
        .then(payload => {
          this.families = payload.families;
        })
  }

  render() {
    return html`
      <stats-heading .checkins="${this.checkins}"></stats-heading>
      Total families: ${this.families.length}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kermesse-tracker-app': KermesseTrackerApp
  }
}
