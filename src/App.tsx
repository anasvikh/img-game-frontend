import React from 'react';
import logo from './assets/svg/sheep.svg';
import './App.css';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { lightBlue, pink } from '@material-ui/core/colors';
import { Content } from './app/components/content/Content';

function App() {

  const theme = createMuiTheme({
    palette: {
      primary: lightBlue,
      secondary: pink,
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <div style={{ position: 'relative', height: 'inherit' }}>
            <img src={logo} className="App-logo" alt="logo" />
            <div className="App-version">v.0.0.1</div>
          </div>
          <div className="App-name">Momentum</div>
        </header>
        <Content></Content>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
