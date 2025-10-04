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
                colors: {
                    primary: '#1976D2',
                    secondary: '#5A6C87',
                    surface: 'rgba(229,237,246,0.9)',
                    background: 'rgba(127,138,155,0.58)',
                },
            },
            dark: {
                colors: {
                    primary: '#2196F3',
                    secondary: '#90A4AE',
                    surface: '#1E1E2E',
                    background: '#121212',
                },
            },
        },
    },
})