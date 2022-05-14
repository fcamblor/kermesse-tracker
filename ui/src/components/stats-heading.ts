import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";

@customElement('stats-heading')
export class StatsHeading extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`
    :host {
      display: block;
      padding: 4px 16px;
      width: 100%;
    }
  `]

  @property({type: Array})
  checkins: Checkin[] = []

  render() {
    return html`
      Adultes: ${this.checkins.reduce((total, checkin) => total + checkin.counts.adults, 0)}
      | Enfants: ${this.checkins.reduce((total, checkin) => total + checkin.counts.nonSchoolChildren, 0)}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stats-heading': StatsHeading
  }
}
