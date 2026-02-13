export function selectUser(state) {
  return state.auth.user;
}

export function selectRole(state) {
  return state.auth.user ? state.auth.user.role : null;
}
