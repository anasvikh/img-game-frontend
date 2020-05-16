import React from 'react';
import logo from './assets/svg/trees.svg';
import './App.css';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { lightBlue, pink } from '@material-ui/core/colors';
import { Game } from './app/components/game/Game';

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
          <img src={logo} className="App-logo" alt="logo" />
          <div className="App-name">Momentum</div>
        </header>
        <Game></Game>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
