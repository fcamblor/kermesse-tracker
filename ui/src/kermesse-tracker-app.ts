import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "./styles/ConstructibleStyleSheets";
import {Router, SlottedTemplateResultFactory} from "./routing/Router";

@customElement('kermesse-tracker-app')
export class KermesseTrackerApp extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`
    :host {
      display: block;
      padding: 0px;
    }
  `]

  @state() viewTemplateResult: SlottedTemplateResultFactory|undefined = undefined;

  constructor() {
    super();
    Router.installRoutes((viewTemplateResult) => {
      this.viewTemplateResult = viewTemplateResult;
    })
  }

  render() {
    return html`
      ${this.viewTemplateResult?this.viewTemplateResult(html`
        <!-- slots here -->
      `):html``}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kermesse-tracker-app': KermesseTrackerApp
  }
}
