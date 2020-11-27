export default function ({ store, redirect }) {
  if (!document.cookie.match(/^(.*;)?\s*auth_token\s*=\s*[^;]+(.*)?$/)) {
    return redirect('/login')
  }
}