import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost/auth',
    realm: 'restaurant-realm',
    clientId: 'restaurant-app'
});

export default keycloak;