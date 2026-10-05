# Signup and footer verification

Verified locally on 2026-10-05 with fake authentication and an isolated in-memory profile API. No real accounts, passwords or plant records were changed.

- Required password confirmation compares the full unmodified password and revalidates when the original changes.
- Signup accepts 15–128 characters, including spaces and Unicode, rejects whitespace-only passwords and never trims or silently truncates secrets. The minimum follows [OWASP guidance for password authentication without MFA](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). Login accepts the same maximum and preserves existing shorter account passwords.
- Password-manager autocomplete and paste remain available. Show passwords is explicit and off by default.
- Names are trimmed, bounded and require letters; email is trimmed, normalized and bounded.
- A synchronous submission guard prevents duplicate registration. Inputs remain disabled during the request.
- The profile API receives only first name, last name and email. Both password fields stay out of that request.
- HTTP status and the success flag must both confirm profile creation. A 15-second timeout bounds the profile request.
- Explicit profile rejection rolls back the exact newly created credential; rollback is skipped if another UID is already current. Rollback failure is distinguished from ordinary rejection.
- An ambiguous response or timeout preserves the sign-in account, clears the password fields, blocks another submission and directs the user to check with login. A lost response may follow a successful profile write.
- Rate-limit errors receive a readable message. Duplicate-email errors use less specific wording.
- Removed Instagram, Facebook and the generic LinkedIn placeholder from the shared footer. The desktop footer uses two columns and the copyright displays © plus the current year automatically.

Browser checks covered blank fields, mismatch, changing the original password, short passwords, visibility toggle, rate limiting, explicit profile rejection, double-click submission, successful signup and dashboard navigation, and ambiguous profile outcome. The isolated API recorded one auth/profile request per valid double-click, zero requests for invalid forms, and no password fields in profile bodies. Form and footer fit at 280, 320, 390, 768 and 1280 px without horizontal overflow. The landing footer was also checked.

`npm test`: 49 passing tests. `npm run build`: successful; existing main-bundle size warning remains.

## Server controls

Client validation improves the normal signup flow but can be bypassed. The same password limits must also be enforced through [Firebase's password policy](https://firebase.google.com/docs/auth/web/password-auth#recommended_set_a_password_policy). Email enumeration protection and email verification are project/backend concerns; their configuration was not changed or verified here. The separate API must validate Firebase identity and authorization itself. This repository contains only the client, so API authorization, transactional profile creation and recovery of incomplete accounts need a server review.

Screenshots: [signup](screenshots/signup-security-desktop.png) and [mobile mismatch](screenshots/signup-confirmation-mobile.png).
