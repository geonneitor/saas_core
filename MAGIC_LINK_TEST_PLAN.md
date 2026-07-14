# Magic Link Authentication Test Plan

## Prerequisites
1. Run `npm run dev` in terminal
2. Open browser to http://localhost:3000

## Test 1: Login Page - Magic Link Only
**URL:** http://localhost:3000/login

**Expected:**
- Page shows "Acceso Restringido" title
- Single email input field (no password field)
- "Enviar enlace mágico" button
- NO Google OAuth button
- NO email/password form

**Steps:**
1. Navigate to /login
2. Verify no password field exists
3. Verify no Google OAuth button exists
4. Verify only email input and submit button

## Test 2: Whitelisted Email - Success
**URL:** http://localhost:3000/login

**Steps:**
1. Enter `cesargeo56@gmail.com` in email field
2. Click "Enviar enlace mágico"
3. Verify success message: "Email de verificación enviado"
4. Check email inbox for magic link

## Test 3: Non-Whitelisted Email - Blocked
**URL:** http://localhost:3000/login

**Steps:**
1. Enter `test@example.com` (non-whitelisted email)
2. Click "Enviar enlace mágico"
3. Verify magic link is sent (middleware will block after click)
4. Click link in email
5. Verify redirect to /login?error=unauthorized-email

## Test 4: Main Landing Page - No Public Auth Links
**URL:** http://localhost:3000

**Expected:**
- Footer has NO "Sign in" link
- Footer has NO "HQ Dashboard" link
- Only copyright text and "Powered by AI" link

**Steps:**
1. Navigate to /
2. Scroll to footer
3. Verify no sign-in or HQ links

## Test 5: Admin Route - Hidden
**URL:** http://localhost:3000/hq

**Expected:**
- Returns 404 in production
- In development, rewrites to /thisisn0tasecret

## Test 6: Magic Link Authentication Flow
**Steps:**
1. Go to /login
2. Enter `cesargeo56@gmail.com`
3. Click "Enviar enlace mágico"
4. Check email for magic link
5. Click magic link
6. Verify redirect to /thisisn0tasecret (if super_admin) or /console
7. Verify authenticated session

## Test 7: Rate Limiting
**Steps:**
1. Go to /login
2. Enter same email 4 times rapidly
3. Verify 4th attempt shows rate limit error
4. Wait 10 minutes
5. Verify request succeeds again

## Test 8: Sign Out
**Steps:**
1. While logged in, navigate to /thisisn0tasecret
2. Click "Sign Out" button
3. Verify redirect to /login
4. Verify session is cleared