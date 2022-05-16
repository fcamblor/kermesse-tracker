import {css, html, LitElement, unsafeCSS} from 'lit'
import {repeat} from 'lit/directives/repeat.js';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, property, query, state} from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import peopleSelectorCss from "./people-selector.scss";
import { toFullTextNormalized } from '@shared/domain/Text';
import {memberKey} from "@shared/domain/Members";
import {SVG_CLOSE_ICON} from "../services/SVGs";

export type MemberSelected = { member: Member };

@customElement('people-selector')
export class PeopleSelector extends LitElement {
  //language=css
  static styles = [
      CSS_Global,
      css`${unsafeCSS(peopleSelectorCss)}`,
      css`
    :host {
      display: block;
      padding: 4px 16px;
      width: 100%;
    }
  `]

  @property({type: Object})
  set value (m: Member | undefined) {
    this._currentValue = m
    if (m === undefined) {
        this.filter = ''
    } else {
        this.fillMember(m)
    }
  }

  @state() private _currentValue: Member | undefined = undefined
  @state() inputHasFocus: boolean = false;

  @query(".autocomplete-input") $autoCompleteInput!: HTMLInputElement | undefined;
  @query(".autocomplete-results") $autoCompleteResults!: HTMLUListElement | undefined;
  @query(".autocomplete-result[aria-selected='true']") $autoCompleteSelectedResult!: HTMLOptionElement | undefined;

  @state() filter: string = "";
  @state() suggestions: Array<Member> = []

  @property({type: Array})
  members: Member[] = []


  render() {
    // const content = html`
    //   <input type="text" name="members" />
    // `
    return html`
          <form class="row align-items-center"
                @submit="${this.handleSubmit}">
            <label for="membersSearch">
                Recherche:
            </label>
            <div class="px-0 col autocomplete ${classMap({'_open': this.showDropdown, '_withButton': this.filter !== ''})}">
                <input type="search" class="autocomplete-input"
                    autocomplete="off"
                    required
                    @focusin="${this.onFocusIn}"
                    @focusout="${this.onInputBlur}"
                    @keydown="${this.handleKeydown}"
                    @keyup="${this.valueChanged}"
                    .value="${this.filter}"
                    placeholder="Recherche par nom ou prénom"
                    id="membersSearch"
                />
                ${this.filter?html`
                <button type="button" title="Effacer" class="autocomplete-button" @click="${() => { this.filter = ''; this.shadowRoot!.querySelector("input")!.focus(); } }"><span>${SVG_CLOSE_ICON}</span></button>
                `:html``}
                ${this.showDropdown?html`<ul role="listbox" class="autocomplete-results">${this.renderListItems()}</ul>`:html``}
            </div>
          </form>
    `
  }

    renderListItems() {
        return repeat(this.suggestions, memberKey, (suggestion, index) => this.renderMemberItem(suggestion, index));
    }

    private onFocusIn(e: Event) {
        this.inputHasFocus = true
        if (window.matchMedia("(max-width: 700px)").matches) {
            window.scroll({top: this.offsetTop - 32, behavior: 'smooth'})
        }

        const input = e.target as HTMLInputElement
        if (this._currentValue && input) {
            input.select()
        }
    }

    get showDropdown() {
        return this.inputHasFocus
            && this.filter
            && this.suggestions.length > 0;
    }

    private onInputBlur() {
        setTimeout(() => {
            this.inputHasFocus = (this.shadowRoot!.querySelector("input") === this.shadowRoot!.activeElement);
        }, 300);
    }

    private async valueChanged(event: KeyboardEvent) {
        const input = event.currentTarget as HTMLInputElement
        if (event.code === 'Escape') {
            input.blur()
        }
        const keysToIgnore = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
        if (keysToIgnore.includes(event.key)) {
            return
        }
        this.filter = input.value;
        const suggestions = await this.suggest(this.filter)
        this.suggestions = suggestions
    }

    private async suggest(prefix: string): Promise<Array<Member>> {
        if (prefix.length < 1) {
            return []
        }

        const terms = PeopleSelector.normalize(prefix).split(" ")
        const members = await this.members.filter(member => {
            const searchableMember = `${member.lastName.toLowerCase()} ${member.firstName.toLowerCase()}`
            return terms.reduce((allTermsMatch: boolean, term: string) => {
                return allTermsMatch && searchableMember.includes(term);
            }, true);
        });
        return [ ...members ]
    }

    private static normalize(term: string): string {
        return toFullTextNormalized(term);
    }

    private memberSelected(member: Member) {
        this.suggestions = []
        this.filter = memberKey(member);
        this.dispatchEvent(new CustomEvent<MemberSelected>('on-member-selected', {
            detail: { member }
        }));
    }

    handleSubmit(event: Event) {
        event.preventDefault();
        if (this.$autoCompleteSelectedResult) {
            this.$autoCompleteSelectedResult.click();
            this.$autoCompleteInput?.blur();
        }
    }

    handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                const prevOption = this.$autoCompleteSelectedResult?.previousElementSibling;
                if (prevOption) {
                    this.$autoCompleteSelectedResult?.setAttribute('aria-selected', 'false');
                    prevOption.setAttribute('aria-selected', 'true');
                }
                this.scrollToOption('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                const nextOption = this.$autoCompleteSelectedResult?.nextElementSibling;
                if (nextOption) {
                    this.$autoCompleteSelectedResult?.setAttribute('aria-selected', 'false');
                    nextOption.setAttribute('aria-selected', 'true');
                }
                this.scrollToOption('down');
                break;
            default:
                break;
        }
    }

    scrollToOption(direction: 'up' | 'down') {
        const containerPosition = this.$autoCompleteResults?.getBoundingClientRect();
        const optionPosition = this.$autoCompleteSelectedResult?.getBoundingClientRect();

        if (this.$autoCompleteResults && containerPosition && optionPosition) {
            if (direction === 'down' && optionPosition.bottom > containerPosition.bottom) {
                this.$autoCompleteResults.scrollTop += optionPosition.bottom - containerPosition.bottom;
            } else if (direction === 'up' && optionPosition.top < containerPosition.top) {
                this.$autoCompleteResults.scrollTop -= containerPosition.top - optionPosition.top;
            }
        }
    }

    private fillMember(member: Member) {
        this.filter = memberKey(member);
    }

    private renderMemberItem(member: Member, index: number) {
        return html`
          <li
              class="autocomplete-result"
              role="option"
              aria-selected="${index === 0}"
              @click="${() => this.memberSelected(member)}"
          >
            <span class="member">${memberKey(member)}</span>
          </li>`
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'people-selector': PeopleSelector
  }
}
