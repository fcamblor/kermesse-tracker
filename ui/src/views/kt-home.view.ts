import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {MemberSelected} from "../components/people-selector";
import {familyMembers} from "../services/Families";
import {FamiliesClient} from "../clients/FamiliesClient";

import "../components/stats-heading"
import "../components/people-selector"
import {Router} from "../routing/Router";
import {GlobalState} from "../state/GlobalState.state";

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
    localCheckins: Checkin[] = []

    constructor() {
        super();

        FamiliesClient.INSTANCE.fetchFamilies(new Date().getFullYear())
            .then(families => {
                this.families = families;
            })

        this.localCheckins = GlobalState.INSTANCE.localCheckins();
    }

    render() {
        return html`
    <stats-heading .checkins="${this.localCheckins}"></stats-heading>
    <hr class="m-2">
    <people-selector
        .members="${this.families.flatMap(familyMembers)}"
        @on-member-selected="${(e: CustomEvent<MemberSelected>) => this.showFamilyCheckin(e.detail.member)}"
    ></people-selector>
        `
    }

    private showFamilyCheckin(member: Member) {
        Router.navigateToCheckinFromExistingFamilyFor(member)
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'kt-home': KTHomeView
    }
}
