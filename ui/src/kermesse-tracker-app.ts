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

  @state()
  existingFamily: Family|undefined = undefined;

  constructor() {
    super();

    fetch('https://gist.githubusercontent.com/fcamblor/277f0d79f6ae94f3ebcc7c183973c21f/raw/kermesse-2022.json')
        .then(resp => resp.json())
        .then(payload => {
          this.families = payload.families.map((f: Family) => ({
            ...f,
            schoolChildren: f.schoolChildren.map((sc: Omit<SchoolChild, "isSchoolChild">) => ({...sc, isSchoolChild: true})),
            members: f.members.map((m: Omit<Member, "isSchoolChild">) => ({...m, isSchoolChild: false})),
          }));
        })
  }

  render() {
    return html`
      ${this.existingFamily?html`
        <checkin-from-existing-family 
            .family="${this.existingFamily}"
            @on-checkin-performed="${(e: CustomEvent<Checkin>) => this.onCheckinPerformed(e.detail)}"
            @on-checkin-cancelled="${() => this.onCheckinCancelled()}"
        ></checkin-from-existing-family>
      `:html`
        <stats-heading .checkins="${this.checkins}"></stats-heading>
        <hr class="m-2">
        <people-selector
            .members="${this.families.flatMap(familyMembers)}"
            @on-member-selected="${(e: CustomEvent<MemberSelected>) => this.showFamilyCheckin(e.detail.member)}"
        ></people-selector>
      `}
    `
  }

  private showFamilyCheckin(member: Member) {
    this.existingFamily = findFamilyContaining(this.families, member);
  }

  private onCheckinPerformed(checkin: Checkin) {
    console.log(`Checkin performed : ${JSON.stringify(checkin)}`)
    this.checkins.push(checkin);
    this.existingFamily = undefined;
  }

  private onCheckinCancelled() {
    this.existingFamily = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kermesse-tracker-app': KermesseTrackerApp
  }
}
