import React, { Component } from 'react';
import './AuthorsScreen.css';
import { IAuthorModel } from '../../models/author.model';

type AuthorsState = {
    authors: IAuthorModel[]
}

export default class AuthorsScreen extends Component<{}, AuthorsState> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            authors: []
        };
    }

    render() {
        return (
            <div className="text users-points">
                <div>Художники и иллюстраторы:</div>
                <div className="authors-list">
                    {this.state.authors.map((el, i) =>
                        <div key={i} className="author">
                            <a href={el.link}>{el.name}</a>
                            <div className="cards-block">
                                {el.cards.map(id => <div>{id}</div>)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}