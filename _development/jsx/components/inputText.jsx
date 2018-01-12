import React from 'react';

class InputText extends React.Component {
  
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {};
    this.state[this.props.name] = this.props.value;
    this.state.error = (this.props.error==undefined?false:this.props.error);
    this.state.required = (this.props.required==undefined?true:this.props.required);
  }

  componentWillReceiveProps(nextProps) {
    let temp_state = this.state;
    temp_state[nextProps.name] = nextProps.value;
    temp_state.error = (nextProps.error==undefined?false:nextProps.error);
    temp_state.required = (nextProps.required==undefined?true:nextProps.required);
    this.setState(temp_state);
  }

  handleChange(input) {
    let temp_state = this.state;
    temp_state[input] = this.refs[input].value;
    this.setState(temp_state);

		if (typeof this.props.handleChange === 'function') {
			this.props.handleChange(temp_state);
		}
  }

  render() {
    let
    classes,
    attributes = {
      placeholder: " "
    };

    if (this.state.error) {
      classes = "group error";
    } else {
      classes = "group";
    }

    if (this.state.required) {
      attributes["required"] = true;
    } else {
      if (this.state[this.props.name] != "") {
        attributes["placeholder"] = this.state[this.props.name];
      }
    }

    return (
      <div className={classes}>      
        <input ref={this.props.name} type="text" defaultValue={this.state[this.props.name]} onChange={() => this.handleChange(this.props.name)} autoComplete="off" {...attributes}/>
        <span className="highlight"></span>
        <span className="bar"></span>
        <label>{this.props.title}</label>
      </div>
    )
  }
}

export default InputText;