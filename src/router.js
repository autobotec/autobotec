export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentParams = {};

    window.addEventListener('popstate', () => this.handleRoute());

    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.getAttribute('href'));
      }
    });
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.history.pushState(null, null, path);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    this.currentParams = {};

    for (const route in this.routes) {
      const routePattern = route.replace(/:\w+/g, '([^/]+)');
      const regex = new RegExp(`^${routePattern}$`);
      const match = path.match(regex);

      if (match) {
        const paramNames = route.match(/:\w+/g) || [];
        paramNames.forEach((paramName, index) => {
          this.currentParams[paramName.substring(1)] = match[index + 1];
        });

        this.currentRoute = route;
        this.routes[route](this.currentParams);
        return;
      }
    }

    if (this.routes['*']) {
      this.routes['*']();
    }
  }

  start() {
    this.handleRoute();
  }
}

export const router = new Router();
