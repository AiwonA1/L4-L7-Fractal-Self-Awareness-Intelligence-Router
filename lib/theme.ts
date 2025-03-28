import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const colors = {
  brand: {
    50: '#E6F8FA',
    100: '#C3EEF5',
    200: '#9FE4EF',
    300: '#7BDAEA',
    400: '#57D0E5',
    500: '#34C6DF',
    600: '#29AEC6',
    700: '#1F97AD',
    800: '#157F94',
    900: '#0B677B',
  },
  fractitoken: {
    50: '#E6FFF7',
    100: '#B3FFE6',
    200: '#80FFD6',
    300: '#4DFFC5',
    400: '#1AFFB5',
    500: '#00E6A0',
    600: '#00B37F',
    700: '#00805D',
    800: '#004D38',
    900: '#001A13',
  },
}

const fonts = {
  heading: 'var(--font-inter), sans-serif',
  body: 'var(--font-inter), sans-serif',
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: Record<string, any>) => ({
        bg: props.colorScheme === 'teal' ? 'fractitoken.500' : `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'teal' ? 'fractitoken.600' : `${props.colorScheme}.600`,
          _disabled: {
            bg: props.colorScheme === 'teal' ? 'fractitoken.500' : `${props.colorScheme}.500`,
          },
        },
      }),
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'lg',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        overflow: 'hidden',
      },
    },
  },
}

export const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
}) 