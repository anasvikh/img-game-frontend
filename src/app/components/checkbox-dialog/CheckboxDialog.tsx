import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup } from "@material-ui/core";
import React, { Component } from "react";
import { ILookupModel } from "../../models/lookup.model";

type CheckboxDialogProps = {
  open: boolean,
  header: string,
  values: ILookupModel[],
  onClose: any,
  onSubmit: any,
}

type CheckboxDialogState = {
  values: ILookupModel[]
}

export class CheckboxDialog extends Component<CheckboxDialogProps, CheckboxDialogState> {
  constructor(props: Readonly<CheckboxDialogProps>) {
    super(props);
    this.state = {
      values: props.values
    };
  }

  componentDidUpdate(nextProps: CheckboxDialogProps) {
    const { values } = this.props;
    if (nextProps.values !== values) {
      if (values) {
        this.setState({ values });

      }
    }
  }

  handleCheck = (event: any) => {
    let values = this.state.values
    values.forEach(value => {
      if (value.id === +event.target.value)
        value.isChecked = event.target.checked
    })
    this.setState({ values });
  }

  handleAllChecked = (event: any) => {
    let values = this.state.values
    values.forEach(value => value.isChecked = event.target.checked)
    this.setState({ values });
  }

  onSubmit = () => {
    this.props.onSubmit(
      this.state.values
        .filter(v => v.isChecked)
        .map(v => v.id)
    );
    this.setState({
      values: []
    })
  }

  onClose = () => {
    this.props.onClose();
    this.setState({
      values: []
    })
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.onClose} onSubmit={this.onSubmit} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{this.props.header}</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={this.state.values.filter(v => !v.isChecked).length === 0}
                onClick={this.handleAllChecked}
                value={0} />
            }
            key={0}
            label="Выбрать все"
          />
          <FormGroup>
            {this.state.values.map(el =>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={el.isChecked}
                    onClick={this.handleCheck}
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