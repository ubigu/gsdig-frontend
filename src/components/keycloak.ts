import Keycloak from "keycloak-js";

// TODO: Get these from env parameter
const keycloak = new Keycloak({
  url: "http://127.0.0.1:8082/",
  realm: "gsdig",
  clientId: "gsdig",
});

export default keycloak;
