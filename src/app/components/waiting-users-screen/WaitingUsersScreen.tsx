import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import './WaitingUsersScreen.css'

type WaitingUsersScreenProps = {
    gameId: number | null,
    usersList: string[],
    onStartGame: any,
}

export class WaitingUsersScreen extends Component<WaitingUsersScreenProps> {

    render() {
        return (
            <div className="main-menu waiting-users-screen">
                <div className="game-info">
                <div className="text">Код игры: {this.props.gameId}</div>
                <div className="text">
                    <div>Список игроков:</div>
                    {this.props.usersList.map(el => <div key={el}> {el} </div>)}
                </div>
                </div>
                <Button variant="outlined" size="large" color="primary" className="app-button start-game" onClick={this.props.onStartGame}>Начать игру</Button>
            </div>
        )
    }
}