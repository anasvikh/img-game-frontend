import React, { Component } from 'react';
import { Tooltip } from '@material-ui/core';
import './PlayerChip.css'
import { IUserModel } from '../../models/user.model';

type PlayerChipProps = {
    player: IUserModel
}

export class PlayerChip extends Component<PlayerChipProps> {
    constructor(props: Readonly<PlayerChipProps>) {
        super(props);
    }

    render() {
        return (
            <Tooltip
                title={this.props.player.name}
                aria-label="add"
                placement="right"
                style={{ zIndex: 100 }}
                disableFocusListener
                disableTouchListener>
                <div className={`player-chip`}>
                    <img src={require(`../../../assets/svg/new-chips/chip (${this.props.player.chipId}).svg`)} />
                </div>
            </Tooltip>
        )
    }
}