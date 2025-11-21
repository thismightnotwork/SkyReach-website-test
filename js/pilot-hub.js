/* Pilot Hub client-side account + flight log + fleet management
   Data model:
   localStorage key: sr_accounts => { username: { email, passwordHash, flights: [], fleet: [] } }
   localStorage key: sr_current => username
*/
(function(){
  const storageKey = 'sr_accounts';
  const currentKey = 'sr_current';

  function loadAccounts(){
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
    catch(e){ return {}; }
  }
  function saveAccounts(a){ localStorage.setItem(storageKey, JSON.stringify(a)); }

  function setCurrent(username){
    localStorage.setItem(currentKey, username);
  }
  function getCurrent(){ return localStorage.getItem(currentKey); }
  function clearCurrent(){ localStorage.removeItem(currentKey); }

  // simple hash placeholder - NOT cryptographically secure - acceptable for local demo
  function simpleHash(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h<<5)-h + s.charCodeAt(i); h |= 0; } return String(h); }

  // UI helpers
  function show(selector, show){
    const el = document.querySelector(selector);
    if(!el) return;
    el.hidden = !show;
  }
  function q(id){ return document.getElementById(id); }

  // signup
  const signupForm = q('signup-form');
  if(signupForm){
    signupForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const username = q('su-username').value.trim();
      const email = q('su-email').value.trim();
      const pass = q('su-password').value;
      if(!username || !pass) return alert('Complete required fields');

      const accounts = loadAccounts();
      if(accounts[username]) return alert('Username already exists');

      accounts[username] = {
        email,
        passHash: simpleHash(pass),
        flights: [],
        fleet: []
      };
      saveAccounts(accounts);
      setCurrent(username);
      renderMemberArea();
    });
  }

  // login
  const loginForm = q('login-form');
  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const username = q('li-username').value.trim();
      const pass = q('li-password').value;
      const accounts = loadAccounts();
      if(!accounts[username] || accounts[username].passHash !== simpleHash(pass)) return alert('Invalid username or password');
      setCurrent(username);
      renderMemberArea();
    });
  }

  // demo login
  q('demo-login')?.addEventListener('click', ()=>{
    const demo = 'demo';
    const accounts = loadAccounts();
    if(!accounts[demo]){
      accounts[demo] = { email: 'demo@skyreach.local', passHash: simpleHash('demo'), flights: [], fleet: [] };
      saveAccounts(accounts);
    }
    setCurrent(demo);
    renderMemberArea();
  });

  // logout
  q('logout')?.addEventListener('click', ()=>{
    clearCurrent();
    renderMemberArea();
  });

  // flights
  const flightForm = q('flight-form');
  if(flightForm){
    flightForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const date = q('fl-date').value;
      const route = q('fl-route').value.trim();
      const aircraft = q('fl-aircraft').value.trim();
      const hours = parseFloat(q('fl-hours').value) || 0;
      const username = getCurrent();
      if(!username) return alert('You must be logged in');

      const accounts = loadAccounts();
      accounts[username].flights.unshift({ id: Date.now(), date, route, aircraft, hours });
      saveAccounts(accounts);
      renderFlights();
      flightForm.reset();
    });
  }

  q('clear-logs')?.addEventListener('click', ()=>{
    const username = getCurrent();
    if(!username) return;
    const accounts = loadAccounts();
    accounts[username].flights = [];
    saveAccounts(accounts);
    renderFlights();
  });

  // fleet
  const fleetForm = q('fleet-form');
  if(fleetForm){
    fleetForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const type = q('ft-type').value.trim();
      const reg = q('ft-reg').value.trim();
      const username = getCurrent();
      if(!username) return alert('Login required');

      const accounts = loadAccounts();
      accounts[username].fleet.unshift({ id: Date.now(), type, reg });
      saveAccounts(accounts);
      renderFleet();
      fleetForm.reset();
    });
  }

  // export CSV
  q('export-data')?.addEventListener('click', ()=>{
    const username = getCurrent();
    if(!username) return alert('Login required');
    const accounts = loadAccounts();
    const flights = accounts[username].flights || [];
    if(!flights.length) return alert('No flights to export');

    const csv = ['Date,Route,Aircraft,Hours', ...flights.map(f => `${f.date},${JSON.stringify(f.route)},${f.aircraft},${f.hours}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-flights.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // render functions
  function renderMemberArea(){
    const username = getCurrent();
    if(username){
      const accounts = loadAccounts();
      const acct = accounts[username];
      if(!acct) { clearCurrent(); renderMemberArea(); return; }
      q('member-greeting').textContent = `Welcome, ${username}`;
      q('member-email').textContent = acct.email || '';
      show('#auth', false);
      show('#member-area', true);
      renderFlights();
      renderFleet();
    } else {
      show('#auth', true);
      show('#member-area', false);
    }
  }

  function renderFlights(){
    const username = getCurrent();
    const ul = q('fl-list');
    if(!ul) return;
    ul.innerHTML = '';
    if(!username) return;
    const accounts = loadAccounts();
    const flights = accounts[username].flights || [];
    flights.slice(0,50).forEach(f => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<div><strong>${f.route}</strong> <span class="muted">(${f.date})</span></div><div class="muted">${f.aircraft || ''} · ${f.hours || 0} h</div>`;
      ul.appendChild(li);
    });
  }

  function renderFleet(){
    const username = getCurrent();
    const ul = q('fleet-list');
    if(!ul) return;
    ul.innerHTML = '';
    if(!username) return;
    const accounts = loadAccounts();
    const fleet = accounts[username].fleet || [];
    fleet.slice(0,50).forEach(a => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<div><strong>${a.type}</strong> <span class="muted">${a.reg || ''}</span></div>`;
      ul.appendChild(li);
    });
  }

  // initialize
  renderMemberArea();
})();
