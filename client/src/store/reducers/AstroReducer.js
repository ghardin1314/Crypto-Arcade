import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  inGame: false,
  AstroidInstance: null,
  gameCost: 0,
  gameType: null,
  leaderboardOpen: false,
};

const updateAstro = (state, action) => {
  return updateObject(state, {
    [action.key]: action.value,
  });
};

const startAstro = (state, action) => {
  return updateObject(state, {
    inGame: true,
    gameType: action.gameType,
  });
};

const endAstro = (state, action) => {
  return updateObject(state, {
    inGame: false,
    gameType: null,
  });
};

const AstroReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.START_ASTRO:
      return startAstro(state, action);
    case actionTypes.END_ASTRO:
      return endAstro(state, action);
    case actionTypes.UPDATE_ASTRO:
      return updateAstro(state, action);
    default:
      return state;
  }
};

export default AstroReducer;
