import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup } from "@material-ui/core";
import React, { Component } from "react";
import { ILookupModel } from "../../models/lookup.model";

type InputDialogProps = {
  open: boolean,
  header: string,
  values: ILookupModel[],
  onClose: any,
  onSubmit: any,
}

type InputDialogState = {
  selectedValues: number[]
}

export class CheckboxDialog extends Component<InputDialogProps, InputDialogState> {
  constructor(props: Readonly<InputDialogProps>) {
    super(props);
    this.state = {
      selectedValues: []
    };
  }

  handleChange = (selectedId: number) => {
    console.log(selectedId);
    let selectedValues = this.state.selectedValues;
    selectedValues.includes(selectedId) ?
    selectedValues = selectedValues.filter(item => item !== selectedId):
    selectedValues = [...selectedValues, selectedId]
    console.log(selectedValues);
    this.setState({
      selectedValues: selectedValues
    })
  }

  onSubmit = () => {
    this.props.onSubmit(this.state.selectedValues);
    this.setState({
      selectedValues: []
    })
  }

  onClose = () => {
    this.props.onClose();
    this.setState({
      selectedValues: []
    })
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.onClose} onSubmit={this.onSubmit} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{this.props.header}</DialogTitle>
        <DialogContent>
          <FormGroup>
            {this.props.values.map(el =>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    onChange={() => this.handleChange(el.id)} 
                    value={el.id} />
                }
                key={el.id}
                label={el.value}
              />
            )}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose} color="primary">
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