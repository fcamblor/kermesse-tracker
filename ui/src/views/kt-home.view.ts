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
        this.fetchFamilies();
    }

    private async fetchFamilies() {
        this.families = await FamiliesClient.INSTANCE.fetchComputedFamilies(new Date().getFullYear());
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
    <stats-heading 
        .checkins="${this.checkins}" .localCheckins="${this.localCheckins}"
        @refreshRequested="${() => GlobalState.INSTANCE.synchronizeCheckins()}"
    ></stats-heading>
    <div style="background-color: #F8F4F9">
      <people-selector
          .members="${this.families.flatMap(familyMembers)}"
          .families="${this.families}"
          @on-member-selected="${(e: CustomEvent<MemberSelected>) => this.showFamilyCheckin(e.detail.member)}"
      ></people-selector>
      <button type="button" class="my-2 btn btn-primary mx-2" @click="${() => Router.navigateToSettingsPage()}">Configuration</button>
    </div>
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
