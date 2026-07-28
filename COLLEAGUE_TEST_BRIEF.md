# DroneHub - Colleague Test Brief

Two documents in one. Part A is for you, Dylan. Part B is the message to send.

---

# PART A: WHAT YOU MUST DO FIRST (read before sending)

## 1. Rotate the admin password. Do this before anything else.

The GitHub repo is **public**, and `packages/db/seed.ts` contains
`bcrypt.hash("admin123", 10)` in plain sight. I confirmed that password currently
works on the live site. Right now, anyone who finds the repo can sign in to
www.dronehub.global as an administrator and approve operators.

Deleting the line does not fix it, because it stays in git history. The only real
fix is changing the passwords on the live database:

1. Sign in at www.dronehub.global as `commander@dronehub.global`
2. Go to `/account`
3. Change the password to something new and strong

Do the same for `pilot@dronehub.global` and `realestate@example.com`, or delete
those seeded accounts once testing is done. Never put the new password in the repo.

## 2. You are the bottleneck in the middle of this test. Be ready.

**New operators cannot bid until an admin approves them.** Until you approve, the
operator sees an empty job feed and cannot submit anything. This is correct
behaviour, not a bug, but your colleague will be stuck and confused if you are not
watching for it.

When your operator colleague finishes signing up:

1. You sign in as admin
2. Go to `/admin/operators`
3. Approve them
4. Tell them to refresh

Everything downstream depends on this step.

## 3. Known gaps, so nobody reports them as bugs

- **No emails are sent.** SMTP is not configured. All notifications are in-app only
  (the bell icon). Nobody will receive an email at any point.
- **Payments are switched off.** Stripe is scaffolded but has no keys. Do not expect
  to pay for anything.
- **Uploaded files do not survive a redeploy.** File storage is local disk on
  Railway. Licences, insurance documents and portfolio images will disappear if the
  app redeploys. Fine for a test, not for real data.
- **Google sign-in is new and lightly tested.** It works, but the safest path for
  this test is email and password. If someone uses Google, they will be asked to
  choose Client or Operator afterwards to finish setting up.
- **Do not use a real Google account you care about**, and do not upload real
  licences or insurance documents.

---

# PART B: THE MESSAGE TO SEND

Copy from here down.

---

Hi both,

I'd like your help testing DroneHub before we take it further. It's a working
build, not a mockup, so everything you do creates real data. It should take about
20 minutes.

**The site:** https://www.dronehub.global

**Please use a throwaway password**, and don't upload any real licences,
insurance documents or anything sensitive. Treat this as a test environment.

## Who does what

**[Name 1] - you're the OPERATOR** (the drone pilot offering services)
**[Name 2] - you're the CLIENT** (the customer who needs drone work done)

Please do the steps in order, because each one depends on the last. Message the
group when you finish your step so the next person can go.

---

### Step 1 - [Name 1], sign up as an operator

1. Go to https://www.dronehub.global/register/operator
2. Fill in your details and choose the services you'd offer
3. Submit

**You will then be waiting for approval.** Your dashboard will look empty and you
won't see any jobs. That's expected. Message me and I'll approve you, usually
within a few minutes. Refresh once I confirm.

### Step 2 - [Name 2], sign up as a client and post a job

1. Go to https://www.dronehub.global/register/client
2. Create your account
3. Post a job: click "Post a Job" from your dashboard
4. Give it a title, description, category, and location. Anything realistic is fine,
   for example "Roof inspection, 12-storey building in Kwun Tong"
5. Message the group once it's posted

### Step 3 - [Name 1], find that job and apply

1. Once I've approved you, go to "Browse Jobs"
2. Find [Name 2]'s job
3. Open it and submit a proposal: your price, delivery time, and a short cover note
4. Message the group when it's in

### Step 4 - [Name 2], review and award

1. Go to your dashboard and open your job
2. You should see [Name 1]'s proposal
3. Read it, then click "Award This Job"
4. Try sending a message to the operator from the job page

### Step 5 - both of you, have a look around

Click into anything: the operator directory, profiles, your account settings, the
notifications bell. Try to break it.

---

## What I want to know

Please be blunt. I'd rather hear it now.

1. **Where did you hesitate?** Any moment you weren't sure what to click, or what a
   word meant, is a problem worth knowing about.
2. **Did anything look wrong, broken or unfinished?**
3. **Did any wording feel odd, jargon-heavy, or not like plain English?**
4. **Operator specifically:** was it clear what you were signing up for, and what
   you'd get out of it?
5. **Client specifically:** did posting a job feel quick enough? Would you trust
   this enough to hire a stranger through it?
6. **Would you actually use this?** If not, what's missing?

Screenshots are gold, especially of anything confusing or broken. Please note which
browser and whether you were on phone or laptop.

## Things that are deliberately not built yet, so don't report these

- No emails are sent. Notifications are in-app only, via the bell icon.
- Payments are switched off. You can't pay for anything.
- Uploaded files may disappear. Don't upload anything real.
- Some admin features show "Coming soon".

Thanks both. Genuinely useful to me.

Dylan
