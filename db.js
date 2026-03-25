/**
 * VELOCE Car Rental — db.js
 * Client-side "database" using localStorage.
 * In production, replace fetch() calls with your real API/backend.
 */

const DB = (() => {
  const KEYS = { cars: 'vce_cars', bookings: 'vce_bookings', admins: 'vce_admins', session: 'vce_session' };

  /* ── Seeds ── */
  function seed() {
    if (!localStorage.getItem(KEYS.admins)) {
      localStorage.setItem(KEYS.admins, JSON.stringify([
        { id: 1, username: 'admin', password: 'veloce2024', name: 'Kino Salson', role: 'Super Admin', avatar: 'KS' }
      ]));
    }
    if (!localStorage.getItem(KEYS.cars)) {
      localStorage.setItem(KEYS.cars, JSON.stringify([
        { id: 1, name: 'Toyota Vios', year: 2023, type: 'Sedan', category: 'sedan', seats: 5, transmission: 'Automatic', fuel: 'Gasoline', baggage: 2, price: 2500, description: 'Reliable and fuel-efficient sedan perfect for city drives.', features: ['Bluetooth', 'Backup Camera', 'USB Port', 'Cruise Control'], image_url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80', is_available: true, added: new Date().toISOString() },
        { id: 2, name: 'Honda CR-V', year: 2024, type: 'Crossover SUV', category: 'suv', seats: 7, transmission: 'CVT', fuel: 'Gasoline', baggage: 4, price: 4500, description: 'Spacious and comfortable SUV for long trips.', features: ['Apple CarPlay', 'Android Auto', 'Lane Assist', 'Heated Seats'], image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80', is_available: true, added: new Date().toISOString() },
        { id: 3, name: 'Toyota HiAce', year: 2022, type: 'Van', category: 'van', seats: 15, transmission: 'Manual', fuel: 'Diesel', baggage: 8, price: 6500, description: 'Large capacity van for group travel.', features: ['AC', 'Large Cargo Space', 'Reclining Seats'], image_url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80', is_available: true, added: new Date().toISOString() },
        { id: 4, name: 'Mitsubishi Montero', year: 2023, type: 'Full-size SUV', category: 'suv', seats: 7, transmission: 'Automatic', fuel: 'Diesel', baggage: 5, price: 5500, description: 'Powerful off-road capable SUV.', features: ['4WD', 'Sunroof', 'Premium Audio', 'Leather Seats'], image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', is_available: false, added: new Date().toISOString() },
      ]));
    }
    if (!localStorage.getItem(KEYS.bookings)) {
      localStorage.setItem(KEYS.bookings, JSON.stringify([]));
    }
  }

  /* ── Helpers ── */
  const get  = key => JSON.parse(localStorage.getItem(key) || '[]');
  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const uid  = () => Math.floor(100000 + Math.random() * 900000).toString();
  const ref  = () => 'VCE-' + uid();

  /* ── Auth ── */
  const Auth = {
    login(username, password) {
      const admins = get(KEYS.admins);
      const admin = admins.find(a => a.username === username && a.password === password);
      if (!admin) return null;
      const session = { adminId: admin.id, name: admin.name, role: admin.role, avatar: admin.avatar, loginAt: new Date().toISOString() };
      localStorage.setItem(KEYS.session, JSON.stringify(session));
      return session;
    },
    logout() { localStorage.removeItem(KEYS.session); },
    getSession() {
      try { return JSON.parse(localStorage.getItem(KEYS.session)); }
      catch { return null; }
    },
    isLoggedIn() { return !!Auth.getSession(); }
  };

  /* ── Cars ── */
  const Cars = {
    getAll()  { return get(KEYS.cars); },
    getAvailable() { return get(KEYS.cars).filter(c => c.is_available); },
    getById(id) { return get(KEYS.cars).find(c => c.id === id); },
    add(car) {
      const cars = get(KEYS.cars);
      const newCar = { ...car, id: Date.now(), is_available: true, added: new Date().toISOString() };
      cars.push(newCar);
      save(KEYS.cars, cars);
      return newCar;
    },
    toggle(id) {
      const cars = get(KEYS.cars);
      const car = cars.find(c => c.id === id);
      if (!car) return null;
      car.is_available = !car.is_available;
      save(KEYS.cars, cars);
      return car;
    },
    delete(id) {
      const bookings = get(KEYS.bookings);
      const active = bookings.filter(b => b.car_id === id && ['pending','approved'].includes(b.status));
      if (active.length) return { error: 'Car has active bookings.' };
      const cars = get(KEYS.cars).filter(c => c.id !== id);
      save(KEYS.cars, cars);
      return { success: true };
    },
    update(id, data) {
      const cars = get(KEYS.cars);
      const idx = cars.findIndex(c => c.id === id);
      if (idx === -1) return null;
      cars[idx] = { ...cars[idx], ...data };
      save(KEYS.cars, cars);
      return cars[idx];
    }
  };

  /* ── Bookings ── */
  const Bookings = {
    getAll() {
      const bookings = get(KEYS.bookings);
      const cars = get(KEYS.cars);
      return bookings.map(b => ({
        ...b,
        car_display_name: cars.find(c => c.id === b.car_id)?.name || 'Unknown'
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    getById(id) { return get(KEYS.bookings).find(b => b.id === id); },
    create(data) {
      const bookings = get(KEYS.bookings);
      const booking = {
        id: Date.now(),
        ref: ref(),
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        notes: ''
      };
      bookings.push(booking);
      save(KEYS.bookings, bookings);
      return booking;
    },
    updateStatus(id, status) {
      const bookings = get(KEYS.bookings);
      const b = bookings.find(b => b.id === id);
      if (!b) return null;
      b.status = status;
      b.updated_at = new Date().toISOString();
      save(KEYS.bookings, bookings);
      return b;
    },
    update(id, data) {
      const bookings = get(KEYS.bookings);
      const idx = bookings.findIndex(b => b.id === id);
      if (idx === -1) return null;
      bookings[idx] = { ...bookings[idx], ...data, updated_at: new Date().toISOString() };
      save(KEYS.bookings, bookings);
      return bookings[idx];
    },
    delete(id) {
      const bookings = get(KEYS.bookings).filter(b => b.id !== id);
      save(KEYS.bookings, bookings);
      return { success: true };
    },
    getStats() {
      const bookings = get(KEYS.bookings);
      const cars = get(KEYS.cars);
      const approved = bookings.filter(b => b.status === 'approved');
      return {
        total_bookings: bookings.length,
        pending:  bookings.filter(b => b.status === 'pending').length,
        approved: approved.length,
        rejected: bookings.filter(b => b.status === 'rejected').length,
        returned: bookings.filter(b => b.status === 'returned').length,
        total_cars: cars.length,
        available_cars: cars.filter(c => c.is_available).length,
        total_revenue: approved.reduce((s, b) => s + (b.total_price || 0), 0)
      };
    }
  };

  seed();
  return { Auth, Cars, Bookings };
})();

window.DB = DB;