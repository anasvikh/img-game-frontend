import React, { Component } from 'react';
import { Button, Zoom } from '@material-ui/core';
import './RoundResultsScreen.css'
import { IRoundResultsModel } from '../../models/roundResults.model';

type RoundResultsScreenProps = {
    gameId: number | null,
    results?: IRoundResultsModel,
    onFinishRound: any,
    onGameBoardShow: any
}

export class RoundResultsScreen extends Component<RoundResultsScreenProps> {
    constructor(props: Readonly<RoundResultsScreenProps>) {
        super(props);
        console.log(props);
    }

    render() {
        return (
            this.props.results && <div className="main-menu round-results">
                <div className="text users-points">
                    <div>Результаты раунда:</div>
                    <div className="results-list">
                        {this.props.results.resultsList.map((el, i) =>
                            <div key={i}>
                                Игрок {el.username} делает ход на {el.roundPoints}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    size="large"
                    color="primary"
                    className="app-button start-game"
                    onClick={this.props.onGameBoardShow}>Игровое поле</Button>
                <div>
                    <div className="text">
                        <Zoom
                            in={!!this.props.results.activePlayCard}
                            style={{ transitionDelay: "300ms" }}>
                            <div>
                                <div>Карточка ведущего:</div>
                                <div className="card-wrapper">
                                    {this.props.results.activePlayCard.src.includes('Painters') &&
                                        <div className="card-number">{this.props.results.activePlayCard.numberInSet}</div>}
                                    <img
                                        className="card active-card"
                                        src={`http://3.22.164.241:88${this.props.results.activePlayCard.src}`}></img>
                                </div>
                            </div>
                        </Zoom>
                    </div>
                    <Button
                        variant="outlined"
                        size="large"
                        color="primary"
                        className="app-button start-game"
                        onClick={this.props.onFinishRound}>Ок</Button>
                </div>
            </div>
        )
    }
}
