// Sponsorship enquiries. One function, same contract as POST /enquiries in src/admin/admin-api.js
// (public, no auth):
//   request body  {name, company, email, phone, interest, message}
//   201 response  {id, status: 'New', notes: '', receivedAt, ...body}
//   error         {error: '<message>'}  -> thrown as Error(message)
// BACKEND [TODO]: simulated for now (no network). When Supabase is wired in (after the frontend is
// done), replace the body below with an insert into the `enquiries` table and return the stored row.
const FIELDS = ['name', 'company', 'email', 'phone', 'interest', 'message'];
const LATENCY = 700;

export async function submitEnquiry(data) {
  const body = Object.fromEntries(FIELDS.map((k) => [k, String(data[k] ?? '').trim()]));
  if (!body.name || !body.email || !body.message) throw new Error('Name, email and message are required.');
  await new Promise((r) => setTimeout(r, LATENCY));
  return { id: 'e' + Date.now(), status: 'New', notes: '', receivedAt: new Date().toISOString(), ...body };
}
