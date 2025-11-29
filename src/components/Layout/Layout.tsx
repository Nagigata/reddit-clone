import React from "react";
import Navbar from "../../Navbar/Navbar";
import AIChatWidget from "../Chatbot/AIChatWidget";

type LayoutProps = {
  children: any;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <AIChatWidget />
    </>
  );
};

export default Layout;
