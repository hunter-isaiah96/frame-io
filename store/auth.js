export const state = () => ({
  authenticated: !!document.cookie.match(/^(.*;)?\s*access_token\s*=\s*[^;]+(.*)?$/),
  access_token: '',
  refresh_token: ''
});

export const mutations = {
  setAuthToken(state, { access_token, refresh_token }) {
    document.cookie = `access_token=${token}`;
    state.access_token = access_token;
    state.refresh_token = refresh_token;
  }
};
