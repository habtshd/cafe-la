<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Orders and reservations are inserted only by server functions in `src/lib/cafe.functions.ts` using the admin client; prices are recomputed server-side so customers can't tamper with totals.
- Customers track orders by an unguessable `tracking_token`, never by order number, so they can't view others' orders.
- Staff access is role-based (`user_roles` + `has_role`/`is_staff`); the first account created becomes admin. RLS enforces it, never UI hiding alone.
- Menu images live in a private bucket (public buckets blocked by workspace); public menu fetch signs URLs server-side.
- Business facts (address, hours, socials, offered order types) live in `business_settings` and are editable by admins — never hardcode or invent them.
- Staff pages read/write directly via the browser client under RLS; public pages read through server functions.
