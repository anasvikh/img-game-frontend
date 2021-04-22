import React, { Component } from 'react';
import './Loader.css'

export class Loader extends Component {
    render() {
        return (
            <div className={`loader`}>
                <img src={require(`../../../assets/svg/loader.svg`)} />
            </div>
        )
    }
}