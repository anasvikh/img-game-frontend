import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup } from "@material-ui/core";
import React, { Component } from "react";
import { ICardSetsResponseModel } from "../../models/lookup.model";

type CheckboxDialogProps = {
  open: boolean,
  header: string,
  values: ICardSetsResponseModel[],
  onClose: any,
  onSubmit: any,
}

type CheckboxDialogState = {
  values: ICardSetsResponseModel[]
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
    let values = this.state.values;
    values.forEach(group => {
      group.items.forEach(item => {
        if (item.id === +event.target.value)
          item.isChecked = event.target.checked
      })
    });
    this.setState({ values });
  }

  handleAllChecked = (event: any) => {
    let index = event.target.value;
    let data = this.state.values;
    data[index].items.forEach(value => value.isChecked = event.target.checked);
    this.setState({ values: data });
  }

  onSubmit = () => {
    this.props.onSubmit(
      this.state.values
        .flatMap(v => v.items)
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
          {this.state.values.map((group, index) =>
            <div key={group.groupName}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={group.items.filter(v => !v.isChecked).length === 0}
                    onClick={this.handleAllChecked}
                    value={index} />
                }
                label={group.groupName}
              />
              <FormGroup style={{ marginLeft: 30 }}>
                {group.items.map(el =>
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
            </div>
          )}
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