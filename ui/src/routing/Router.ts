import page from "page";
import {html, TemplateResult} from "lit";

export type SlottedTemplateResultFactory = (subViewSlot: TemplateResult) => TemplateResult;

export type ViewChangedCallback = (templateResultCreator: SlottedTemplateResultFactory, path: string) => void;
export type ViewChangedCallbackCleaner = Function;
export type TitleProvider = (pathParams: Record<string, string>) => Promise<string>;

type RouteDeclaration = {
    doFirst: () => Promise<any>,
    viewContent: (pathParams: Record<string, string>) => Promise<SlottedTemplateResultFactory>|SlottedTemplateResultFactory;
    pageTitleProvider?: TitleProvider;
};

class Routing {
    public static readonly INSTANCE = new Routing();

    private static readonly DEFAULT_TITLE = 'Kermesse Tracker';
    private static readonly DEFAULT_TITLE_PROMISE: TitleProvider =
        () => Promise.resolve(Routing.DEFAULT_TITLE);

    private _viewChangeCallbacks: ViewChangedCallback[] = [];

    private _currentPath: string|undefined = undefined;

    public get basePath() {
        return import.meta.env.BASE_URL;
    }

    installRoutes(callback?: ViewChangedCallback): ViewChangedCallbackCleaner|undefined {
        const callbackCleaner = callback?this.onViewChanged(callback):undefined;

        page.redirect(`${this.basePath}home`, `/`);
        page.redirect(`${this.basePath}index.html`, `/`);

        this.declareRoutes('/', {
            doFirst: async () => import('../views/kt-home.view'),
            viewContent: async () => (subViewSlot) => html`<kt-home>${subViewSlot}</kt-home>`
        });

        page(`*`, () => this.navigateToHome());
        page();

        return callbackCleaner;
    }

    private declareRoutes(pathPattern: string|string[], routeDeclaration: RouteDeclaration) {
        const paths: string[] = (typeof pathPattern === 'string') ? [pathPattern] : pathPattern;
        paths.forEach(path => {
            this._declareRoute(
                path,
                routeDeclaration.doFirst,
                routeDeclaration.viewContent,
                routeDeclaration.pageTitleProvider || Routing.DEFAULT_TITLE_PROMISE
            );
        });
    }

    private _declareRoute(path: string, doFirst: () => Promise<any>, viewComponentCreator: (pathParams: Record<string, string>) => Promise<SlottedTemplateResultFactory>|SlottedTemplateResultFactory,
                          titlePromise = Routing.DEFAULT_TITLE_PROMISE) {
        page(`${this.basePath}${path.substring(path[0]==='/'?1:0)}`, async (context) => {
            await doFirst();

            const slottedViewComponentFactoryResult = viewComponentCreator(context.params);

            Promise.all([
                ((slottedViewComponentFactoryResult instanceof Promise)?
                    slottedViewComponentFactoryResult
                    :Promise.resolve(slottedViewComponentFactoryResult)),
                titlePromise(context.params).catch(() => Routing.DEFAULT_TITLE)
            ]).then(([slottedViewTemplateFactory, title]) => {
                this._currentPath = path;

                document.title = title;

                this._viewChangeCallbacks.forEach(callback => callback(slottedViewTemplateFactory, path));
            })
        });
    }

    onViewChanged(callback: ViewChangedCallback): ViewChangedCallbackCleaner {
        this._viewChangeCallbacks.push(callback);
        return () => {
            const idx = this._viewChangeCallbacks.findIndex(registeredCallback => registeredCallback === callback);
            this._viewChangeCallbacks.splice(idx, 1);
        }
    }

    navigateToHome() {
        page(`${this.basePath}`);
    }

    navigateToUrlIfPossible(url: string) {
        if(url) {
            window.open(url, '_blank', 'noreferrer')
        }
    }

    currentPath() {
        return this._currentPath;
    }
}

export const Router = Routing.INSTANCE;
