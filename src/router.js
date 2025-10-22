class Router {
  constructor() {
    this.routes = [];
    window.addEventListener('popstate', () => this.resolve());
  }

  on(path, callback) {
    this.routes.push({ path, callback });
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.resolve();
  }

  resolve() {
    const path = window.location.pathname;

    for (const route of this.routes) {
      const regex = new RegExp('^' + route.path.replace(/:\w+/g, '([^/]+)') + '$');
      const match = path.match(regex);

      if (match) {
        const params = {};
        const keys = route.path.match(/:\w+/g);

        if (keys) {
          keys.forEach((key, index) => {
            params[key.substring(1)] = match[index + 1];
          });
        }

        route.callback(params);
        return;
      }
    }

    const defaultRoute = this.routes.find(r => r.path === '/');
    if (defaultRoute) {
      defaultRoute.callback();
    }
  }
}

export const router = new Router();
