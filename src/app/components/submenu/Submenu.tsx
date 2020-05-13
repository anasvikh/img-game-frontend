import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { IconButton } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

type SubmenuProps = {
    onLeaveGame: any,
}

export default function SubMenu(props: SubmenuProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLeaveGame = () => {
        setAnchorEl(null);
        props.onLeaveGame();
    };

    return (
        <div>
            <IconButton
                className="light-grey"
                aria-controls="simple-menu" 
                aria-haspopup="true"
                onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}>
                <MenuItem onClick={handleLeaveGame}>Покинуть игру</MenuItem>
            </Menu>
        </div>
    );
}