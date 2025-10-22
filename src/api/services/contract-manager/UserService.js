import BaseService from "../../BaseService.js";

class UserService extends BaseService {
  constructor() {
    super("managers");
  }

  async signIn(email, password) {
    const credentials = { email, password };
    const response = await this.post("sign-in", credentials);

    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.managerId));
    return response;
  }

  async signUp(data) {
    const response = await this.post("sign-up", data);

    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.managerId));
    return response;
  }

  signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getCurrentUser() {
    return {
      id: JSON.parse(localStorage.getItem("user")),
      token: localStorage.getItem("token")
    }
  }
}

export default new UserService();
