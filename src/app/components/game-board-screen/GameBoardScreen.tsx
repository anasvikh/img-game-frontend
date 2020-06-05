import React, { Component } from 'react';
import { Button, Zoom, Tooltip } from '@material-ui/core';
import './GameBoardScreen.css'
import { IRoundResultsModel, IPlayerResultsModel } from '../../models/roundResults.model';
import { IGameboardPointModel } from '../../models/gameboardPoint.model';

type GameBoardScreenProps = {
    gameId: number | null,
    results?: IRoundResultsModel,
    onGameBoardClose: any,
}

const pointsPositions: number[] = [36, 31, 26, 21, 16, 11, 6, 1, 2, 3, 4, 5, 10, 9, 8, 7, 12, 13, 14, 15, 20, 19, 18, 17, 22, 23, 24, 25, 30, 29, 28, 27, 32, 33, 34, 35, 39, 38, 37];

export class GameBoardScreen extends Component<GameBoardScreenProps> {
    constructor(props: Readonly<GameBoardScreenProps>) {
        super(props);
        console.log(props);
    }

    render() {
        var results: IGameboardPointModel[] = [];

        for (let i = 1; i < 40; i++) {
            const element = this.props.results?.resultsList
                .map(el => {
                    el.totalPoints = el.totalPoints % 39 === 0 ? 1 : el.totalPoints % 40; // идем на следующий круг
                    return el;
                })
                .filter(x => x.totalPoints === i);

            const point: IGameboardPointModel = {
                players: element ? element : [],
                pointNumber: i,
                pointPosition: pointsPositions[i - 1]
            };
            results.push(point);
        }

        return (
            this.props.results && <div className="main-menu game-board-screen">
                <div className="game-board">
                    {
                        results.sort((a, b) => a.pointPosition - b.pointPosition).map((point, pointPosition) => {
                            return <div className={`point point${point.pointNumber}`} key={pointPosition}>
                                <div className="point-number">{point.pointNumber}</div>
                                {point.players.map((player, playerNumber) => {
                                    return <Zoom
                                        in={!!player}
                                        style={{ transitionDelay: '300ms' }}>
                                        <Tooltip title={player.username} disableFocusListener disableTouchListener>
                                            <div className={`player player${playerNumber}`} key={playerNumber}>
                                                <img src={require(`../../../assets/svg/chips/${player.chipColor}.svg`)} />
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