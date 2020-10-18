import React from "react";

import { BrowserRouter as Router } from "react-router-dom";
import BaseRouter from "./routes";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import CustomLayout from "./containers/Layout";
import LoadingBackdrop from "./components/LoadingBackdrop";

let theme = createMuiTheme({
  spacing: 8,
  palette: {
    primary: {
      main: "#462A74",
    },
    secondary: {
      main: "#AC4B38",
    },
    tertiary: {
      main: "#fff",
    },
    background: {
      default: "#1F1F1F",
      paper: "#fff",
    },
  },
});

function App() {
  return (
    <div className="App">
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <CustomLayout>
            <BaseRouter />
          </CustomLayout>
          <LoadingBackdrop />
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;
