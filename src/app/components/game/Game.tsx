import React, { Component } from 'react';
import './Game.css'
import { ScreenStateEnum, StatusType } from '../../models/enums/screen-state.enum';
import { ImageCardsSet } from '../Image-cards-set/ImageCardsSet';
import { ICardModel } from '../../models/card.model';
import { RoundResultsScreen } from '../round-results-screen/RoundResultsScreen';
import { IRoundResultsModel } from '../../models/roundResults.model';
import { SubmitDialog } from '../submit-dialog/submitDialog';
import SubMenu from '../submenu/Submenu';
import { GameBoardScreen } from '../game-board-screen/GameBoardScreen';
import { Loader } from '../loader/Loader';

type GameProps = {
    hub: any,
    history: any,
    gameId: number | null,
    username: string,
    onMessageReceived: any;
    onUserMessageVisibilityChange: any;
}

type GameState = {
    screenState: ScreenStateEnum,
    isGuessingMode: boolean,
    isShowVoteMode: boolean,
    isAllCardsSended: boolean,
    loadingLogs: string[],
    roundResults?: IRoundResultsModel,

    activePlayer?: string

    selectedCardId: number | null,
    userCards: ICardModel[],

    submitDialogConfig: {
        open: boolean
        header: string,
        onSubmit: any,
        onClose: any
    },
}

export default class Game extends Component<GameProps, GameState> {
    constructor(props: Readonly<GameProps>) {
        super(props);
        console.log(props);
        this.state = {
            screenState: ScreenStateEnum.Loading,
            isGuessingMode: false,
            isShowVoteMode: false,
            isAllCardsSended: false,
            loadingLogs: [],

            selectedCardId: null,
            userCards: [],

            submitDialogConfig: {
                open: false,
                header: '',
                onSubmit: null,
                onClose: null
            }
        };
    }

    componentDidMount = () => {
        console.log('game page');
        this.checkGameStatus();
        this.props.hub.on('checkGameStatus', (gameId: number, username: string, status: StatusType, isGameCreator: boolean) => {
            console.log('check game results: ', gameId, username, status);
            const isGuessingMode = localStorage.getItem('IMG_is_guessing_mode');
            console.log('pre restore game');
            if (status == StatusType.Active && isGuessingMode !== null) {
                console.log('restore game');
                this.setState({
                    isGuessingMode: isGuessingMode === 'true'
                });
                this.restoreSavedGame();
            }
        });

        this.props.hub.on('selectCard', (isAllCardsSended: boolean, username: string) => {
            console.log('Все карточки выбраны', isAllCardsSended);
            if (isAllCardsSended) {
                this.finishRound();
            } else {
                if (this.props.username === username) {
                    this.setState({
                        screenState: ScreenStateEnum.Loading,
                    })
                    localStorage.setItem('IMG_screen_state', ScreenStateEnum.Loading.toString());
                } else {
                    this.setState({
                        loadingLogs: [...this.state.loadingLogs, username]
                    })
                }
            }
        });

        this.props.hub.on('voteForCard', (isAllCardsSended: boolean, username: string, error: string) => {
            console.log('Все карточки отправлены', isAllCardsSended);
            if (error) {
                this.setState({
                    isShowVoteMode: false
                });
                this.props.onMessageReceived(error);
            } else {
                this.setState({
                    isAllCardsSended,
                });
                let message = '';
                if (username === this.props.username) {
                    message = 'Выбор принят. Подожди остальных игроков';
                }
                if (isAllCardsSended) {
                    message = 'Все проголосовали. Покажи свою карту игрокам';
                }
                this.props.onMessageReceived(message);
            }
        });

        this.props.hub.on('getRoundResults', (results: IRoundResultsModel) => {
            console.log('Результаты получены');
            if (results) {
                this.setState({
                    roundResults: results,
                    screenState: ScreenStateEnum.RoundResults,
                    isAllCardsSended: false
                });
                localStorage.setItem('IMG_screen_state', ScreenStateEnum.RoundResults.toString());
                localStorage.setItem('IMG_round_results', JSON.stringify(this.state.roundResults));
            }
        });

        this.props.hub.on('getCards', (result: ICardModel[], activePlayer: string) => {
            console.log('карты для раунда', result);
            const messageForUser = this.state.isGuessingMode ?
                this.props.username === activePlayer ?
                    'Посмотри на карты других игроков. А затем выбери свою.' :
                    'Теперь попытайся угадать карту ведущего.' :
                this.props.username === activePlayer ?
                    'Ты ведущий. Выбери карту, придумай ассоциацию и сообщи ее другим игрокам.' :
                    `Твоя задача - выбрать карту, которая максимально подходит к ассоциации ведущего.`;
            this.props.onMessageReceived(messageForUser);
            this.setState({
                userCards: result,
                loadingLogs: [],
                screenState: ScreenStateEnum.Game,
                activePlayer
            });
            localStorage.setItem('IMG_screen_state', ScreenStateEnum.Game.toString());
            console.log(`cards for round:`, result);
        });

        this.props.hub.on('leaveGame', (isSuccess: boolean) => {
            if (isSuccess) {
                localStorage.removeItem('IMG_game');
                localStorage.removeItem('IMG_is_guessing_mode');
                localStorage.removeItem('IMG_screen_state');
                localStorage.removeItem('IMG_round_results');
                this.props.history.push('/');
                this.props.onMessageReceived('');
            }
        });
        this.props.hub.on('someoneLeaveGame', (isAllCardsSended: boolean, roundType: any, needNewRound: boolean, needRoundResults: boolean) => {
            if (needNewRound) {
                this.getCards();
            } else if (needRoundResults) {
                this.getRoundResults();
            } else if (isAllCardsSended) {
                this.finishRound();
            } else {
                this.setState({
                    loadingLogs: [...this.state.loadingLogs] //todo add logs (check)
                })
            }
        });
    }

    componentDidUpdate = (prevProps: GameProps, prevState: GameState) => {
        if (prevState.screenState === this.state.screenState) return;

        const screensWithoutUserMessage = [
            ScreenStateEnum.RoundResults,
            ScreenStateEnum.GameBoard
        ];
        const userMessageVisibility = !screensWithoutUserMessage.includes(this.state.screenState);
        console.log('userMessageVisibility', userMessageVisibility);
        this.props.onUserMessageVisibilityChange(userMessageVisibility);
    }

    componentWillUnmount = () => {
        this.props.onUserMessageVisibilityChange(true);
    }

    checkGameStatus = () => {
        const game = localStorage.getItem('IMG_game');
        const username = localStorage.getItem('IMG_username');

        console.log('check active game: ', game, username);
        if (!game || !username) return;

        this.props.hub
            .invoke('checkGameStatus', +game, username)
            .catch((err: any) => console.error(err));
    };

    selectCard = (cardId: number) => {
        console.log('Выбор своей карточки ', cardId);
        if (cardId == null) {
            this.props.onMessageReceived('Карта не выбрана');
            return;
        }

        this.setState({
            userCards: []
        });
        this.props.onMessageReceived('');

        console.log(cardId);
        this.props.hub
            .invoke('selectCard', this.props.username, this.props.gameId, cardId)
            .catch((err: any) => console.error(err));
    };

    voteForCard = (cardId: number) => {
        console.log('Голосование за карточку ведущего ', cardId);
        if (cardId == null) {
            this.props.onMessageReceived('Карта не выбрана');
            return;
        }

        this.setState({
            isShowVoteMode: true
        });
        this.props.onMessageReceived('');

        console.log(cardId);
        this.props.hub
            .invoke('voteForCard', this.props.username, this.props.gameId, cardId)
            .catch((err: any) => console.error(err));
    };

    getRoundResults = () => {
        console.log('Получение результатов раунда');

        this.props.hub
            .invoke('getRoundResults', this.props.gameId)
            .catch((err: any) => console.error(err));
    };

    getCards = () => {
        console.log('get cards', this.props.username, this.props.gameId, this.state.isGuessingMode);
        this.props.hub
            .invoke('getCards', this.props.username, this.props.gameId, this.state.isGuessingMode)
            .catch((err: any) => console.error(err));
    };

    leaveGame = () => {
        console.log('leaveGame', this.props.username, this.props.gameId);
        this.closeSubmitDialog();
        this.props.hub
            .invoke('leaveGame', this.props.username, this.props.gameId)
            .catch((err: any) => console.error(err));

    };

    finishRound = () => {   // разобраться, почему так
        console.log('1', this.state.isGuessingMode);  // true
        this.setState((state) => ({
            isGuessingMode: !state.isGuessingMode,
            isShowVoteMode: false,
            screenState: ScreenStateEnum.Game,
        }));
        console.log('2', this.state.isGuessingMode); // true
        setTimeout(() => {
            console.log('3', this.state.isGuessingMode); // false
            localStorage.setItem('IMG_is_guessing_mode', this.state.isGuessingMode.toString());
            localStorage.setItem('IMG_screen_state', ScreenStateEnum.Game.toString());
            this.getCards();
        }, 1);
    }

    showGameboard = () => {
        this.setState({
            screenState: ScreenStateEnum.GameBoard,
        });
    }

    closeGameboard = () => {
        this.setState({
            screenState: ScreenStateEnum.RoundResults,
        });
    }

    closeSubmitDialog = () => {
        this.setState({
            submitDialogConfig: {
                open: false,
                header: '',
                onSubmit: null,
                onClose: null
            }
        });
    };

    openLeaveGameDialog = () => {
        this.setState({
            submitDialogConfig: {
                open: true,
                header: 'Выйти из игры?',
                onSubmit: this.leaveGame,
                onClose: this.closeSubmitDialog
            }
        })
    }

    restoreSavedGame = () => {
        const savedUsername = localStorage.getItem('IMG_username');
        const savedGameId = localStorage.getItem('IMG_game');
        const isGuessingMode = localStorage.getItem('IMG_is_guessing_mode');
        const savedScreenState = localStorage.getItem('IMG_screen_state');

        console.log('restore', savedUsername, savedGameId, isGuessingMode, savedScreenState);

        if (isGuessingMode && savedScreenState) {
            console.log('restoring');
            this.setState({
                isGuessingMode: isGuessingMode === 'true',
                screenState: +savedScreenState
            });
            if (+savedScreenState === ScreenStateEnum.Game) {
                this.getCards();
            } else if (+savedScreenState === ScreenStateEnum.RoundResults) {
                const savedRoundResults = localStorage.getItem('IMG_round_results');
                if (savedRoundResults) {
                    const roundResults: IRoundResultsModel = JSON.parse(savedRoundResults);
                    this.setState({
                        roundResults
                    })
                } else {
                    this.finishRound();
                }
            }
        }
    }

    render() {
        return (
            <div className="game">
                <div className="sub-menu">
                    <SubMenu onLeaveGame={this.openLeaveGameDialog} />
                </div>

                {this.state.screenState === ScreenStateEnum.Game &&
                    <ImageCardsSet
                        cards={this.state.userCards}
                        isResultsAvailable={this.state.isAllCardsSended && this.props.username === this.state.activePlayer}
                        onSendCard={this.state.isGuessingMode ?
                            this.voteForCard :
                            this.selectCard}
                        onGetRoundResults={this.getRoundResults}
                        isGuessingMode={this.state.isGuessingMode}
                        isShowVoteMode={this.state.isShowVoteMode}></ImageCardsSet>}

                {this.state.screenState === ScreenStateEnum.RoundResults &&
                    this.state.roundResults &&
                    <RoundResultsScreen
                        gameId={this.props.gameId}
                        results={this.state.roundResults}
                        onFinishRound={this.finishRound}
                        onGameBoardShow={this.showGameboard}></RoundResultsScreen>}

                {this.state.screenState === ScreenStateEnum.GameBoard &&
                    <GameBoardScreen
                        gameId={this.props.gameId}
                        results={this.state.roundResults}
                        onGameBoardClose={this.closeGameboard}></GameBoardScreen>}

                {this.state.screenState === ScreenStateEnum.Loading && <div>
                    <Loader></Loader>
                    <div className="text log-list">
                        {this.state.loadingLogs.map(el => <div key={el}>{el} делает выбор</div>)}
                    </div>
                </div>}

                <SubmitDialog open={this.state.submitDialogConfig.open}
                    header={this.state.submitDialogConfig.header}
                    onClose={this.state.submitDialogConfig.onClose}
                    onSubmit={this.state.submitDialogConfig.onSubmit} />
            </div>
        )
    }
}