import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.acreom.app',
    appName: 'acreom',
    webDir: 'dist',
    bundledWebRuntime: false,
    plugins: {
        SplashScreen: {
            launchShowDuration: 500,
            launchAutoHide: false,
        },
        GoogleAuth: {
            scopes: ['profile', 'email'],
            androidClientId:
                '298411705076-ahe6qbh5kut2qrvl089vgu7n6tek24nm.apps.googleusercontent.com',
            iosClientId:
                '298411705076-6lun2nnsrfrk9h2a707t14mrqsr0h0d7.apps.googleusercontent.com',
            forceCodeForRefreshToken: true,
        },
    },
    server:
        process.env.NODE_ENV === 'production'
            ? undefined
            : {
                  androidScheme: 'http',
                  url: 'http://localhost:3000/',
                  cleartext: true,
              },
    backgroundColor: '#1e232d',
    android: {
        backgroundColor: '#1e232d',
    },
    ios: {
        allowsLinkPreview: false,
        backgroundColor: '#1e232d',
        scrollEnabled: false,
    },
};

export default config;
