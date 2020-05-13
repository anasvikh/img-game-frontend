import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import './HomeScreen.css'

type HomeScreenProps = {
    onCreateGame: any,
    onJoinGame: any,
}

export class HomeScreen extends Component<HomeScreenProps> {

    render() {
        return (
            <div className="main-menu home">
                <Button variant="outlined" size="large" color="primary" className="app-button"
                    onClick={this.props.onCreateGame}>Создать игру</Button>
                <Button variant="outlined" size="large" color="primary" className="app-button"
                    onClick={this.props.onJoinGame}>Присоединиться</Button>
            </div>
        )
    }
}