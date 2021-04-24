import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import './Home.css'
import { ILookupModel } from '../../models/lookup.model';
import { CheckboxDialog } from '../checkbox-dialog/CheckboxDialog';
import { InputDialog } from '../input-dialog/InputDialog';
import { Link } from 'react-router-dom';

type HomeProps = {
    hub: signalR.HubConnection;
    username: string;
    history: any;
    onGameIdReceived: any;
    onMessageReceived: any;
    onUsernameEditableChange: any;
}

type HomeState = {
    isSuperUser: boolean;
    cardSets: ILookupModel[];
    inputDialogConfig: {
        open: boolean
        header: string,
        inputType?: string,
        onSubmit: any
    };
    checkboxDialogConfig: {
        open: boolean
        header: string,
        values: ILookupModel[]
        onSubmit: any
    };
}

export default class Home extends Component<HomeProps, HomeState> {

    constructor(props: Readonly<HomeProps>) {
        super(props);
        console.log(props);
        this.state = {
            cardSets: [],
            isSuperUser: false,
            inputDialogConfig: {
                open: false,
                header: '',
                onSubmit: null
            },
            checkboxDialogConfig: {
                open: false,
                header: '',
                values: [],
                onSubmit: null
            },
        };
    }

    componentDidMount = () => {
        this.props.onUsernameEditableChange(true);

        this.props.hub.on('getCardSets', (cardSets: ILookupModel[], error: any) => {
            console.log(cardSets, error);
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

        this.props.hub.on('createGame', (gameId: number, error: any) => {
            console.log(gameId, error);
            this.props.onGameIdReceived(gameId);
            this.props.onMessageReceived('Игра создана');
            this.props.onUsernameEditableChange(false);
            this.closeCheckboxDialog();
            localStorage.setItem('IMG_game', gameId.toString());
            this.props.history.push('/waiting-users');
        });

        this.props.hub.on('joinGame', (gameId: number, success: boolean, message: string) => {
            console.log(`try to join (${gameId}, ${success}, ${message})`)
            if (success) {
                this.props.onMessageReceived('Вы присоединились к игре');
                this.props.onGameIdReceived(gameId);
                this.props.onUsernameEditableChange(false);
                localStorage.setItem('IMG_game', gameId.toString());
                this.props.history.push('/waiting-users');
            } else {
                this.props.onMessageReceived(message);
            }
        });
    }

    createGame = (selectedCardSets: number[]) => {
        this.props.hub
            .invoke('createGame', this.props.username, selectedCardSets)
            .catch((err: any) => console.error(err));
    };

    joinGame = (gameIdInputValue: string) => {
        this.props.hub
            .invoke('joinGame', this.props.username, +gameIdInputValue)
            .catch((err: any) => console.error(err));
        this.closeInputDialog();
    };

    getCardSets = () => {
        this.props.hub
            .invoke('getCardSets', this.state.isSuperUser)
            .catch((err: any) => console.error(err));
    };

    checkSuperUserPassword = (password: string) => {
        this.closeInputDialog();
        if (password === this.getSuperUserPassword()) {
            alert('Ты суперпользователь! 0.0.1')
            this.setState({
                isSuperUser: true
            })
        }
    }

    getSuperUserPassword = (): string => {
        // const date = new Date();
        // const password = date.getDate() + date.getHours() + Math.pow(date.getDay(), 2);
        // return password.toString();
        return 'секрет';
    }

    openInputDialog = (header: string, inputType?: string, onSubmit?: any) => {
        console.log('click');
        this.setState({
            inputDialogConfig: {
                open: true,
                header,
                inputType,
                onSubmit
            }
        });
    };

    closeInputDialog = () => {
        this.setState({
            inputDialogConfig: {
                open: false,
                header: '',
                onSubmit: null
            }
        });
    };

    closeCheckboxDialog = () => {
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
            <div className="main-menu home">
                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    className="app-button"
                    onClick={this.getCardSets}>
                    Создать игру</Button>
                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    className="app-button"
                    onClick={() => this.openInputDialog('Введите код игры:', 'number', this.joinGame)}>
                    Присоединиться</Button>
                {/* <Link to="/authors">
                    <Button size="large" color="primary" className="app-button">Авторы</Button>
                </Link> */}
                <div className="secret-field" onClick={() => this.openInputDialog('Введите пароль:', 'password', this.checkSuperUserPassword)}>
                </div>

                <InputDialog open={this.state.inputDialogConfig.open}
                    header={this.state.inputDialogConfig.header}
                    inputType={this.state.inputDialogConfig.inputType}
                    onClose={this.closeInputDialog}
                    onSubmit={this.state.inputDialogConfig.onSubmit} />

                <CheckboxDialog open={this.state.checkboxDialogConfig.open}
                    header={this.state.checkboxDialogConfig.header}
                    values={this.state.cardSets}
                    onClose={this.closeCheckboxDialog}
                    onSubmit={this.state.checkboxDialogConfig.onSubmit} />
            </div>
        )
    }
}