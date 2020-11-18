export default function ({ store, redirect }) {
  if (!document.cookie.match(/^(.*;)?\s*access_token\s*=\s*[^;]+(.*)?$/)) {
    return redirect('/login')
  }
}