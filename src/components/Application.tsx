import React from 'react';
import { theme } from '@src/themes/theme';
import { ThemeProvider } from '@material-ui/core/styles';
import TranslationProvider from '@src/translation/TranslationContext';
import ApplicationBase from './ApplicationBase';
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'

/** Application entry point wrapper */
const Application = () => {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={({
        onLoad: "login-required",
        checkLoginIframe: false
      })}
    >
      <TranslationProvider>
        <ThemeProvider theme={theme}>
          <ApplicationBase />
        </ThemeProvider>
      </TranslationProvider>
    </ReactKeycloakProvider>
  );
};

export default Application;
