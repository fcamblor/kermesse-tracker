import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {GlobalState} from "../state/GlobalState.state";
import {Router} from "../routing/Router";
import {inputValue} from "../services/Inputs";
import {AuthClient} from "../clients/AuthClient";

const PROD_URL = "https://kermesse-tracker.herokuapp.com";
const LOCAL_URL = "http://localhost:3000";

@customElement('kt-settings')
export class KTSettingsView extends LitElement {
    //language=css
    static styles = [
        CSS_Global,
        css`
    :host {
      display: block;
      padding: 0px 6px;
    }
    `]

    @state() deviceName: string = GlobalState.INSTANCE.settings()?.deviceName || ""
    @state() baseUrl: string = GlobalState.INSTANCE.settings()?.baseUrl || PROD_URL
    @state() authToken: string = new URLSearchParams(window.location.search).get("authToken") || GlobalState.INSTANCE.settings()?.authToken || ""

    @state()
    authTokenVerified: boolean = false;

    connectedCallback() {
        super.connectedCallback();

        this.verifyAuthToken();
    }

    render() {
        return html`
            <h3>Configuration</h3>
            <div class="row">
              <label for="deviceName" class="col-sm-8 col-form-label col-form-label-lg">Nom téléphone</label>
              <div class="col-sm-16">
                <input type="text" class="form-control form-control-lg" id="deviceName" .value="${this.deviceName || ""}" @change="${(e: InputEvent) => this.deviceNameUpdated(e)}">
              </div>
            </div>
            <div class="row">
              <label for="baseUrl" class="col-sm-8 col-form-label col-form-label-lg">Serveur</label>
              <div class="col-sm-16">
                <select class="form-select form-select-lg" id="baseUrl" @change="${(e: InputEvent) => this.baseUrlUpdated(e)}">
                  <option value="${PROD_URL}" .selected="${this.baseUrl===undefined || this.baseUrl===PROD_URL}">Prod</option>
                  <option value="${LOCAL_URL}" .selected="${this.baseUrl===LOCAL_URL}">Localhost</option>
                </select>
              </div>
            </div>
            <div class="row">
              <label for="authToken" class="col-sm-8 col-form-label col-form-label-lg">
                Authentification 
                <span class="ms-1">${this.authTokenVerified?'✅':'❌'}</span>
              </label>
              <div class="col-sm-16">
                <input type="text" class="form-control form-control-lg" id="authToken" .value="${this.authToken || ""}" @change="${(e: InputEvent) => this.authTokenUpdated(e)}">
              </div>
            </div>
            <div class="py-4 px-2">
              <button type="button" class="btn btn-lg btn-primary" @click=${() => this.submitSettings()} .disabled="${!this.validForm}">Valider</button>
            </div>
        `
    }

    deviceNameUpdated(event: InputEvent) {
        this.deviceName = inputValue(event.currentTarget) || "";
    }

    baseUrlUpdated(event: InputEvent) {
        this.baseUrl = inputValue(event.currentTarget) || "";
        this.verifyAuthToken();
    }

    authTokenUpdated(event: InputEvent) {
        this.authToken = inputValue(event.currentTarget) || "";
        this.verifyAuthToken();
    }

    async verifyAuthToken() {
        if(this.baseUrl && this.authToken) {
            this.authTokenVerified = await AuthClient.INSTANCE.verifyAuthValid({
                baseUrl: this.baseUrl,
                authToken: this.authToken
            })
        }
    }

    get validForm() {
        return this.baseUrl && this.deviceName && this.authToken && this.authTokenVerified;
    }

    async submitSettings() {
        const settings: Settings = {
            baseUrl: this.baseUrl!,
            authToken: this.authToken!,
            deviceName: this.deviceName!
        };

        await GlobalState.INSTANCE.updateSettings(settings);

        Router.navigateToHome();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'kt-settings': KTSettingsView
    }
}
