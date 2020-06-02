import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import './HomeScreen.css'

type HomeScreenProps = {
    onCreateGame: any,
    onJoinGame: any,
    onCheckSuperUser: any
    onShowAuthors: any
}

export class HomeScreen extends Component<HomeScreenProps> {
    render() {
        return (
            <div className="main-menu home">
                <Button variant="outlined" size="large" color="primary" className="app-button"
                    onClick={this.props.onCreateGame}>Создать игру</Button>
                <Button variant="outlined" size="large" color="primary" className="app-button"
                    onClick={this.props.onJoinGame}>Присоединиться</Button>
                <Button size="large" color="primary" className="app-button"
                    onClick={this.props.onShowAuthors}>Авторы</Button>
                <div className="secret-field" onClick={this.props.onCheckSuperUser}>
                </div>
            </div>
        )
    }
}