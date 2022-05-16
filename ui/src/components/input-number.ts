import {html, css, LitElement} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {live} from "lit/directives/live.js";
import {numberInputValue} from "../services/Inputs";
import {SVG_MINUS_ICON, SVG_PLUS_ICON} from "../services/SVGs";


@customElement('input-number')
export class InputNumber extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`
    :host {
    }

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
  `]

  @property({type: Number})
  min: number = 0;

  @property({type: Number})
  value!: number;

  @query("input")
  $input!: HTMLInputElement;

  render() {
    return html`
      <div class="input-group flex-nowrap">
        <span class="input-group-text ps-1 pe-1"><slot name="label"></slot></span>
        <button class="btn btn-sm btn-primary" type="button" @click="${() => this.decrement()}"><span>${SVG_MINUS_ICON}</span></button>
        <input .id="${this.attributes.getNamedItem("id")?.value}"
               .style="${this.attributes.getNamedItem("style")?.value}"
               .value="${live(this.value)}"
               type="number" min="${this.min}"
               @change="${(e:InputEvent) => this.updateValue(e)}">
        <button class="btn btn-sm btn-primary" type="button" @click="${() => this.increment()}"><span>${SVG_PLUS_ICON}</span></button>
      </div>
    `
  }

  increment() {
    this.$input.stepUp();
    this.$input.dispatchEvent(new Event("change"));
  }

  decrement() {
    this.$input.stepDown();
    this.$input.dispatchEvent(new Event("change"));
  }

  updateValue(e: Event) {
    this.value = numberInputValue(e.currentTarget, this.min);
    this.dispatchEvent(new CustomEvent<number>('change', {
      detail: this.value
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'input-number': InputNumber
  }
}
