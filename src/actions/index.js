import { INCREASE_QUANTITY, DECREASE_QUANTITY } from '../constants'

export const increment = (isServer) => {
  return dispatch => {
    dispatch({
      type: INCREASE_QUANTITY,
      from: isServer ? 'server' : 'client'
    })
  }
}

export const decrement = (isServer) => {
  return dispatch => {
    dispatch({
      type: DECREASE_QUANTITY,
      from: isServer ? 'server' : 'client'
    })
  }
}
