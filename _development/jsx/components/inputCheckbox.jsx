import React from 'react';

class InputCheckbox extends React.Component {
  
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {};
    this.state[this.props.name] = this.props.value;
  }

  componentWillReceiveProps(nextProps) {
    let temp_state = this.state;
    temp_state[nextProps.name] = nextProps.value;
    this.setState(temp_state);
  }

  handleChange(input) {
    let temp_state = this.state;
    temp_state[input] = this.refs[input].checked;
    this.setState(temp_state);

		if (typeof this.props.handleChange === 'function') {
			this.props.handleChange(temp_state);
		}
  }

  render() {
    return (
      <div className="checkbox">
        <label>
          <input ref={this.props.name} type="checkbox" checked={this.state[this.props.name]} onChange={() => this.handleChange(this.props.name)} disabled={this.props.disabled}/>
          <span className="checkbox-material"><span className="check"></span></span>
          <span className="checkbox-title">{this.props.title}</span>
        </label>
      </div>
    )
  }
}

export default InputCheckbox;