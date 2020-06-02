import React, { Component } from 'react';
import './AuthorsScreen.css';
import { IAuthorModel } from '../../models/author.model';

type AuthorsScreenProps = {
    authors: IAuthorModel[]
}

export class AuthorsScreen extends Component<AuthorsScreenProps> {
    constructor(props: Readonly<AuthorsScreenProps>) {
        super(props);
        console.log(props);
    }

    render() {
        return (
            <div className="text users-points">
                <div>Художники и иллюстраторы:</div>
                <div className="authors-list">
                    {this.props.authors.map((el, i) =>
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