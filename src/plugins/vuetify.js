import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    background: '#FFFFFF',
                    surface: '#FFFFFF',
                    primary: '#1976D2',
                    secondary: '#424242',
                },
            },
            dark: {
                dark: true,
                colors: {
                    background: '#121212',
                    surface: '#1E1E1E',
                    primary: '#1976D2',
                    secondary: '#B0BEC5',
                },
            },
        },
    },
})

