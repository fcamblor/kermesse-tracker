import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {MemberSelected} from "../components/people-selector";
import {familyMembers} from "@shared/domain/Families";
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

    @state() checkins: Checkin[] = GlobalState.INSTANCE.checkins()
    @state() localCheckins: Checkin[] = GlobalState.INSTANCE.localCheckins()

    private listenerCleaners: Array<Function> = [];

    constructor() {
        super();

        FamiliesClient.INSTANCE.fetchComputedFamilies(new Date().getFullYear())
            .then(families => {
                this.families = families;
            })
    }


    connectedCallback() {
        super.connectedCallback();

        this.listenerCleaners.push(GlobalState.INSTANCE.subscribe("change:checkins", (checkins) => {
            this.checkins = checkins;
        }));
        this.listenerCleaners.push(GlobalState.INSTANCE.subscribe("change:localCheckins", (localCheckins) => {
            this.localCheckins = localCheckins;
        }));
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.listenerCleaners.forEach(listener => listener());
    }

    render() {
        return html`
    <stats-heading .checkins="${this.checkins}" .localCheckins="${this.localCheckins}"></stats-heading>
    <hr class="m-2">
    <people-selector
        .members="${this.families.flatMap(familyMembers)}"
        @on-member-selected="${(e: CustomEvent<MemberSelected>) => this.showFamilyCheckin(e.detail.member)}"
    ></people-selector>
    <button type="button" class="btn btn-primary mx-2" @click="${() => Router.navigateToSettingsPage()}">Configuration</button>
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
