import {html, css, LitElement} from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {CSS_Global} from "./styles/ConstructibleStyleSheets";
import {Router, SlottedTemplateResultFactory} from "./routing/Router";
import {ClientDatasource} from "./clients/ClientDatasource";
import {GlobalState} from "./state/GlobalState.state";

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

  @state() viewTemplateResult: SlottedTemplateResultFactory|undefined = undefined;

  private checkinBackgroundSyncIntervalId: number|undefined = undefined;

  constructor() {
    super();

    GlobalState.INSTANCE.subscribe("change:settings", (settings) => {
        if(settings) {
            ClientDatasource.INSTANCE.use({
                baseUrl: settings.baseUrl,
                authToken: settings.authToken
            })
            this.synchronizeCheckins();
        }
    })

    GlobalState.INSTANCE.init()
        .then(() => {
          Router.installRoutes({ dispatch: ClientDatasource.INSTANCE.isConfigured() }, (viewTemplateResult) => {
            this.viewTemplateResult = viewTemplateResult;
          })

          if(!ClientDatasource.INSTANCE.isConfigured()) {
              Router.navigateToSettingsPage();
          }
        })

    this.checkinBackgroundSyncIntervalId = setInterval(async () => {
        this.synchronizeCheckins();
    }, 60000)
  }

  private async synchronizeCheckins() {
      if(ClientDatasource.INSTANCE.isConfigured()) {
          await GlobalState.INSTANCE.synchronizeCheckins();
      }
  }

  render() {
    return html`
      ${this.viewTemplateResult?this.viewTemplateResult(html`
        <!-- slots here -->
      `):html``}
    `
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.checkinBackgroundSyncIntervalId);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kermesse-tracker-app': KermesseTrackerApp
  }
}
