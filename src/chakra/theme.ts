import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";
import { extendTheme } from "@chakra-ui/react";
import { Button } from "./Button";

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  initialColorMode: "system",
  useSystemColorMode: true,
  colors: {
    brand: {
      100: "#FF3C00",
    },
  },
  fonts: {
    body: "Open Sans, sans-serif",
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === "light" ? "#DAE0E6" : "#030303",
        transition: "background-color 0.2s ease-in-out",
      },
      "*": {
        transition: "all 0.2s ease-in-out",
      },
    }),
  },
  shadows: {
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    cardHover: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    navbar: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  components: {
    Button,
  },
});
