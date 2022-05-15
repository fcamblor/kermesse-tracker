import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {GlobalState} from "../state/GlobalState.state";
import {PersistedSettings} from "../persistance/LocalstoragePersistor";
import {ClientDatasource} from "../clients/ClientDatasource";
import {Router} from "../routing/Router";
import {inputValue} from "../services/Text";
import {AuthClient} from "../clients/AuthClient";

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

    @state() deviceName: string|undefined = GlobalState.INSTANCE.settings()?.deviceName
    @state() baseUrl: string|undefined = GlobalState.INSTANCE.settings()?.baseUrl
    @state() authToken: string|undefined = GlobalState.INSTANCE.settings()?.authToken

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
                  <option value="https://kermesse-tracker.herokuapp.com" .checked="${this.baseUrl===undefined || this.baseUrl==='https://kermesse-tracker.herokuapp.com'}">Prod</option>
                  <option value="http://localhost:3000" .checked="${this.baseUrl==='http://localhost:3000'}">Localhost</option>
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
        this.deviceName = inputValue(event.currentTarget);
    }

    baseUrlUpdated(event: InputEvent) {
        this.baseUrl = inputValue(event.currentTarget);
        this.verifyAuthToken();
    }

    authTokenUpdated(event: InputEvent) {
        this.authToken = inputValue(event.currentTarget);
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

    submitSettings() {
        const settings: Settings = {
            baseUrl: this.baseUrl!,
            authToken: this.authToken!,
            deviceName: this.deviceName!
        };

        PersistedSettings.store(settings);
        ClientDatasource.INSTANCE.use({
            baseUrl: settings.baseUrl!,
            authToken: settings.authToken!
        })

        Router.navigateToHome();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'kt-settings': KTSettingsView
    }
}
