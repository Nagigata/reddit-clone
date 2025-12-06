import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

import { theme } from "../chakra/theme";
import Layout from "../components/Layout/Layout";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <AuthProvider>
        <ProgressBar />
        <Layout>
          <Component {...pageProps} />
        </Layout>
        </AuthProvider>
      </ChakraProvider>
    </RecoilRoot>
  );
}

export default MyApp;
