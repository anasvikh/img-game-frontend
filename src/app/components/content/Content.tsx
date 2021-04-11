import React, { Suspense, Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './Content.css'
import * as signalR from "@microsoft/signalr";
import { InputDialog } from '../input-dialog/InputDialog';
import EditIcon from '@material-ui/icons/Edit';

const Home = React.lazy(() => import('../home/Home'));
const WaitingUsers = React.lazy(() => import('../waiting-users/WaitingUsers'));
const Game = React.lazy(() => import('../game/Game'));
const AuthorsScreen = React.lazy(() => import('../authors-screen/AuthorsScreen'));

type State = {
    hubConnection: any,

    gameId: number | null,
    messageForUser: string,
    username: string,

    isUsernameEditable: boolean;
    isUserMessageVisible: boolean;

    inputDialogConfig: {
        open: boolean
        header: string,
        inputType?: string,
        onSubmit: any
    }
}

export class Content extends Component<{}, State> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            hubConnection: null,

            gameId: this.restoreGameId(),
            messageForUser: '',
            username: localStorage.getItem('IMG_username') || this.generateUsername(),

            isUsernameEditable: false,
            isUserMessageVisible: true,

            inputDialogConfig: {
                open: false,
                header: '',
                onSubmit: null
            },
        };
    }

    componentDidMount = () => {
        const hubConnection = new signalR.HubConnectionBuilder().withUrl(`${process.env.REACT_APP_API_URL}/game`, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        }).build();

        hubConnection.start()
            .then(() => {
                this.setState({ hubConnection });
                console.log('Connection started!', this.state.hubConnection.state);
                console.log(this.state.hubConnection);
            })
            .catch(() => console.log('Error while establishing connection :('));

        this.setState({ hubConnection });
    }

    restoreGameId() {
        const savedGameId = localStorage.getItem('IMG_game');
        if (savedGameId !== null) {
            return +savedGameId;
        }
        return null;
    }

    generateUsername(): string {
        const username = Math.random().toString(20).substr(2, 6);
        localStorage.setItem('IMG_username', username);
        return username;
    }

    updateUsername = (newUsername: string) => {
        localStorage.setItem('IMG_username', newUsername);
        this.setState({
            username: newUsername,
        });
        this.closeInputDialog();
    };


    openInputDialog = (header: string, inputType?: string, onSubmit?: any) => {
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

    render() {
        return (
            <div className="App-content">
                {this.state.username &&
                    <div className="text username"
                        onClick={() => this.state.isUsernameEditable && this.openInputDialog('Введите имя:', 'text', this.updateUsername)}>
                        Игрок: {this.state.username}

                        {this.state.isUsernameEditable &&
                            <EditIcon fontSize="small" className="edit-icon" />}
                    </div>}

                {this.state.isUserMessageVisible &&
                <div className="text user-message">{this.state.isUserMessageVisible}{this.state.messageForUser}</div>}

                {this.state.hubConnection && this.state.hubConnection.state === 'Connected' && <Router>
                    <Suspense fallback={<div className="text">Загрузка...</div>}>
                        <Switch>
                            <Route exact path="/"
                                render={(props) =>
                                    <Home {...props}
                                        hub={this.state.hubConnection}
                                        username={this.state.username}
                                        onGameIdReceived={(gameId: number) => this.setState({ gameId })}
                                        onMessageReceived={(messageForUser: string) => this.setState({ messageForUser })}
                                        onUsernameEditableChange={(isUsernameEditable: boolean) => this.setState({ isUsernameEditable })} />
                                }
                            />
                            <Route exact path="/waiting-users"
                                render={(props) =>
                                    <WaitingUsers {...props}
                                        hub={this.state.hubConnection}
                                        gameId={this.state.gameId}/>
                                }
                            />
                            <Route exact path="/game"
                                render={(props) =>
                                    <Game {...props}
                                        hub={this.state.hubConnection}
                                        gameId={this.state.gameId}
                                        username={this.state.username}
                                        onMessageReceived={(messageForUser: string) => this.setState({ messageForUser })}
                                        onUserMessageVisibilityChange={(isUserMessageVisible: boolean) =>
                                            this.setState({ isUserMessageVisible })
                                        } />
                                }
                            />
                            <Route exact path="/authors" component={AuthorsScreen} />
                        </Switch>
                    </Suspense>
                </Router>}

                <InputDialog open={this.state.inputDialogConfig.open}
                    header={this.state.inputDialogConfig.header}
                    inputType={this.state.inputDialogConfig.inputType}
                    onClose={this.closeInputDialog}
                    onSubmit={this.state.inputDialogConfig.onSubmit} />
            </div>
        )
    }
}