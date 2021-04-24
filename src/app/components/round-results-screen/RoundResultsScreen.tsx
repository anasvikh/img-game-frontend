import React, { Component } from 'react';
import { Button, Zoom } from '@material-ui/core';
import './RoundResultsScreen.css'
import { IRoundResultsModel } from '../../models/roundResults.model';
import { PlayerChip } from '../player-chip/PlayerChip';

type RoundResultsScreenProps = {
    gameId: number | null,
    results?: IRoundResultsModel,
    onFinishRound: any,
    onGameBoardShow: any
}

export class RoundResultsScreen extends Component<RoundResultsScreenProps> {
    constructor(props: Readonly<RoundResultsScreenProps>) {
        super(props);
        console.log('RoundResultsScreen', props);
    }

    render() {
        return (
            this.props.results && <div className="main-menu round-results">
                <div className="text users-points">
                    <div>Результаты раунда:</div>
                    <div className="results-list">
                        {this.props.results.resultsList.map((el, i) =>
                            <div className={`${el.roundPoints > 0 ? 'forward' : el.roundPoints < 0 ? 'back' : ''}`} key={i}>
                                {el.username} делает ход на {el.roundPoints}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    color="primary"
                    className="app-button"
                    onClick={this.props.onGameBoardShow}>
                    <div style={{ fontSize: 18, marginBottom: 6, marginRight: 4 }}>&#128073;&#127995;</div>
                        Игровое поле
                    <div style={{ fontSize: 18, marginBottom: 6, marginLeft: 4 }}>&#128072;&#127995;</div>
                </Button>
                <div>
                    <Zoom
                        in={!!this.props.results.activePlayCard}
                        style={{ transitionDelay: "300ms" }}>
                        <div className="card-result">
                            <div className="players-list">
                                <div className="text">Ведущий<br></br>раунда:</div>
                                <div className="card-owner">
                                    {this.props.results.activePlayCard.players
                                        .filter(x => x.isCardOwner)
                                        .map(player => <PlayerChip player={player} key={player.name}></PlayerChip>)}
                                </div>
                            </div>
                            <div className="card-wrapper">
                                {this.props.results.activePlayCard.src.includes('Painters') &&
                                    <div className="card-number">{this.props.results.activePlayCard.numberInSet}</div>}
                                <img
                                    className="card active-card"
                                    src={`${process.env.REACT_APP_API_URL}${this.props.results.activePlayCard.src}`}></img>
                            </div>
                            <div className="players-list">
                                <div className="text">Угадавшие<br></br>игроки:</div>
                                <div className={`voted-players ${this.props.results.activePlayCard.players.length -1 > 5 ? 'two-columns' : ''}`}>
                                    {this.props.results.activePlayCard.players
                                        .filter(x => !x.isCardOwner)
                                        .map(player => <PlayerChip player={player} key={player.name}></PlayerChip>)}
                                </div>
                            </div>
                        </div>
                    </Zoom>
                </div>
                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    className="app-button"
                    onClick={this.props.onFinishRound}>Ок</Button>
            </div>
        )
    }
}