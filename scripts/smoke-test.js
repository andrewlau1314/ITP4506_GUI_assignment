// Simple smoke test that simulates localStorage flows used by the app
(function(){
  const storage = {};
  const localStorageMock = {
    getItem(k){ return storage.hasOwnProperty(k) ? storage[k] : null; },
    setItem(k,v){ storage[k]=String(v); },
    removeItem(k){ delete storage[k]; },
    clear(){ for (let k in storage) delete storage[k]; }
  };

  // Helpers
  function readUsers(){ return JSON.parse(localStorageMock.getItem('users') || '[]'); }
  function writeUsers(u){ localStorageMock.setItem('users', JSON.stringify(u)); }
  function readQuotes(){ return JSON.parse(localStorageMock.getItem('quotes') || '[]'); }
  function writeQuotes(q){ localStorageMock.setItem('quotes', JSON.stringify(q)); }

  console.log('--- SMOKE TEST START ---');

  // 1) Register a customer
  const customer = { role: 'customer', name: 'Test Customer', phone: '91234567', email: 'cust@test.com', password: 'custpass' };
  let users = readUsers();
  users.push(customer);
  writeUsers(users);
  console.log('Registered customer:', customer.email);

  // 2) Register a staff
  const staff = { role: 'sales', name: 'Test Staff', phone: '92345678', email: 'staff@test.com', password: 'staffpass', staffId: 'S100' };
  users = readUsers();
  users.push(staff);
  writeUsers(users);
  console.log('Registered staff:', staff.email);

  // 3) Customer login -> set currentUser
  const find = readUsers().find(u => u.email==='cust@test.com' && u.password==='custpass');
  if(!find) return console.error('ERROR: customer not found for login');
  localStorageMock.setItem('currentUser', JSON.stringify({ email: find.email, name: find.name, phone: find.phone, role: find.role }));
  console.log('Customer logged in as currentUser');

  // 4) Customer creates a quote (adds to quotes)
  const quote = {
    id: 'Q' + Date.now(),
    customerEmail: find.email,
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
    toy: { sketch: 'data:image/png;base64,AAA', dimensions: '20x15x10', pantone: '#FF5733', materials: 'plastic,paint', quantity: 10 },
    paymentMethod: 'Credit Card',
    quote: null,
    deliveryDate: null,
    messages: []
  };
  let quotes = readQuotes();
  quotes.push(quote);
  writeQuotes(quotes);
  console.log('Customer added quote:', quote.id);

  // 5) Customer submits the quote from wishlist (Pending -> Submitted)
  quotes = readQuotes();
  quotes = quotes.map(q=> q.id===quote.id ? Object.assign({}, q, { status: 'Submitted' }) : q);
  writeQuotes(quotes);
  console.log('Customer submitted quote:', quote.id);

  // 6) Staff login and view pending/submitted
  const staffUser = readUsers().find(u=> u.email==='staff@test.com' && u.password==='staffpass');
  if(!staffUser) return console.error('ERROR: staff not found for login');
  localStorageMock.setItem('currentUser', JSON.stringify({ email: staffUser.email, name: staffUser.name, phone: staffUser.phone, role: staffUser.role, staffId: staffUser.staffId }));
  console.log('Staff logged in as currentUser');

  // staff checks submitted (Submitted or Pending)
  const staffView = readQuotes().filter(q => q.status==='Submitted' || q.status==='Pending');
  console.log('Staff sees quote IDs (Submitted/Pending):', staffView.map(x=>x.id));

  // 7) Staff generates a quote (mark Quoted)
  quotes = readQuotes();
  quotes = quotes.map(q => q.id===quote.id ? Object.assign({}, q, { status: 'Quoted', quote: { price: 1234.5, currency: 'HKD' }, deliveryDate: new Date(Date.now()+7*86400000).toISOString().split('T')[0] }) : q);
  writeQuotes(quotes);
  console.log('Staff quoted quote:', quote.id);

  // Final snapshot
  console.log('\n--- FINAL LOCALSTORAGE SNAPSHOT ---');
  console.log('users:', JSON.parse(localStorageMock.getItem('users')||'[]'));
  console.log('currentUser:', JSON.parse(localStorageMock.getItem('currentUser')||'null'));
  console.log('quotes:', JSON.parse(localStorageMock.getItem('quotes')||'[]'));

  console.log('\n--- SMOKE TEST END ---');
})();

