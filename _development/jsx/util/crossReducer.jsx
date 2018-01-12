const crossReducer = store => next => action => {

  function getState() {
    return store.getState();
  }

  var new_action;
  if (action === undefined) {
    new_action = {
      type: "CROSS",
      getState
    }
  } else {
    new_action = {
      getState
    }
  }

  const actionWithGetState = Object.assign({}, action, new_action);

  next(actionWithGetState);
};

export default crossReducer;