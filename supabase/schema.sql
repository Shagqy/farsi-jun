-- Farsi Jun – Datenbank & Speicher
-- Im Supabase-Dashboard unter "SQL Editor" einmal komplett ausführen.

-- Lernfortschritt: ein Datensatz pro Nutzerin
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
create policy "progress_select_own" on public.progress for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Muttersprachler-Aufnahmen: privater Speicher, jede Nutzerin nur im eigenen Ordner (<user-id>/...)
insert into storage.buckets (id, name, public) values ('recordings', 'recordings', false)
on conflict (id) do nothing;

drop policy if exists "rec_select_own" on storage.objects;
drop policy if exists "rec_insert_own" on storage.objects;
drop policy if exists "rec_update_own" on storage.objects;
drop policy if exists "rec_delete_own" on storage.objects;
create policy "rec_select_own" on storage.objects for select using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rec_insert_own" on storage.objects for insert with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rec_update_own" on storage.objects for update using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rec_delete_own" on storage.objects for delete using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
