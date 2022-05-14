import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "./styles/ConstructibleStyleSheets";
import {MemberSelected} from "./components/people-selector";
import {familyMembers, findFamilyContaining} from "./services/Families";

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

  @state()
  families: Family[] = []

  @state()
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
      <hr class="m-2">
      <people-selector 
          .members="${this.families.flatMap(f => f.members.concat(f.schoolChildren))}"
          @on-member-selected="${(e: CustomEvent<MemberSelected>) => this.showFamilyCheckin(e.detail.member)}"
      ></people-selector>
      Total families: ${this.families.length}
    `
  }

  private showFamilyCheckin(member: Member) {
    console.log(`Selected member: ${JSON.stringify(member)}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kermesse-tracker-app': KermesseTrackerApp
  }
}
