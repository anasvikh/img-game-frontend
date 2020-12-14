import React, { Component } from 'react';
import './ImageCardsSet.css';
import { Button, Zoom } from '@material-ui/core';
import { ICardModel } from '../../models/card.model';

type ImageCardsSetProps = {
    cards: ICardModel[],
    isResultsAvailable: boolean,
    onSendCard: any,
    onGetRoundResults: any,
    isGuessingMode: boolean,
    isShowVoteMode: boolean
}

type ImageCardsSetState = {
    selected?: ICardModel,
    unselectedHidden: boolean
}

export class ImageCardsSet extends Component<ImageCardsSetProps, ImageCardsSetState> {
    refsArray: any[];
    constructor(props: Readonly<ImageCardsSetProps>) {
        super(props);
        console.log(props);
        this.state = {
            unselectedHidden: this.props.isShowVoteMode
        };
        this.refsArray = [];
    }

    static getDerivedStateFromProps(nextProps: ImageCardsSetProps, prevState: ImageCardsSetState) {
        return {
            ...prevState,
            unselectedHidden: nextProps.isShowVoteMode
        };
    }

    changeSelected = (selectedCard: ICardModel, index: number) => {
        this.setState({
            selected: selectedCard.id === this.state.selected?.id ? undefined : selectedCard
        });
        const currentEl: any = this.refsArray[index];
        const parentEl: any = this.refs['card-set'];
        parentEl.scrollTo(currentEl.offsetLeft - 100, 0);
    };

    hideUnselected = () => {
        if (this.state.selected == null) return;

        this.props.onSendCard(this.state.selected?.id);

        this.setState({
            unselectedHidden: true,
        })
    }

    sendCard = () => {
        this.props.onSendCard(this.state.selected?.id);
        this.setState({
            unselectedHidden: false,
            selected: undefined
        })
    }

    render() {
        return (
            <div className="cards-set-block">
                {!this.state.unselectedHidden && <div className="cards-set" ref="card-set">
                    {this.props.cards.map((card, i) =>
                        <Zoom
                            in={!!this.props.cards}
                            style={{ transitionDelay: `${200 * (i + 1)}ms` }}
                            key={card.id}>
                            <div ref={ref => {
                                this.refsArray[i] = ref;
                            }}
                                className={`card ${card.id === this.state.selected?.id ? "selected" : ""}`}
                                onClick={() => this.changeSelected(card, i)}>
                                {card.src.includes('Painters') &&
                                    <div className="card-number">{card.numberInSet}</div>}
                                <img
                                    className="card-image"
                                    src={`${card.src}`}></img>
                            </div>
                        </Zoom>
                    )}
                </div>}

                {this.state.unselectedHidden && this.state.selected &&
                    <div className="voting-card" ref="card-set">
                        <div className="card selected">
                        {this.state.selected.src.includes('Painters') &&
                                    <div className="card-number">{this.state.selected.numberInSet}</div>}
                            <img className="card-image" src={`${this.state.selected.src}`}></img>
                        </div>
                    </div>}

                <div className="control">
                    {this.props.isGuessingMode && !this.state.unselectedHidden &&
                        <Button
                            variant="outlined"
                            size="large"
                            color="primary"
                            className="app-button hide"
                            onClick={this.hideUnselected}>
                            Проголосовать
                        </Button>}

                    {!this.props.isGuessingMode &&
                        <Button variant="outlined"
                            size="large"
                            color="primary"
                            className="app-button"
                            onClick={this.sendCard}>
                            Выбрать карту
                    </Button>}

                    {this.props.isResultsAvailable && this.props.isGuessingMode &&
                        <Button variant="outlined"
                            size="large"
                            color="primary"
                            className="app-button"
                            onClick={this.props.onGetRoundResults}>
                            Закончить раунд
                    </Button>}
                </div>
            </div>
        )
    }
}
