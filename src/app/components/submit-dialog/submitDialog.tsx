import { Button, Dialog, DialogActions, DialogTitle } from "@material-ui/core";
import React, { Component } from "react";

type SubmitDialogProps = {
  onClose: any,
  onSubmit: any,
  open: boolean,
  header: string,
}

export class SubmitDialog extends Component<SubmitDialogProps> {

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose}
        onSubmit={this.props.onSubmit}
        aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{this.props.header}</DialogTitle>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary">
            Отмена
            </Button>
          <Button onClick={this.props.onSubmit} color="primary">
            Ок
            </Button>
        </DialogActions>
      </Dialog>
    )
  }
}