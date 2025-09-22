class RouteConstants {
  constructor(path, name) {
    this.path = path;
    this.name = name;
  }
}

export default {
  HOME: new RouteConstants("/", "Home"),
  LOGIN: new RouteConstants("/login", "Login"),
  SIGN_UP: new RouteConstants("/cadastro-usuario", "SignUp"),
}
