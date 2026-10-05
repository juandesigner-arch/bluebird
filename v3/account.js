import { authConfig } from './auth-config.js?v=v3-app-4';

// SDK owns token refresh; each data request captures the authenticated account.
export function createAccount({ switchAccount, readState, refreshProfile, storageKey }) {
  const configured = Boolean(authConfig.url && authConfig.publishableKey);
  const client = configured ? globalThis.supabase.createClient(authConfig.url, authConfig.publishableKey, {
    auth: { storageKey: 'blue-bird-v3-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
  let session = null, generation = 0, ready = false, timer, running = false, mode = 'login';
  let status = configured ? 'Conectando…' : 'Acceso por correo pendiente de activar';
  const root = document.querySelector('#account-root');
  const escape = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const metaKey = (id) => `${storageKey}:${id}:sync`;
  const meta = (id) => { const raw = localStorage.getItem(metaKey(id)); return raw ? JSON.parse(raw) : { revision: 0, dirty: false }; };
  const setMeta = (id, value) => localStorage.setItem(metaKey(id), JSON.stringify(value));
  const announce = (text) => { status = text; refreshProfile(); const output = root.querySelector('[data-account-status]'); if (output) output.textContent = text; };
  async function request(path, token, body) {
    const response = await fetch(`${authConfig.url.replace(/\/$/, '')}/rest/v1/${path}`, {
      method: body ? 'POST' : 'GET', headers: { apikey: authConfig.publishableKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const result = await response.json();
    if (!response.ok) { const error = new Error(result.message || 'No se pudo conectar'); error.code = result.code; throw error; }
    return result;
  }
  async function connect(next) {
    if (next?.user.id === session?.user.id) { session = next; if (!next) announce('Guardado en este dispositivo'); return; }
    const stamp = ++generation; session = next; ready = false; clearTimeout(timer);
    switchAccount(next?.user.id || null);
    if (!next) { announce('Guardado en este dispositivo'); return; }
    announce('Conectando tu cuenta…');
    try {
      const id = next.user.id, before = meta(id);
      const rows = await request(`blue_bird_states?user_id=eq.${encodeURIComponent(id)}&select=payload,revision`, next.access_token);
      if (stamp !== generation) return;
      const current = meta(id), remote = rows[0];
      if (remote && current.dirty && remote.revision !== current.revision) {
        announce('Hay cambios locales y de otro dispositivo. Conservamos ambos; abre tu cuenta para recuperar la copia de la nube.'); return;
      }
      if (remote && !current.dirty) {
        const key = `${storageKey}:${id}`, previous = localStorage.getItem(key);
        if (previous) localStorage.setItem(`${key}:backup-before-cloud`, previous);
        localStorage.setItem(key, JSON.stringify(remote.payload));
        setMeta(id, { revision: remote.revision, dirty: false }); switchAccount(id);
      } else if (!remote && before.revision > 0) { announce('No encontramos la copia de la nube. Tus datos locales siguen guardados.'); return; }
      ready = true;
      if (!remote || current.dirty) { setMeta(id, { revision: remote?.revision || 0, dirty: true }); await flush(); }
      else announce('Sincronizado con tu cuenta');
    } catch { announce('Sin conexión con la nube. Tus cambios se guardan en este dispositivo.'); }
  }
  async function flush() {
    if (!session || !ready || running) return;
    const captured = session, stamp = generation, id = captured.user.id;
    let before;
    try { before = meta(id); } catch { announce('El navegador no permite guardar la sincronización.'); return; }
    if (!before.dirty) return;
    running = true;
    const payload = JSON.stringify(readState());
    try {
      const revision = await request('rpc/save_blue_bird_state', captured.access_token, { new_payload: JSON.parse(payload), expected_revision: before.revision });
      if (stamp !== generation) return;
      const changed = JSON.stringify(readState()) !== payload;
      setMeta(id, { revision, dirty: changed });
      announce(changed ? 'Guardando cambios…' : 'Sincronizado con tu cuenta');
      if (changed) timer = setTimeout(flush, 500);
    } catch (error) {
      if (stamp !== generation) return;
      if (error.code === '40001') ready = false;
      announce(error.code === '40001' ? 'Otro dispositivo guardó cambios. Tu copia local está protegida; abre tu cuenta para revisar.' : 'Sin conexión. Cambios guardados aquí; reintentaremos al volver.');
    } finally { running = false; if (stamp !== generation && ready) timer = setTimeout(flush, 500); }
  }
  function changed() {
    if (!session) return;
    try { setMeta(session.user.id, { ...meta(session.user.id), dirty: true }); }
    catch { announce('No se pudo guardar el estado de sincronización.'); return; }
    clearTimeout(timer); timer = setTimeout(flush, 650);
  }
  function open(nextMode = 'login') {
    mode = nextMode;
    root.innerHTML = `<dialog class="account-dialog"><button class="account-close" aria-label="Cerrar">×</button><h2>${session && mode !== 'password' ? 'Tu nido' : ({login:'Bienvenido a tu nido',register:'Crea tu cuenta',recover:'Recuperar acceso',password:'Nueva contraseña'})[mode]}</h2>
      <p>${session ? escape(session.user.email) : 'Tus gastos y tus super checks, contigo.'}</p>
      <p class="account-status" data-account-status role="status">${escape(status)}</p>
      ${!configured ? '<p>El acceso por correo estará disponible cuando se conecte Supabase. Puedes seguir probando la app con guardado local.</p>' : session && mode !== 'password' ? '<div class="account-actions"><button data-account-action="retry">Reintentar conexión</button><button data-account-action="cloud">Recuperar copia de la nube</button><button data-account-action="logout">Cerrar sesión</button></div>' : `<form>
        ${mode !== 'password' ? '<label>Correo electrónico<input name="email" type="email" autocomplete="email" required></label>' : ''}
        ${mode !== 'recover' ? `<label>Contraseña<input name="password" type="password" minlength="8" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" required></label>` : ''}
        <button type="submit">${({login:'Entrar',register:'Crear cuenta',recover:'Enviar enlace',password:'Guardar contraseña'})[mode]}</button></form>
        <div class="account-actions"><button data-account-mode="${mode === 'login' ? 'register' : 'login'}">${mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}</button>${mode === 'login' ? '<button data-account-mode="recover">Olvidé mi contraseña</button>' : ''}</div>`}
      </dialog>`;
    const dialog = root.querySelector('dialog'); dialog.showModal();
    dialog.querySelector('.account-close').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-account-mode]').forEach(button => button.onclick = () => open(button.dataset.accountMode));
    dialog.querySelector('form')?.addEventListener('submit', async event => {
      event.preventDefault(); const form = event.target, button = form.querySelector('[type=submit]'); button.disabled = true;
      const credentials = Object.fromEntries(new FormData(form));
      const redirect = `${location.origin}${location.pathname}`;
      try {
        let result;
        if (mode === 'register') result = await client.auth.signUp({ ...credentials, options: { emailRedirectTo: redirect } });
        else if (mode === 'recover') result = await client.auth.resetPasswordForEmail(credentials.email, { redirectTo: redirect });
        else if (mode === 'password') result = await client.auth.updateUser({ password: credentials.password });
        else result = await client.auth.signInWithPassword(credentials);
        if (result.error) throw result.error;
        if (mode === 'login' || mode === 'password') dialog.close();
        else { form.reset(); root.querySelector('[data-account-status]').textContent = 'Revisa tu correo para continuar. Si no llega, mira la carpeta de spam.'; }
      } catch { root.querySelector('[data-account-status]').textContent = 'No pudimos completar la solicitud. Revisa tus datos y la conexión e inténtalo de nuevo.'; }
      finally { button.disabled = false; }
    });
    dialog.querySelectorAll('[data-account-action]').forEach(button => button.onclick = async () => {
      button.disabled = true;
      try {
        const action = button.dataset.accountAction;
        if (action === 'logout') { await flush(); const result = await client.auth.signOut({ scope: 'local' }); if (result.error) throw result.error; dialog.close(); }
        else if (action === 'retry') { const previous = session; session = null; await connect(previous); }
        else if (action === 'cloud' && confirm('Se usará la copia de la nube. Guardaremos un respaldo de tus cambios locales en este navegador. ¿Continuar?')) {
          const id = session.user.id, key = `${storageKey}:${id}`;
          localStorage.setItem(`${key}:backup-conflict-${Date.now()}`, JSON.stringify(readState()));
          setMeta(id, { ...meta(id), dirty: false }); const previous = session; session = null; await connect(previous);
        }
      } catch { announce('No se pudo completar la solicitud. Tus datos locales siguen guardados.'); }
      finally { button.disabled = false; }
    });
  }
  client?.auth.onAuthStateChange((event, next) => {
    setTimeout(() => { connect(next); if (event === 'PASSWORD_RECOVERY') open('password'); }, 0);
  });
  window.addEventListener('online', () => { if (session) { const previous = session; session = null; connect(previous); } });
  return { open, changed, get email() { return session?.user.email || ''; }, get status() { return status; } };
}
