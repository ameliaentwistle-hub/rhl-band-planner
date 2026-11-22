# Red House Lane – Band planner

Everyone in the band can add rehearsals and gigs, mark dates they can't do, and edit setlists and songs. No logins: each person types the band code once, then taps their name.

Everything is stored on Netlify (Netlify Blobs), so there are no other services to sign up to.

## One-off setup (about 10 minutes)

### 1. Put the files on GitHub
1. Sign up for free at github.com.
2. Click **+ > New repository**. Name it `rhl-band-planner`, choose **Private**, and click **Create repository**.
3. On the next page click **uploading an existing file**.
4. Unzip `rhl-band-planner.zip` on your computer, open the `rhl-band-planner` folder, select **everything inside it** (the `public` and `netlify` folders plus `netlify.toml`, `package.json` and this README) and drag it all onto the GitHub page.
5. Click **Commit changes**.

### 2. Connect it to Netlify
1. At app.netlify.com click **Add new project > Import an existing project > GitHub**, and allow Netlify to see your repositories.
2. Choose `rhl-band-planner`. Leave the build settings as they are (they're read from `netlify.toml`).
3. Before deploying, open **Add environment variables** (or after deploying: **Project configuration > Environment variables**) and add:
   - **Key:** `BAND_CODE`
   - **Value:** the code the band will type in, e.g. `redhouse-2027` (pick your own)
4. Click **Deploy**. If you added the variable after the first deploy, go to **Deploys > Trigger deploy > Deploy project** so it takes effect.
5. Optional: **Project configuration > Change project name**, e.g. `rhl-planner` → `rhl-planner.netlify.app`.

### 3. Send the band the link and the code
Each person opens the link, types the band code once, taps their name, and they're in. On a phone, **Add to Home Screen** makes it look and work like an app.

The first time anyone opens it, your current songs, setlists, rehearsals and blocked-out dates are copied in automatically.

## Everyday use
- **Can't do a date:** tap the day > **I can't do this date**, or **Add > I can't do some dates** for a holiday.
- **Can you make it?** Open a rehearsal or gig and tap I'm in / Maybe / Can't make it.
- **New rehearsal or gig:** after adding it, tap **Tell the band on WhatsApp**.
- Changes show up on everyone's phone within about 20 seconds, or straight away when they reopen the app.

## Looking after it
- **Change the band code:** Netlify > Environment variables > edit `BAND_CODE`, then **Trigger deploy**. Everyone re-enters the new code.
- **Update the planner:** on GitHub, open the file, click the pencil (or upload the new file over the old one) and commit. Netlify redeploys by itself in about a minute. Your band's data isn't affected.
