# deetzlabs
Add achievements and credits to a twitch stream.

## prerequisites
 * A postgresl database initialized with `db/schema.sql`

## install
```bash
git clone https://github.com/thomaslule/deetzlabs.git
cp config/default.json config/production.js # customize config here
npm install
npm start
```

## configure achievements
Edit the `domain/viewer/achievements` file to create your own achievements.
