'use strict';
// Sends due iPhone alerts. Database node warlords-push-v1/<id> = { sub, ev: [{ id, at, t, b, p }], sent: { id: at }, u, lang }
// written by the iPhone app (66-wlIos.js). An alert is sent once, between its time and LATE after it
// (a delayed run still delivers it; an older one is skipped). Expired subscriptions are removed.
const admin = require('firebase-admin');
const webpush = require('web-push');

const NODE = 'warlords-push-v1';
const LATE = 30 * 60000;           // GitHub may start a scheduled run late
const STALE = 45 * 86400000;       // phone not opened for 45 days: forget it

async function main(){
  const { FIREBASE_SA, FIREBASE_DB_URL, VAPID_PUBLIC, VAPID_PRIVATE } = process.env;
  if(!FIREBASE_SA || !FIREBASE_DB_URL || !VAPID_PUBLIC || !VAPID_PRIVATE){ console.log('Secrets not set, nothing to do'); return; }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(FIREBASE_SA)), databaseURL: FIREBASE_DB_URL });
  webpush.setVapidDetails('mailto:noreply@war-lords.app', VAPID_PUBLIC, VAPID_PRIVATE);
  const ref = admin.database().ref(NODE);
  const all = (await ref.once('value')).val() || {};
  const now = Date.now(), upd = {};
  let sent = 0, gone = 0;
  for(const [id, s] of Object.entries(all)){
    if(!s || !s.sub || !s.sub.endpoint || now - (s.u || 0) > STALE){ upd[id] = null; gone++; continue; }
    const ev = Array.isArray(s.ev) ? s.ev.filter(Boolean) : [];
    const done = s.sent || {};
    const keep = {};
    for(const e of ev){ if(done[e.id] && done[e.id] === e.at) keep[e.id] = e.at; }   // forget sent marks of past/changed alerts
    for(const e of ev){
      if(!e.id || !e.at || keep[e.id] === e.at || e.at > now || now - e.at > LATE) continue;
      try{
        await webpush.sendNotification(s.sub, JSON.stringify({ id: e.id, title: e.t, body: e.b, path: e.p || '' }), { TTL: 3600, urgency: 'high' });
        keep[e.id] = e.at; sent++;
      }catch(err){
        if(err.statusCode === 404 || err.statusCode === 410){ upd[id] = null; gone++; break; }
        console.log('push failed', err.statusCode || err.message);
      }
    }
    if(upd[id] !== null && JSON.stringify(keep) !== JSON.stringify(done)) upd[id + '/sent'] = keep;
  }
  if(Object.keys(upd).length) await ref.update(upd);
  console.log('subscriptions ' + Object.keys(all).length + ', sent ' + sent + ', removed ' + gone);
}

main().then(() => process.exit(0), e => { console.error(e.message); process.exit(1); });
