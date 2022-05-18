import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { totalCountOf } from '@shared/domain/Checkins';
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
    .local {
      font-size: 1.2rem;
      color: var(--bs-green)
    }
  `]

  @property({type: Array})
  checkins: Checkin[] = []

  @property({type: Array})
  localCheckins: Checkin[] = []

  render() {
    return html`
      Adultes: ${totalCountOf(this.checkins, "adults")}
      ${this.localCheckins.length?html`<span class="local">+${totalCountOf(this.localCheckins, "adults")}</span>`:html``}

      | Enfants: ${totalCountOf(this.checkins, "nonSchoolChildren")}
      ${this.localCheckins.length?html`<span class="local">+${totalCountOf(this.localCheckins, "nonSchoolChildren")}</span>`:html``}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stats-heading': StatsHeading
  }
}
