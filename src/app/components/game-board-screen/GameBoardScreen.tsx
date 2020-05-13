import React, { Component } from 'react';
import { Button, Zoom, Tooltip } from '@material-ui/core';
import './GameBoardScreen.css'
import { IRoundResultsModel, IPlayerResultsModel } from '../../models/roundResults.model';

type GameBoardScreenProps = {
    gameId: number | null,
    results?: IRoundResultsModel,
    onGameBoardClose: any,
}

export class GameBoardScreen extends Component<GameBoardScreenProps> {
    constructor(props: Readonly<GameBoardScreenProps>) {
        super(props);
        console.log(props);
    }

    render() {
        var results: IPlayerResultsModel[][] = [];

        for (let i = 0; i < 40; i++) {
            const element = this.props.results?.resultsList
                .map(el => {
                    el.totalPoints = el.totalPoints % 39 === 0 ? 1 : el.totalPoints % 40; // идем на следующий круг
                    return el;
                })
                .filter(x => x.totalPoints === i);
            results.push(element ? element : []);
        }

        return (
            this.props.results && <div className="main-menu game-board-screen">
                <div className="game-board">
                    <img className="board-background" src={`${window.location.origin}/images/gameboard.jpg`} />
                    {
                        results.map((usersList, pointNumber) => {
                            return <div className={`point point${pointNumber}`}>
                                {usersList.map((user, userNumber) => {
                                    return <Zoom
                                        in={!!user}
                                        style={{ transitionDelay: "300ms" }}>
                                        <Tooltip title={user.username} disableFocusListener disableTouchListener>
                                            <div key={userNumber}
                                                className={`player player${userNumber}`}>
                                                <img src={require(`../../../assets/svg/chips/chip-${user.chipColor}.svg`)} />
                                            </div>
                                        </Tooltip>
                                    </Zoom>
                                })}
                            </div>
                        })
                    }
                </div>
                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    className="app-button start-game"
                    onClick={this.props.onGameBoardClose}>Ок</Button>
            </div>
        )
    }
}