import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import './WaitingUsers.css'
import { ScreenStateEnum, StatusType } from '../../models/enums/screen-state.enum';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { IUserModel } from '../../models/user.model';
import SubMenu from '../submenu/Submenu';
import { Loader } from '../loader/Loader';

type WaitingUsersProps = {
    hub: any;
    history: any;
    gameId: number | null
}

type WaitingUsersState = {
    usersList: IUserModel[],
    isGameCreator: boolean
}

export default class WaitingUsers extends Component<WaitingUsersProps, WaitingUsersState> {
    constructor(props: Readonly<WaitingUsersProps>) {
        super(props);

        this.state = {
            usersList: [],
            isGameCreator: false
        };
    }

    componentDidMount = () => {
        this.checkGameStatus();
        this.props.hub.on('startGame', (gameId: number, receivedMessage: string) => {
            console.log(receivedMessage);
            localStorage.setItem('IMG_is_guessing_mode', 'false');
            localStorage.setItem('IMG_screen_state', ScreenStateEnum.Game.toString());
            this.props.history.push('/game');
            console.log('game redirect');
        });

        this.props.hub.on('getUsers', (usersList: IUserModel[]) => {
            console.log(usersList);
            this.setState({
                usersList: usersList
            })
        });

        this.props.hub.on('checkGameStatus', (gameId: number, username: string, status: StatusType, isGameCreator: boolean) => {
            console.log('check game results: ', gameId, username, status);
            if (status == StatusType.New) {
                this.setState({
                    isGameCreator
                });
                this.getUsers();
            }
        });

        this.getUsers();
    }

    startGame = () => {
        this.props.hub
            .invoke('startGame', this.props.gameId, this.state.usersList)
            .catch((err: any) => console.error(err));
    };

    getUsers = () => {
        this.props.hub
            .invoke('getUsers', this.props.gameId)
            .catch((err: any) => console.error(err));
    };


    checkGameStatus = () => {
        const game = localStorage.getItem('IMG_game');
        const username = localStorage.getItem('IMG_username');

        console.log('check active game: ', game, username);
        if (!game || !username) return;

        this.props.hub
            .invoke('checkGameStatus', +game, username)
            .catch((err: any) => console.error(err));
    };

    onDragEnd = (result: any) => {
        console.log(result);
        if (!result.destination) return;

        const items = Array.from(this.state.usersList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        let newList = items.map((item, index) => {
            item.order = index
            return item;
        });

        this.setState({
            usersList: newList
        });
    }

    render() {
        return (
            <div className="main-menu waiting-users-screen">
                {/* todo: level up */}
                <div className="sub-menu">
                    <SubMenu onLeaveGame={() => this.props.history.push('/')} />
                </div>
                <div className="game-info">
                    <Loader></Loader>
                    <div className="text">Код игры: {this.props.gameId}</div>
                    <div className="text">
                        <div>Список игроков:</div>
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            <Droppable droppableId="characters">
                                {(provided) => (
                                    <div className="characters" {...provided.droppableProps} ref={provided.innerRef}>
                                        {this.state.usersList.map((user, index) => {
                                            return (
                                                <Draggable key={user.name} draggableId={user.name} index={index} isDragDisabled={!this.state.isGameCreator}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <div className='player-card'>
                                                                <div className={`player`}>
                                                                    <img src={require(`../../../assets/svg/new-chips/chip (${user.chipId}).svg`)} />
                                                                </div>
                                                                {user.name}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
                {this.state.isGameCreator && <Button
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