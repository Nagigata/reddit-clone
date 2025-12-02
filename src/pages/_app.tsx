import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

import { theme } from "../chakra/theme";
import Layout from "../components/Layout/Layout";
import "../styles/globals.css";
import { UserProvider } from "../context/userContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <UserProvider>
          <Layout>
            <Component {...pageProps} />      
          </Layout>
        </UserProvider>
      </ChakraProvider>
    </RecoilRoot>
  );
}

export default MyApp;
