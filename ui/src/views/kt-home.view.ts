import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {MemberSelected} from "../components/people-selector";
import {familyMembers, findFamilyContaining} from "../services/Families";
import {PersistedCheckins} from "../persistance/PersistedCheckins";
import {findPastCheckinsMatchingFamily} from "../services/Checkins";
import {FamiliesClient} from "../clients/FamiliesClient";

import "../components/stats-heading"
import "../components/people-selector"
import "../components/checkin-from-existing-family"

@customElement('kt-home')
export class KTHomeView extends LitElement {
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
    existingFamilyWithCheckins: FamilyWithCheckins|undefined = undefined;

    constructor() {
        super();

        FamiliesClient.INSTANCE.fetchFamilies(new Date().getFullYear())
            .then(families => {
                this.families = families;
            })

        PersistedCheckins.load()
            .then((checkins) => {
                this.checkins = checkins
            });
    }

    render() {
        return html`
      ${this.existingFamilyWithCheckins?html`
        <checkin-from-existing-family 
            .familyWithCheckins="${this.existingFamilyWithCheckins}"
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
        const matchingFamily = findFamilyContaining(this.families, member);
        const matchingPastCheckins = findPastCheckinsMatchingFamily(this.checkins, matchingFamily);

        this.existingFamilyWithCheckins = {
            family: matchingFamily,
            pastCheckins: matchingPastCheckins
        };
    }

    private onCheckinPerformed(checkin: Checkin) {
        console.log(`Checkin performed : ${JSON.stringify(checkin)}`)
        this.checkins.push(checkin);
        this.existingFamilyWithCheckins = undefined;

        PersistedCheckins.store(this.checkins);
    }

    private onCheckinCancelled() {
        this.existingFamilyWithCheckins = undefined;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'kt-home': KTHomeView
    }
}
