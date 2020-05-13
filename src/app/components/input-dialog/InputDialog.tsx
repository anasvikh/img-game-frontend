import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@material-ui/core";
import React, { Component } from "react";

type InputDialogProps = {
  onClose: any,
  onSubmit: any,
  open: boolean,
  header: string,
  inputType?: string
}

type InputDialogState = {
  inputValue: string
}

export class InputDialog extends Component<InputDialogProps, InputDialogState> {
  constructor(props: Readonly<InputDialogProps>) {
    super(props);
    this.state = {
      inputValue: ''
    };
  }

  handleKeyPress = (event: any) => {
    if(event.key === 'Enter'){
      console.log('enter press here! ');
      this.onSubmit();
    }
  }

  onSubmit = () => {
    this.props.onSubmit(this.state.inputValue);
    this.setState({
      inputValue: ''
    })
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose}
        onSubmit={this.onSubmit}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{this.props.header}</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            margin="dense"
            id="name"
            type={this.props.inputType || 'text'}
            fullWidth autoFocus
            value={this.state.inputValue}
            onChange={e => this.setState({ inputValue: e.target.value })}
            onKeyPress={this.handleKeyPress}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary">
            Отмена
            </Button>
          <Button onClick={this.onSubmit} color="primary">
            Ок
            </Button>
        </DialogActions>
      </Dialog>
    )
  }
}