// Where the academy's own Express backend (apps/academy/server) lives.
//
// Dev: a separate origin on port 5000, so the full URL is needed.
// Prod: same origin, behind nginx's `/academy-api` prefix, which strips the
// prefix and forwards to the backend — see deployment/vps-native/nginx-pmc.conf.
// A relative base keeps cookies/CORS a non-issue there.
// `||` rather than `??`: an empty VITE_API_URL is an unset one, not a request to
// call the landing page's own /api (which is Payload, not this backend).
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/academy-api' : 'http://localhost:5000');

export default API_BASE_URL;
