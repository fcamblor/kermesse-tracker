import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('stats-heading')
export class StatsHeading extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`
    :host {
      display: block;
      width: 100%;
    }
  `]

  @property()
  checkins: Checkin[] = []

  render() {
    return html`
      Adultes: ${this.checkins.reduce((total, checkin) => total + checkin.members.filter(m => m.type==='adult').length, 0)}
      | Enfants: ${this.checkins.reduce((total, checkin) => total + checkin.members.filter(m => m.type!=='adult').length, 0)}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stats-heading': StatsHeading
  }
}
