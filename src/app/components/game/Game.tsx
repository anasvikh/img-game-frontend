import React, { Component } from 'react';
import './Game.css'
import * as signalR from "@microsoft/signalr";
import { ScreenStateEnum } from '../../models/enums/screen-state.enum';
import { ImageCardsSet } from '../Image-cards-set/ImageCardsSet';
import { HomeScreen } from '../home-screen/HomeScreen';
import { WaitingUsersScreen } from '../waiting-users-screen/WaitingUsersScreen';
import { CheckboxDialog } from '../checkbox-dialog/CheckboxDialog';
import { InputDialog } from '../input-dialog/InputDialog';
import { ILookupModel } from '../../models/lookup.model';
import { ICardModel } from '../../models/card.model';
import EditIcon from '@material-ui/icons/Edit';
import { RoundResultsScreen } from '../round-results-screen/RoundResultsScreen';
import { IRoundResultsModel } from '../../models/roundResults.model';
import { SubmitDialog } from '../submit-dialog/submitDialog';
import SubMenu from '../submenu/Submenu';
import { GameBoardScreen } from '../game-board-screen/GameBoardScreen';

type State = {
    hubConnection: any,

    gameId: number | null,
    cardSets: ILookupModel[]

    screenState: ScreenStateEnum,
    isGuessingMode: boolean,
    isShowVoteMode: boolean,
    messageForUser: string,
    isAllCardsSended: boolean,
    loadingLogs: string[],
    roundResults?: IRoundResultsModel,

    username: string,
    isSuperUser: boolean,
    usersList: string[],
    activePlayer?: string

    selectedCardId: number | null,
    userCards: ICardModel[],

    inputDialogConfig: {
        open: boolean
        header: string,
        inputType?: string,
        onSubmit: any
    },
    submitDialogConfig: {
        open: boolean
        header: string,
        onSubmit: any,
        onClose: any
    },
    checkboxDialogConfig: {
        open: boolean
        header: string,
        values: ILookupModel[]
        onSubmit: any
    }
}

export class Game extends Component<{}, State> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            hubConnection: null,

            gameId: null,
            cardSets: [],

            screenState: ScreenStateEnum.Loading,
            isGuessingMode: false,
            isShowVoteMode: false,
            messageForUser: '',
            isAllCardsSended: false,
            loadingLogs: [],

            username: localStorage.getItem('IMG_username') || this.generateUsername(),
            isSuperUser: false,
            usersList: [],

            selectedCardId: null,
            userCards: [],

            inputDialogConfig: {
                open: false,
                header: '',
                onSubmit: null
            },
            submitDialogConfig: {
                open: false,
                header: '',
                onSubmit: null,
                onClose: null
            },
            checkboxDialogConfig: {
                open: false,
                header: '',
                values: [],
                onSubmit: null
            }
        };
    }

    componentDidMount = () => {
        const hubConnection = new signalR.HubConnectionBuilder().withUrl(`/game`, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
          }).build();

        this.setState({ hubConnection }, () => {
            this.state.hubConnection
                .start()
                .then(() => {
                    console.log('Connection started!');
                    this.setState({
                        screenState: ScreenStateEnum.Menu
                    });
                    this.checkActiveGame();
                })
                .catch((err: any) => console.log('Error while establishing connection :('));

            this.state.hubConnection.on('checkActiveGame', (gameId: number, username: string, isGameActive: boolean) => {

                const isGuessingMode = localStorage.getItem('IMG_is_guessing_mode');
                if (isGameActive && isGuessingMode !== null) {
                    this.setState({
                        gameId,
                        isGuessingMode: isGuessingMode === 'true'
                    });
                    this.openRestoreGameDialog()
                }
            });

            this.state.hubConnection.on('getCardSets', (cardSets: ILookupModel[], error: any) => {
                console.log(error);
                this.setState({
                    cardSets,
                    checkboxDialogConfig: {
                        open: true,
                        header: 'Выбери игровые наборы',
                        values: cardSets,
                        onSubmit: this.createGame
                    }
                });
            });

            this.state.hubConnection.on('createGame', (gameId: number, username: string, error: any) => {
                console.log(gameId, username, error);
                this.setState({
                    gameId,
                    screenState: ScreenStateEnum.WaitingUsers,
                    usersList: [username],
                    messageForUser: 'Игра создана',
                    checkboxDialogConfig: {
                        open: false,
                        header: '',
                        values: [],
                        onSubmit: null
                    }
                });
                localStorage.setItem('IMG_game', gameId.toString());
            });

            this.state.hubConnection.on('joinGame', (gameId: number, usersList: string[], success: boolean, message: string) => {
                console.log(gameId, usersList, success);

                this.setState({
                    inputDialogConfig: {
                        open: false,
                        header: '',
                        onSubmit: null
                    }
                });

                if (success === null) {
                    this.setState({
                        gameId,
                        usersList,
                    });
                    return;
                }

                if (success) {
                    this.setState({
                        gameId,
                        usersList,
                        screenState: ScreenStateEnum.WaitingUsers,
                        messageForUser: 'Вы присоединились к игре'
                    });
                    localStorage.setItem('IMG_game', gameId.toString());
                } else {
                    this.setState({
                        messageForUser: message
                    });
                }
            });

            this.state.hubConnection.on('startGame', (gameId: number, receivedMessage: string) => {
                console.log(receivedMessage);
                this.setState({
                    gameId,
                    screenState: ScreenStateEnum.Loading,
                    isGuessingMode: false,
                    messageForUser: 'Игра началась'
                });
                localStorage.setItem('IMG_is_guessing_mode', 'false');
                localStorage.setItem('IMG_screen_state', ScreenStateEnum.Loading.toString());
                this.getCards();
            });

            this.state.hubConnection.on('selectCard', (isAllCardsSended: boolean, username: string) => {
                console.log('Все карточки выбраны', isAllCardsSended);
                if (isAllCardsSended) {
                    this.finishRound();
                } else {
                    if (this.state.username === username) {
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

            this.state.hubConnection.on('voteForCard', (isAllCardsSended: boolean, username: string, error: string) => {
                console.log('Все карточки отправлены', isAllCardsSended);
                if (error) {
                    this.setState({
                        messageForUser: error,
                        isShowVoteMode: false
                    })
                } else {
                    this.setState({
                        isAllCardsSended,
                    })
                }
            });

            this.state.hubConnection.on('getRoundResults', (results: IRoundResultsModel) => {
                console.log('Результаты получены');
                if (results) {
                    this.setState({
                        roundResults: results,
                        screenState: ScreenStateEnum.RoundResults,
                        isAllCardsSended: false
                    });
                    localStorage.setItem('IMG_screen_state', ScreenStateEnum.RoundResults.toString());
                }
            });

            this.state.hubConnection.on('getCards', (result: ICardModel[], activePlayer: string) => {
                console.log('карты для раунда', result);
                const messageForUser = this.state.isGuessingMode ?
                    this.state.username === activePlayer ?
                    'Посмотри на карты других игроков. А затем выбери свою.' :
                    'Теперь попытайся угадать карту ведущего.':
                    this.state.username === activePlayer ?
                    'Ты ведущий. Выбери карту, придумай ассоциацию и сообщи ее другим игрокам.' :
                    'Твоя задача - выбрать карту, которая максимально подходит к ассоциации ведущего.';
                this.setState({
                    userCards: result,
                    loadingLogs: [],
                    messageForUser,
                    screenState: ScreenStateEnum.Game,
                    activePlayer
                });
                localStorage.setItem('IMG_screen_state', ScreenStateEnum.Game.toString());
                console.log(`cards for round:`, result);
            });

            this.state.hubConnection.on('leaveGame', (isSuccess: boolean) => {
                if (isSuccess) {
                    this.setState({
                        gameId: null,
                        screenState: ScreenStateEnum.Menu,
                        isGuessingMode: false,
                        usersList: [],
                        selectedCardId: null,
                        userCards: [],
                        isShowVoteMode: false
                    });
                    localStorage.removeItem('IMG_game');
                    localStorage.removeItem('IMG_is_guessing_mode');
                    localStorage.removeItem('IMG_screen_state');

                }
            });

            this.state.hubConnection.on('notify', (message: string) => {
                console.warn(message);
            });
        });
    }

    checkActiveGame = () => {
        const game = localStorage.getItem('IMG_game');
        const username = localStorage.getItem('IMG_username');

        if (!game || !username) return;

        this.state.hubConnection
            .invoke('checkActiveGame', +game, username)
            .catch((err: any) => console.error(err));
    };

    getCardSets = () => {
        this.state.hubConnection
            .invoke('getCardSets', this.state.isSuperUser)
            .catch((err: any) => console.error(err));
    };

    createGame = (selectedCardSets: number[]) => {
        this.state.hubConnection
            .invoke('createGame', this.state.username, selectedCardSets)
            .catch((err: any) => console.error(err));
    };

    joinGame = (gameIdInputValue: string) => {
        this.state.hubConnection
            .invoke('joinGame', this.state.username, +gameIdInputValue)
            .catch((err: any) => console.error(err));
    };

    startGame = () => {
        this.state.hubConnection
            .invoke('startGame', this.state.gameId)
            .catch((err: any) => console.error(err));
    };

    updateUsername = (newUsername: string) => {
        localStorage.setItem('IMG_username', newUsername);
        this.setState({
            username: newUsername,
            inputDialogConfig: {
                open: false,
                header: '',
                onSubmit: null
            }
        });
    };

    selectCard = (cardId: number) => {
        console.log('Выбор своей карточки ', cardId);
        if (cardId == null) {
            this.setState({
                messageForUser: 'Карта не выбрана'
            });
            return;
        }

        this.setState({
            userCards: [],
            messageForUser: ''
        });

        console.log(cardId);
        this.state.hubConnection
            .invoke('selectCard', this.state.username, this.state.gameId, cardId)
            .catch((err: any) => console.error(err));
    };

    voteForCard = (cardId: number) => {
        console.log('Голосование за карточку ведущего ', cardId);
        if (cardId == null) {
            this.setState({
                messageForUser: 'Карта не выбрана'
            });
            return;
        }

        this.setState({
            messageForUser: '',
            isShowVoteMode: true
        });

        console.log(cardId);
        this.state.hubConnection
            .invoke('voteForCard', this.state.username, this.state.gameId, cardId)
            .catch((err: any) => console.error(err));
    };

    getRoundResults = () => {
        console.log('Получение результатов раунда');

        this.state.hubConnection
            .invoke('getRoundResults', this.state.username, this.state.gameId)
            .catch((err: any) => console.error(err));
    };

    getCards = () => {
        console.log('get cards', this.state.username, this.state.gameId, this.state.isGuessingMode);
        this.state.hubConnection
            .invoke('getCards', this.state.username, this.state.gameId, this.state.isGuessingMode)
            .catch((err: any) => console.error(err));
    };

    leaveGame = () => {
        console.log('leaveGame', this.state.username, this.state.gameId);
        this.handleSubmitDialogClose();
        this.state.hubConnection
            .invoke('leaveGame', this.state.username, this.state.gameId)
            .catch((err: any) => console.error(err));

    };

    finishRound = () => {   // разобраться, почему так
        console.log('1', this.state.isGuessingMode);  // true
        this.setState({
            isGuessingMode: !this.state.isGuessingMode,
            isShowVoteMode: false,
            screenState: ScreenStateEnum.Game,
        });
        console.log('2', this.state.isGuessingMode); // true
        setTimeout(() => {
            console.log('3', this.state.isGuessingMode); // false
            localStorage.setItem('IMG_is_guessing_mode', this.state.isGuessingMode.toString());
            localStorage.setItem('IMG_screen_state', ScreenStateEnum.Game.toString());
            this.getCards();
        }, 1);
    }

    checkSuperUserPassword = (password: string) => {
        this.handleInputDialogClose();
        if (password === this.getSuperUserPassword()) {
            alert('Ты суперпользователь!')
            this.setState({
                isSuperUser: true
            })
        }
    }

    getSuperUserPassword = (): string => {
        const date = new Date();
        const password = date.getDate() + date.getHours() + Math.pow(date.getDay(), 2);
        return password.toString();
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

    generateUsername(): string {
        return Math.random().toString(20).substr(2, 6);
    }

    handleClickOpen = (header: string, inputType?: string, onSubmit?: any) => {
        if (this.state.screenState !== ScreenStateEnum.Menu) return;
        this.setState({
            inputDialogConfig: {
                open: true,
                header,
                inputType,
                onSubmit
            }
        });
    };

    handleInputDialogClose = () => {
        this.setState({
            inputDialogConfig: {
                open: false,
                header: '',
                onSubmit: null
            }
        });
    };

    handleSubmitDialogClose = () => {
        this.setState({
            submitDialogConfig: {
                open: false,
                header: '',
                onSubmit: null,
                onClose: null
            }
        });
    };

    openRestoreGameDialog = () => {
        this.setState({
            submitDialogConfig: {
                open: true,
                header: 'Найдена активная игра. Продолжить игру?',
                onSubmit: this.restoreSavedGame,
                onClose: this.removeSavedGame
            }
        })
    }

    openLeaveGameDialog = () => {
        this.setState({
            submitDialogConfig: {
                open: true,
                header: 'Выйти из игры?',
                onSubmit: this.leaveGame,
                onClose: this.handleSubmitDialogClose
            }
        })
    }

    restoreSavedGame = () => {
        this.setState({
            submitDialogConfig: {
                open: false,
                header: '',
                onSubmit: null,
                onClose: null
            }
        });

        const savedUsername = localStorage.getItem('IMG_username');
        const savedGameId = localStorage.getItem('IMG_game');
        const isGuessingMode = localStorage.getItem('IMG_is_guessing_mode');
        const savedScreenState = localStorage.getItem('IMG_screen_state');

        console.log('restore', savedUsername, savedGameId, isGuessingMode, savedScreenState);

        if (savedUsername && savedGameId && isGuessingMode && savedScreenState) {
            this.setState({
                username: savedUsername,
                gameId: +savedGameId,
                isGuessingMode: isGuessingMode === 'true',
                screenState: +savedScreenState
            });
            if (+savedScreenState === ScreenStateEnum.Game) {
                this.getCards();
            } else if (+savedScreenState === ScreenStateEnum.RoundResults) {
                this.finishRound();
            }
        }
    }

    removeSavedGame = () => {
        this.setState({
            submitDialogConfig: {
                open: false,
                header: '',
                onSubmit: null,
                onClose: null
            }
        });
        localStorage.removeItem('IMG_game');
        localStorage.removeItem('IMG_is_guessing_mode');
    }

    handleCheckboxDialogClose = () => {
        this.setState({
            checkboxDialogConfig: {
                open: false,
                header: '',
                values: [],
                onSubmit: null
            }
        });
    };

    render() {
        return (
            <div className="App-content">

                {this.state.screenState === ScreenStateEnum.RoundResults && <div className="sub-menu">
                    <SubMenu onLeaveGame={this.openLeaveGameDialog}/>
                </div>}

                {this.state.username &&
                    <div className="text username" onClick={() => this.handleClickOpen('Введите имя:', 'text', this.updateUsername)}>
                        Игрок: {this.state.username}
                        {this.state.screenState === ScreenStateEnum.Menu &&
                            <EditIcon fontSize="small" className="edit-icon" />}
                    </div>}

                {this.state.screenState !== ScreenStateEnum.RoundResults &&
                    this.state.screenState !== ScreenStateEnum.GameBoard &&
                    <div className="text user-message">{this.state.messageForUser}</div>}

                {this.state.screenState === ScreenStateEnum.Menu &&
                    <HomeScreen
                        onCreateGame={this.getCardSets}
                        onJoinGame={() => this.handleClickOpen('Введите код игры:', 'number', this.joinGame)}
                        onCheckSuperUser={() => this.handleClickOpen('Введите пароль:', 'password', this.checkSuperUserPassword)}></HomeScreen>}

                {this.state.screenState === ScreenStateEnum.WaitingUsers &&
                    <WaitingUsersScreen
                        gameId={this.state.gameId}
                        usersList={this.state.usersList}
                        onStartGame={this.startGame}></WaitingUsersScreen>}

                {this.state.screenState === ScreenStateEnum.Game &&
                    <ImageCardsSet
                        cards={this.state.userCards}
                        isResultsAvailable={this.state.isAllCardsSended && this.state.username === this.state.activePlayer}
                        onSendCard={this.state.isGuessingMode? 
                            this.voteForCard:
                            this.selectCard}
                        onGetRoundResults={this.getRoundResults}
                        isGuessingMode={this.state.isGuessingMode}
                        isShowVoteMode={this.state.isShowVoteMode}></ImageCardsSet>}

                {this.state.screenState === ScreenStateEnum.RoundResults &&
                    <RoundResultsScreen
                        gameId={this.state.gameId}
                        results={this.state.roundResults}
                        onFinishRound={this.finishRound}
                        onGameBoardShow={this.showGameboard}></RoundResultsScreen>}

                {this.state.screenState === ScreenStateEnum.GameBoard &&
                    <GameBoardScreen
                        gameId={this.state.gameId}
                        results={this.state.roundResults}
                        onGameBoardClose={this.closeGameboard}></GameBoardScreen>}

                {this.state.screenState === ScreenStateEnum.Loading && <div>
                    <div className="text">Загрузка...</div>
                    <div className="text log-list">
                        {this.state.loadingLogs.map(el => <div key={el}>Игрок {el} сделал ход</div>)}
                    </div>
                </div>}

                <InputDialog open={this.state.inputDialogConfig.open}
                    header={this.state.inputDialogConfig.header}
                    inputType={this.state.inputDialogConfig.inputType}
                    onClose={this.handleInputDialogClose}
                    onSubmit={this.state.inputDialogConfig.onSubmit} />

                <SubmitDialog open={this.state.submitDialogConfig.open}
                    header={this.state.submitDialogConfig.header}
                    onClose={this.state.submitDialogConfig.onClose}
                    onSubmit={this.state.submitDialogConfig.onSubmit} />

                <CheckboxDialog open={this.state.checkboxDialogConfig.open}
                    header={this.state.checkboxDialogConfig.header}
                    values={this.state.cardSets}
                    onClose={this.handleCheckboxDialogClose}
                    onSubmit={this.state.checkboxDialogConfig.onSubmit} />
            </div>
        )
    }
}