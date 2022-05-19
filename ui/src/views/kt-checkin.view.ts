import {html, css, LitElement, TemplateResult} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {repeat} from "lit/directives/repeat.js";
import {memberKey} from "@shared/domain/Members";
import {decodeMemberUrlParam} from "../services/Members";
import {
    findFamilyMembersNeverCheckedIn,
    findPastCheckinsMatchingFamily,
    pastCheckinMembers
} from "@shared/domain/Checkins";
import {formatTime} from "@shared/utils/DateAndTimes";
import {toFullTextNormalized} from "@shared/utils/Text";
import {FamiliesClient} from "../clients/FamiliesClient";
import {familiesMembers, findFamilyContaining} from "@shared/domain/Families";
import {GlobalState} from "../state/GlobalState.state";
import {Router} from "../routing/Router";

type CheckinMember = {
    idx: number;
    lastName: string;
    firstName: string;
    isPlanned: boolean;
} & ({ isPlanned: true, present: boolean } | { isPlanned: false, present: true })

abstract class AbstractKTCheckin extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`
    :host {
      display: block;
      padding: 4px 0px;
      width: 100%;
    }
    @media (max-width: 420px) { .name-col { width: 100%; } }
    @media (min-width: 420px) { .name-col { width: 50%; float: left; } }
  `]

    abstract initializeComponent(): Promise<{ adultsCount: number, nonSchoolChildrenCount: number, nonCheckedInMembers: Member[], pastCheckinMembers: Member[] }>;
    abstract schoolChildrenSection(): TemplateResult;
    abstract submitCheckin(): void;

    async connectedCallback() {
        super.connectedCallback();

        const {adultsCount, nonSchoolChildrenCount, nonCheckedInMembers, pastCheckinMembers} = await this.initializeComponent();
        this.adultsCount = adultsCount;
        this.nonSchoolChildrenCount = nonSchoolChildrenCount;
        this.pastCheckinMembers = pastCheckinMembers;
        this.nonCheckedInMembers = nonCheckedInMembers;

        this.updateCheckinMembers(false);
    }

  protected _pastCheckins: Checkin[]|undefined = undefined;

  @state() adultsCount!: number;
  @state() nonSchoolChildrenCount!: number;
  @state() nonCheckedInMembers!: Member[];
  @state() pastCheckinMembers!: Member[];
  @state() checkinMembers: CheckinMember[] = [];
  get plannedCheckinMembers(): CheckinMember[] { return this.checkinMembers.filter(cm => cm.isPlanned); }
  get plannedPresentCheckinMembers(): CheckinMember[] { return this.checkinMembers.filter(cm => cm.isPlanned && cm.present); }
  @state() validForm: boolean = false;

  render() {
    return html`
      <h4>Enfants scolarisés</h4>
      ${this.schoolChildrenSection()}
      <hr class="m-2"/>
      <h4>Membres de la famille</h4>
      <div class="row row-cols-lg-auto g-3 align-items-center">
        <div class="col-12">
          <label class="visually-hidden" for="adultsCount">Adults count</label>
          <div class="input-group">
            <input-number id="adultsCount" min="0" .value="${this.adultsCount}" style="width: 40px" 
                          @change="${(e:CustomEvent<number>) => this.updateAdultsCount(e.detail)}">
              <span slot="label">Adu</span>
            </input-number>
          </div>
        </div>
        <div class="col-12">
          <label class="visually-hidden" for="childrenCount">Children count</label>
          <div class="input-group">
            <input-number id="childrenCount" min="0" .value="${this.nonSchoolChildrenCount}" style="width: 40px"
                          @change="${(e:CustomEvent<number>) => this.updateNonSchoolChildrenCount(e.detail)}">
              <span slot="label">Enf</span>
            </input-number>
          </div>
        </div>
      </div>
      <table class="table table-sm table-borderless">
        <thead>
          <tr>
            <th scope="col" class="col-20">
              <div class="name-col">Nom</div>
              <div class="name-col">Prénom</div>
            </th>
            <th scope="col" class="col-4">Présence</th>
          </tr>
        </thead>
        <tbody>
        ${repeat(this.checkinMembers, cm => cm.idx, (cm: CheckinMember) => html`
          <tr style="border: 2px solid grey">
            <td class="col-20">
              <div class="name-col">
                <input type="text" class="w-100" name="lastName${cm.idx}"
                       .value="${cm.lastName}"
                       @change="${this.lastNameUpdatedFor(cm)}">
              </div>
              <div class="name-col">
                <input type="text" class="w-100" name="firstName${cm.idx}"
                       .value="${cm.firstName}"
                       @change="${this.firstNameUpdatedFor(cm)}">
              </div>
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
      
      ${this._pastCheckins?.length?html`
      <hr class="m-2"/>
      <h4>Checkins précédents</h4>
        <ul>
          ${repeat(this._pastCheckins, pc => `${pc.isoDate}_${pc.familyLastName}`, pc => html`
          <li>@${formatTime(pc.isoDate)} (${pc.creator}) - ${pc.counts.adults} Adu + ${pc.counts.nonSchoolChildren} Enf</li>
          `)}
        </ul>
        <table class="table table-sm">
          <thead>
          <tr>
            <th scope="col" class="col-12">Nom</th>
            <th scope="col" class="col-12">Prénom</th>
          </tr>
          </thead>
          <tbody>
        ${repeat(this.pastCheckinMembers, memberKey, m => html`
            <tr>
              <td>&nbsp;${m.lastName.toUpperCase()}</td>
              <td>&nbsp;${m.firstName}</td>
            </tr>
        `)}
          </tbody>
        </table>
      `:html``}
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
          :this.nonCheckedInMembers.map<CheckinMember>((m, idx) => ({
              idx,
              lastName: m.lastName.toUpperCase(),
              firstName: m.firstName,
              isPlanned: true,
              present: true
          }));

      const plannedAbsentMembers = plannedMembers.filter(cm => !cm.present);

      let updateRequested = false;
      if(!this.checkinMembers.length) {
          this.checkinMembers = plannedMembers;
          updateRequested = true;
      }

      const itemsCountToAdd = this.adultsCount + this.nonSchoolChildrenCount - this.checkinMembers.length + plannedAbsentMembers.length;
      if(itemsCountToAdd < 0) {
          this.checkinMembers.splice(this.checkinMembers.length + itemsCountToAdd, -itemsCountToAdd);
          updateRequested = true;
      } else if(itemsCountToAdd > 0) {
          new Array(itemsCountToAdd).fill(0).forEach(() => {
              this.checkinMembers.push({
                  idx: this.checkinMembers.length,
                  lastName: "",
                  firstName: "",
                  isPlanned: false,
                  present: true
              })
          })
          updateRequested = true;
      }

      if(updateRequested) {
          this.requestUpdate('checkinMembers');
      }

      this.updateValidForm();
  }

  updateValidForm(): void {
      const allRowsAreFilled = this.checkinMembers.reduce((isValid, cm) => {
          return isValid && (cm.firstName+cm.lastName)!=='';
      }, true as boolean);

      const names = this.checkinMembers.map(cm => `${toFullTextNormalized(cm.lastName).toLowerCase()}__${toFullTextNormalized(cm.firstName).toLowerCase()}`);
      const allNamesAreUnique = new Set(names).size === names.length;

      this.validForm = !!this.checkinMembers.length && allRowsAreFilled && allNamesAreUnique;
  }

  cancelCheckin(): void {
      Router.navigateToHome();
  }
}

@customElement('kt-checkin-from-existing-family')
export class KTCheckinFromExistingFamilyView extends AbstractKTCheckin {
    protected _family: Family|undefined = undefined;

    async initializeComponent(): Promise<{ adultsCount: number; nonSchoolChildrenCount: number; nonCheckedInMembers: Member[]; pastCheckinMembers: Member[] }> {
        const encodedMember = this.attributes.getNamedItem("encoded-member");
        if(!encodedMember) {
            throw new Error("Missing encoded-member attribute on kt-checkin-from-existing-family view !");
        }

        const families = await FamiliesClient.INSTANCE.fetchComputedFamilies(new Date().getFullYear());
        const members = familiesMembers(families);
        const member = decodeMemberUrlParam(members, encodedMember.value);

        this._family = findFamilyContaining(families, member);
        this._pastCheckins = findPastCheckinsMatchingFamily(
            GlobalState.INSTANCE.everyCheckins(),
            this._family);

        const family = this._family!;
        if(this._pastCheckins?.length) {
            const familyMembersNeverCheckedIn = findFamilyMembersNeverCheckedIn(family, this._pastCheckins);
            return {
                adultsCount: familyMembersNeverCheckedIn.length,
                nonSchoolChildrenCount: 0,
                pastCheckinMembers: pastCheckinMembers(this._pastCheckins),
                nonCheckedInMembers: familyMembersNeverCheckedIn,
            };
        } else {
            return {
                adultsCount: family.plannedCounts.adults,
                nonSchoolChildrenCount: family.plannedCounts.nonSchoolChildren,
                pastCheckinMembers: [],
                nonCheckedInMembers: family.members,
            };
        }
    }

    schoolChildrenSection() {
        return html`
          <ul>
            ${repeat(this._family?.schoolChildren || [], memberKey, (schoolChild: SchoolChild) => html`
              <li><strong>${schoolChild.lastName.toUpperCase()} ${schoolChild.firstName}</strong> (${schoolChild.className})</li>
            `)}
          </ul>
        `
    }

    async submitCheckin() {
        const checkin: Checkin = {
            creator: GlobalState.INSTANCE.settings()?.deviceName || "Inconnu",
            isoDate: new Date().toISOString(),
            familyLastName: this._family!.schoolChildren[0].lastName,
            members: ([] as Member[])
                .concat(...this.checkinMembers.filter(cm => cm.present).map(cm => ({
                    firstName: cm.firstName,
                    lastName: cm.lastName,
                    isSchoolChild: false
                }))),
            counts: {
                adults: this.adultsCount,
                nonSchoolChildren: this.nonSchoolChildrenCount,
                schoolChildren: this._family!.schoolChildren.length
            }
        };

        await GlobalState.INSTANCE.addLocalCheckin(checkin);

        Router.navigateToHome();
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'kt-checkin-from-existing-family': KTCheckinFromExistingFamilyView
  }
}
