import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import './WaitingUsers.css'
import { ScreenStateEnum } from '../../models/enums/screen-state.enum';

type WaitingUsersProps = {
    hub: any;
    history: any;
    gameId: number | null,
    isGameCreator: boolean
}

type WaitingUsersState = {
    usersList: string[],
}

export default class WaitingUsers extends Component<WaitingUsersProps, WaitingUsersState> {
    constructor(props: Readonly<WaitingUsersProps>) {
        super(props);

        this.state = {
            usersList: []
        };
    }

    componentDidMount = () => {
        this.props.hub.on('startGame', (gameId: number, receivedMessage: string) => {
            console.log(receivedMessage);
            localStorage.setItem('IMG_is_guessing_mode', 'false');
            localStorage.setItem('IMG_screen_state', ScreenStateEnum.Game.toString());
            this.props.history.push('/game');
        });
        
        this.props.hub.on('getUsers', (usersList: string[]) => {
            console.log(usersList);
            this.setState({
                usersList
            })
        });
        
        this.getUsers();
    }

    startGame = () => {
        this.props.hub
            .invoke('startGame', this.props.gameId)
            .catch((err: any) => console.error(err));
    };

    getUsers = () => {
        this.props.hub
            .invoke('getUsers', this.props.gameId)
            .catch((err: any) => console.error(err));
    };

    render() {
        return (
            <div className="main-menu waiting-users-screen">
                <div className="game-info">
                    <div className="text">Код игры: {this.props.gameId}</div>
                    <div className="text">
                        <div>Список игроков:</div>
                        {this.state.usersList.map(el => <div key={el}> {el} </div>)}
                    </div>
                </div>
                {this.props.isGameCreator && <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    className="app-button"
                    onClick={this.startGame}>
                    Начать игру</Button>}
            </div>
        )
    }
}