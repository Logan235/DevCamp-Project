import React from "react";
import { NavBar } from "../../NavBar";

export const CodeHeader: React.FC  = () => {
    return (
      <NavBar
        isLoggedIn={true}
        variant="editor"
        userAvatar="/d09df851e636fc7377e7a5fb048706c0.jpg"
        userName="anh Huy"
      />
    ); 
}