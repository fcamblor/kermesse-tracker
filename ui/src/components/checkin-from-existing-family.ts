import {html, css, LitElement} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {repeat} from "lit/directives/repeat.js";
import {memberKey} from "../services/Members";
import {toFullTextNormalized} from "../services/Text";

type CheckinMember = {
    idx: number;
    lastName: string;
    firstName: string;
    isPlanned: boolean;
} & ({ isPlanned: true, present: boolean } | { isPlanned: false, present: true })

@customElement('checkin-from-existing-family')
export class CheckinFromExistingFamily extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`
    :host {
      display: block;
      padding: 4px 0px;
      width: 100%;
    }
  `]

  @property({type: Array})
  set family(family: Family) {
    this._family = family;
    this.adultsCount = this.family.plannedCounts.adults;
    this.nonSchoolChildrenCount = this.family.plannedCounts.nonSchoolChildren;
    this.updateCheckinMembers(false);
  }
  get family(): Family {
    return this._family;
  }
  _family!: Family;

  @state() adultsCount!: number;
  @state() nonSchoolChildrenCount!: number;
  @state() checkinMembers!: CheckinMember[];
  get plannedCheckinMembers(): CheckinMember[] { return this.checkinMembers.filter(cm => cm.isPlanned); }
  get plannedPresentCheckinMembers(): CheckinMember[] { return this.checkinMembers.filter(cm => cm.isPlanned && cm.present); }
  @state() validForm: boolean = false;

  render() {
    return html`
      <h4>Enfants scolarisés</h4>
      <ul>
        ${repeat(this.family.schoolChildren, memberKey, (schoolChild: SchoolChild) => html`
          <li><strong>${schoolChild.lastName.toUpperCase()} ${schoolChild.firstName}</strong> (${schoolChild.className})</li>
        `)}
      </ul>
      <hr class="m-2"/>
      <h4>Membres de la famille</h4>
      <div class="row row-cols-lg-auto g-3 align-items-center">
        <div class="col-12">
          <label class="visually-hidden" for="adultsCount">Adults count</label>
          <div class="input-group">
            <input-number id="adultsCount" min="0" .value="${this.adultsCount}" style="width: 40px" 
                          @change="${(e:CustomEvent<number>) => this.updateAdultsCount(e.detail)}">
              <span slot="label">Adultes</span>
            </input-number>
          </div>
        </div>
        <div class="col-12">
          <label class="visually-hidden" for="childrenCount">Children count</label>
          <div class="input-group">
            <input-number id="childrenCount" min="0" .value="${this.nonSchoolChildrenCount}" style="width: 40px"
                          @change="${(e:CustomEvent<number>) => this.updateNonSchoolChildrenCount(e.detail)}">
              <span slot="label">Enfants</span>
            </input-number>
          </div>
        </div>
      </div>
      <table class="table table-sm table-borderless">
        <thead>
          <tr>
            <th scope="col" class="col-10">Nom</th>
            <th scope="col" class="col-10">Prénom</th>
            <th scope="col" class="col-4">Présence</th>
          </tr>
        </thead>
        <tbody>
        ${repeat(this.checkinMembers, cm => cm.idx, (cm: CheckinMember) => html`
          <tr>
            <td class="col-10">
              <input type="text" class="w-100" name="lastName${cm.idx}" 
                     .value="${cm.lastName}"
                     @change="${this.lastNameUpdatedFor(cm)}">
            </td>
            <td class="col-10">
              <input type="text" class="w-100" name="firstName${cm.idx}"
                     .value="${cm.firstName}"
                     @change="${this.firstNameUpdatedFor(cm)}">
            </td>
            <td class="col-4">
              ${cm.isPlanned?html`
              <div class="btn-group" role="group" aria-label="Présence">
                <input type="radio" class="btn-check" name="presence${cm.idx}" 
                       id="present${cm.idx}" autocomplete="off" .checked="${cm.present}"
                       @change="${this.presenceUpdatedFor(cm)}">
                <label class="btn btn-outline-primary" for="present${cm.idx}">Pré</label>

                <input type="radio" class="btn-check" name="presence${cm.idx}" 
                       id="absent${cm.idx}" autocomplete="off" .checked="${!cm.present}"
                       @change="${this.absenceUpdatedFor(cm)}">
                <label class="btn btn-outline-secondary" for="absent${cm.idx}">Abs</label>
              </div>`:html`&nbsp;`}
            </td>
          </tr>
        `)}
        </tbody>
      </table>
      <div class="ps-2">
        <button type="button" class="btn btn-lg btn-primary" @click=${() => this.submitCheckin()} .disabled="${!this.validForm}">Valider</button>
        <button type="button" class="btn btn-lg btn-warning" @click="${() => this.cancelCheckin()}">Retour</button>
      </div>
    `
  }

  lastNameUpdatedFor(checkinMember: CheckinMember) {
      return (e: InputEvent) => {
          checkinMember.lastName = (e.target as HTMLInputElement).value.toUpperCase();
          this.updateValidForm();
      }
  }

  firstNameUpdatedFor(checkinMember: CheckinMember) {
      return (e: InputEvent) => {
          checkinMember.firstName = (e.target as HTMLInputElement).value;
          this.updateValidForm();
      }
  }

  presenceUpdatedFor(checkinMember: CheckinMember) {
      return (e: InputEvent) => {
          checkinMember.present = (e.target as HTMLInputElement).checked;
          this.adultsCount++;
          this.updateCheckinMembers();
      }
  }

  absenceUpdatedFor(checkinMember: CheckinMember) {
      return (e: InputEvent) => {
          checkinMember.present = !(e.target as HTMLInputElement).checked;
          this.updateCheckinMembers();
      }
  }

  updateNonSchoolChildrenCount(count: number) {
      this.nonSchoolChildrenCount = count;
      if(this.nonSchoolChildrenCount + this.adultsCount < this.plannedPresentCheckinMembers.length) {
          this.adultsCount = this.plannedPresentCheckinMembers.length - this.nonSchoolChildrenCount;
      }
      this.updateCheckinMembers();
  }

  updateAdultsCount(count: number) {
      this.adultsCount = count;
      if(this.nonSchoolChildrenCount + this.adultsCount < this.plannedPresentCheckinMembers.length) {
          this.nonSchoolChildrenCount = this.plannedPresentCheckinMembers.length - this.adultsCount;
      }
      this.updateCheckinMembers();
  }

  updateCheckinMembers(keepExistingPlannedMembers: boolean = true): void {
      const plannedMembers: CheckinMember[] = keepExistingPlannedMembers?
          this.plannedCheckinMembers
          :this.family.members.map<CheckinMember>((m, idx) => ({
              idx,
              lastName: m.lastName.toUpperCase(),
              firstName: m.firstName,
              isPlanned: true,
              present: true
          }));

      const plannedPresentMembers = plannedMembers.filter(cm => cm.present);

      this.checkinMembers = plannedMembers.concat(...new Array(
          Math.max(this.adultsCount + this.nonSchoolChildrenCount - plannedPresentMembers.length, 0)
      ).fill(0).map<CheckinMember>((_, idx) => ({
          idx: idx + plannedMembers.length,
          lastName: "",
          firstName: "",
          isPlanned: false,
          present: true
      })))

      this.updateValidForm();
  }

  updateValidForm(): void {
      const allRowsAreFilled = this.checkinMembers.reduce((isValid, cm) => {
          return isValid && (cm.firstName+cm.lastName)!=='';
      }, true as boolean);

      const names = this.checkinMembers.map(cm => `${toFullTextNormalized(cm.lastName).toLowerCase()}__${toFullTextNormalized(cm.firstName).toLowerCase()}`);
      const allNamesAreUnique = new Set(names).size === names.length;

      this.validForm = allRowsAreFilled && allNamesAreUnique;
  }

  cancelCheckin(): void {
      this.dispatchEvent(new CustomEvent<void>('on-checkin-cancelled', {
      }));
  }

  submitCheckin(): void {
      const checkin: Checkin = {
          isoDate: new Date().toISOString(),
          familyLastName: this.family.schoolChildren[0].lastName,
          members: ([] as Member[])
              .concat(...this.family.schoolChildren)
              .concat(...this.checkinMembers.filter(cm => cm.present).map(cm => ({
                  firstName: cm.firstName,
                  lastName: cm.lastName,
                  isSchoolChild: false
              }))),
          counts: {
              adults: this.adultsCount,
              nonSchoolChildren: this.nonSchoolChildrenCount,
              schoolChildren: this.family.schoolChildren.length
          }
      };
      this.dispatchEvent(new CustomEvent<Checkin>('on-checkin-performed', {
          detail: checkin
      }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'checkin-from-existing-family': CheckinFromExistingFamily
  }
}
