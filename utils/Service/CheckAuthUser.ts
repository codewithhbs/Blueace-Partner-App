import { getValueFor } from "./SecureStore";

class CheckAuthentication {
  isAuthenticated: boolean;

  constructor() {
    this.isAuthenticated = false;
  }

  async authenticate() {
    const token = await getValueFor("token");

    if (token) {
      this.isAuthenticated = true;
    } else {
      this.isAuthenticated = false;
    }
  }
}

export default CheckAuthentication;
