'use client'

import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#2DD4BF',
      500: '#00A67E',
      600: '#00967A',
      700: '#00806B',
      800: '#006B5A',
      900: '#005748',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
    },
    FormLabel: {
      baseStyle: {
        color: 'gray.700',
      },
    },
    Heading: {
      baseStyle: {
        color: 'gray.800',
      },
    },
    Text: {
      baseStyle: {
        color: 'gray.800',
      },
    },
  },
})

export default theme 