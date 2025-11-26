// ---- PASTE YOUR FIREBASE CONFIG OBJECT BELOW ----
const firebaseConfig = {
    apiKey: "AIzaSyArBqUSgQAjmeTj9oZoX9gKVCvLmXeZ9HI",
    authDomain: "project-managment-with-git.firebaseapp.com",
    projectId: "project-managment-with-git",
    storageBucket: "project-managment-with-git.appspot.com",   // <-- FIXED HERE
    messagingSenderId: "221287490516",
    appId: "1:221287490516:web:984d82f3532dad24476c41",
    measurementId: "G-JGH3J8GCVM"
  };
  // -----------------------------------------------
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  const form = document.getElementById('contactForm');
  const latestEl = document.getElementById('latest');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const doc = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      group: document.getElementById('group').value,
      message: document.getElementById('message').value.trim(),
      createdAt: new Date().toISOString()
    };
  
    try {
      const ref = await db.collection('contacts').add(doc);
      alert('Saved: ' + ref.id);
      form.reset();
      fetchLatest();
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + err.message);
    }
  });
  
  async function fetchLatest(){
    try {
      const snap = await db.collection('contacts').orderBy('createdAt','desc').limit(1).get();
      if (!snap.empty) {
        const d = snap.docs[0].data();
        latestEl.textContent = JSON.stringify(d, null, 2);
      } else {
        latestEl.textContent = 'No records yet';
      }
    } catch (err) {
      console.error(err);
      latestEl.textContent = 'Error fetching: ' + err.message;
    }
  }
  
  // initial load
  fetchLatest();