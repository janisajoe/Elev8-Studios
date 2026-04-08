const express = require('express');
const cors = require('cors');
const path = require('path');
const { Low, JSONFile } = require('lowdb');

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

const DEFAULT_SERVICES = [
  { id:"s1", category:"Real Estate", name:"Standard Photos", desc:"HDR interior & exterior photography", price:199, unit:"per property", turnaround:"24h", active:true, icon:"📷" },
  { id:"s2", category:"Real Estate", name:"Drone Aerial", desc:"FAA-certified aerial photography & video", price:149, unit:"add-on", turnaround:"24h", active:true, icon:"🚁" },
  { id:"s3", category:"Real Estate", name:"Photos + Video", desc:"Full property photo & walkthrough video", price:399, unit:"per property", turnaround:"48h", active:true, icon:"🎬" },
  { id:"s4", category:"Real Estate", name:"3D Walkthrough", desc:"Matterport 3D virtual tour", price:249, unit:"per property", turnaround:"48h", active:true, icon:"🏠" },
  { id:"s5", category:"Real Estate", name:"Twilight Shoot", desc:"Golden hour & dusk exterior photography", price:99, unit:"add-on", turnaround:"24h", active:true, icon:"🌆" },
  { id:"s6", category:"Real Estate", name:"Floor Plan", desc:"2D & 3D architectural floor plan", price:79, unit:"add-on", turnaround:"48h", active:true, icon:"📐" },
  { id:"s7", category:"Events", name:"Event Coverage", desc:"Full-day event photography", price:799, unit:"per event", turnaround:"7 days", active:true, icon:"🎉" },
  { id:"s8", category:"Events", name:"Event + Video", desc:"Photography & highlight reel", price:1299, unit:"per event", turnaround:"10 days", active:true, icon:"🎥" },
  { id:"s9", category:"Events", name:"Photo Booth", desc:"2-hour staffed photo booth setup", price:349, unit:"add-on", turnaround:"Same day", active:true, icon:"🎭" },
  { id:"s10", category:"Commercial", name:"Product Shoot", desc:"Studio product photography", price:299, unit:"half day", turnaround:"48h", active:true, icon:"📦" }
];

const DEFAULT_BRANDING = {
  businessName: "",
  tagline: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  invoiceNote: "Thank you for your business!",
  logoInitials: "",
  accentColor: "#c9a84c"
};

const defaultData = {
  studioUser: null,
  clients: [],
  projects: [],
  services: DEFAULT_SERVICES,
  branding: DEFAULT_BRANDING,
  stripeConfig: { publishableKey: "" }
};

const app = express();
app.use(cors());
app.use(express.json());

const initDb = async () => {
  await db.read();
  db.data = db.data || defaultData;
  db.data.services = db.data.services && db.data.services.length ? db.data.services : DEFAULT_SERVICES;
  db.data.branding = db.data.branding || DEFAULT_BRANDING;
  db.data.stripeConfig = db.data.stripeConfig || { publishableKey: "" };
  await db.write();
};

const findClient = (clients, email, password) => clients.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);

app.get('/api/data', async (req, res) => {
  await initDb();
  res.json({
    studioUser: db.data.studioUser,
    clients: db.data.clients,
    projects: db.data.projects,
    services: db.data.services,
    branding: db.data.branding,
    stripeConfig: db.data.stripeConfig
  });
});

app.post('/api/studio/signup', async (req, res) => {
  await initDb();
  const { name, studio, email, password, plan } = req.body;
  if (!name || !studio || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
  if (db.data.studioUser) return res.status(400).json({ error: 'Studio account already exists.' });
  const studioUser = { name, studio, email, password, plan, role: 'studio' };
  db.data.studioUser = studioUser;
  await db.write();
  res.json(studioUser);
});

app.post('/api/studio/login', async (req, res) => {
  await initDb();
  const { email, password } = req.body;
  if (!db.data.studioUser || db.data.studioUser.email.toLowerCase() !== email.toLowerCase() || db.data.studioUser.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  res.json(db.data.studioUser);
});

app.post('/api/client/signup', async (req, res) => {
  await initDb();
  const { name, email, password, company } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
  const existing = db.data.clients.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(400).json({ error: 'Client account already exists.' });
  const client = {
    id: `c${Date.now()}`,
    name,
    email,
    password,
    company: company || '',
    initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    color: '#5b8dd9'
  };
  db.data.clients.push(client);
  await db.write();
  res.json(client);
});

app.post('/api/client/login', async (req, res) => {
  await initDb();
  const { email, password } = req.body;
  const client = findClient(db.data.clients, email, password);
  if (!client) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json(client);
});

app.get('/api/clients', async (req, res) => {
  await initDb();
  res.json(db.data.clients);
});

app.get('/api/projects', async (req, res) => {
  await initDb();
  res.json(db.data.projects);
});

app.post('/api/projects', async (req, res) => {
  await initDb();
  const project = { ...req.body, id: Date.now(), messages: req.body.messages || [], invoice: req.body.invoice || null };
  db.data.projects.push(project);
  await db.write();
  res.json(project);
});

app.put('/api/projects/:id', async (req, res) => {
  await initDb();
  const id = Number(req.params.id);
  const index = db.data.projects.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Project not found.' });
  db.data.projects[index] = { ...db.data.projects[index], ...req.body, id };
  await db.write();
  res.json(db.data.projects[index]);
});

app.get('/api/services', async (req, res) => {
  await initDb();
  res.json(db.data.services);
});

app.put('/api/services', async (req, res) => {
  await initDb();
  db.data.services = req.body || db.data.services;
  await db.write();
  res.json(db.data.services);
});

app.get('/api/branding', async (req, res) => {
  await initDb();
  res.json(db.data.branding);
});

app.put('/api/branding', async (req, res) => {
  await initDb();
  db.data.branding = { ...db.data.branding, ...req.body };
  await db.write();
  res.json(db.data.branding);
});

app.get('/api/stripe-config', async (req, res) => {
  await initDb();
  res.json(db.data.stripeConfig);
});

app.put('/api/stripe-config', async (req, res) => {
  await initDb();
  db.data.stripeConfig = { ...db.data.stripeConfig, ...req.body };
  await db.write();
  res.json(db.data.stripeConfig);
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: req.body.amountCents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { invoiceNumber: req.body.invoiceNumber }
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, async () => {
  await initDb();
  console.log('Backend server is running on http://localhost:4000');
});
