import * as actionTypes from "./actionTypes";



export const startAstro = (gameType) => {
  return {
    gameType: gameType,
    type: actionTypes.START_ASTRO,
  };
};

export const endAstro = (payload) => {
  // Move score instantiation to start game with password auth
  return {
    type: actionTypes.END_ASTRO,
  };
};

export const updateAstro = (key, value) => {
  return {
    type: actionTypes.UPDATE_ASTRO,
    key: key,
    value: value,
  };
};


