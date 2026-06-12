-- Migration: Knowledge Base RAG MVP
-- Date: 2026-06-12

-- 1. Enable vector extension if not exists
create extension if not exists vector;

-- 2. Add indexing_status column to files
alter table public.files 
add column if not exists indexing_status text default 'unindexed' 
check (indexing_status in ('unindexed', 'indexing', 'indexed', 'failed'));

-- 3. Create document_chunks table
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  file_id uuid references public.files(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- 4. Enable RLS on document_chunks
alter table public.document_chunks enable row level security;

-- 5. Create RLS policies
create policy "Allow authenticated users to read document chunks"
  on public.document_chunks
  for select
  to authenticated
  using (true);

create policy "Allow users to manage chunks for their files"
  on public.document_chunks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Create similarity search function
create or replace function public.match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_file_ids uuid[] default null
)
returns table (
  id uuid,
  file_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    dc.id,
    dc.file_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where (filter_file_ids is null or dc.file_id = any(filter_file_ids))
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
