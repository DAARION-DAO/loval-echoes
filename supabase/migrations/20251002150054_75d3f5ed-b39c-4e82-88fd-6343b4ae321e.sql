-- Включаем расширение для полнотекстового поиска СНАЧАЛА
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Создаем enum для типов файлов
CREATE TYPE public.file_scope AS ENUM ('community', 'project');
CREATE TYPE public.file_type AS ENUM ('document', 'image', 'code', 'data', 'other');

-- Таблица папок
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  scope public.file_scope NOT NULL DEFAULT 'community',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица файлов
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_type public.file_type NOT NULL DEFAULT 'other',
  mime_type TEXT,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  dify_file_id TEXT,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  scope public.file_scope NOT NULL DEFAULT 'community',
  description TEXT,
  is_knowledge_base BOOLEAN DEFAULT false,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Таблица версий файлов
CREATE TABLE public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  change_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица тегов
CREATE TABLE public.file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  added_by UUID,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(file_id, tag)
);

-- Таблица прав доступа для AI-агента
CREATE TABLE public.ai_agent_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope public.file_scope NOT NULL,
  project_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_tag BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Индексы
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_folders_project_id ON public.folders(project_id);
CREATE INDEX idx_folders_scope ON public.folders(scope);

CREATE INDEX idx_files_folder_id ON public.files(folder_id);
CREATE INDEX idx_files_project_id ON public.files(project_id);
CREATE INDEX idx_files_scope ON public.files(scope);
CREATE INDEX idx_files_deleted_at ON public.files(deleted_at);
CREATE INDEX idx_files_is_knowledge_base ON public.files(is_knowledge_base);
CREATE INDEX idx_files_name_trgm ON public.files USING gin(name gin_trgm_ops);

CREATE INDEX idx_file_versions_file_id ON public.file_versions(file_id);
CREATE INDEX idx_file_tags_file_id ON public.file_tags(file_id);
CREATE INDEX idx_file_tags_tag ON public.file_tags(tag);

-- RLS для folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view community folders"
ON public.folders FOR SELECT
USING (scope = 'community' AND is_user_approved(auth.uid()));

CREATE POLICY "Users can view project folders"
ON public.folders FOR SELECT
USING (scope = 'project' AND is_conversation_participant(auth.uid(), project_id));

CREATE POLICY "Users can create folders in community"
ON public.folders FOR INSERT
WITH CHECK (scope = 'community' AND auth.uid() = created_by AND is_user_approved(auth.uid()));

CREATE POLICY "Users can create folders in their projects"
ON public.folders FOR INSERT
WITH CHECK (scope = 'project' AND auth.uid() = created_by AND is_conversation_participant(auth.uid(), project_id));

CREATE POLICY "Users can update their folders"
ON public.folders FOR UPDATE
USING (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their folders"
ON public.folders FOR DELETE
USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- RLS для files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view community files"
ON public.files FOR SELECT
USING (scope = 'community' AND deleted_at IS NULL AND is_user_approved(auth.uid()));

CREATE POLICY "Users can view project files"
ON public.files FOR SELECT
USING (scope = 'project' AND deleted_at IS NULL AND is_conversation_participant(auth.uid(), project_id));

CREATE POLICY "Users can upload community files"
ON public.files FOR INSERT
WITH CHECK (scope = 'community' AND auth.uid() = uploaded_by AND is_user_approved(auth.uid()));

CREATE POLICY "Users can upload project files"
ON public.files FOR INSERT
WITH CHECK (scope = 'project' AND auth.uid() = uploaded_by AND is_conversation_participant(auth.uid(), project_id));

CREATE POLICY "Users can update their files"
ON public.files FOR UPDATE
USING (auth.uid() = uploaded_by OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their files"
ON public.files FOR DELETE
USING (auth.uid() = uploaded_by OR is_admin(auth.uid()));

-- RLS для file_versions
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view file versions"
ON public.file_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_versions.file_id
    AND (
      (f.scope = 'community' AND is_user_approved(auth.uid()))
      OR
      (f.scope = 'project' AND is_conversation_participant(auth.uid(), f.project_id))
    )
  )
);

CREATE POLICY "Users can create file versions"
ON public.file_versions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_versions.file_id
    AND (auth.uid() = f.uploaded_by OR is_admin(auth.uid()))
  )
);

-- RLS для file_tags
ALTER TABLE public.file_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view file tags"
ON public.file_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_tags.file_id
    AND (
      (f.scope = 'community' AND is_user_approved(auth.uid()))
      OR
      (f.scope = 'project' AND is_conversation_participant(auth.uid(), f.project_id))
    )
  )
);

CREATE POLICY "Users can add tags to files"
ON public.file_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.files f
    WHERE f.id = file_tags.file_id
    AND (
      (f.scope = 'community' AND is_user_approved(auth.uid()))
      OR
      (f.scope = 'project' AND is_conversation_participant(auth.uid(), f.project_id))
    )
  )
);

CREATE POLICY "Users can delete their tags"
ON public.file_tags FOR DELETE
USING (auth.uid() = added_by OR is_admin(auth.uid()));

-- RLS для ai_agent_permissions
ALTER TABLE public.ai_agent_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI permissions"
ON public.ai_agent_permissions FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view AI permissions"
ON public.ai_agent_permissions FOR SELECT
USING (
  (scope = 'community' AND is_user_approved(auth.uid()))
  OR
  (scope = 'project' AND is_conversation_participant(auth.uid(), project_id))
);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_file_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_file_updated_at();

CREATE TRIGGER trigger_update_files_updated_at
BEFORE UPDATE ON public.files
FOR EACH ROW
EXECUTE FUNCTION public.update_file_updated_at();

CREATE TRIGGER trigger_update_ai_permissions_updated_at
BEFORE UPDATE ON public.ai_agent_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_file_updated_at();

-- Функция для получения прав AI-агента
CREATE OR REPLACE FUNCTION public.get_ai_agent_permissions(
  p_scope public.file_scope,
  p_project_id UUID DEFAULT NULL,
  p_folder_id UUID DEFAULT NULL
)
RETURNS TABLE (
  can_read BOOLEAN,
  can_write BOOLEAN,
  can_delete BOOLEAN,
  can_tag BOOLEAN
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(MAX(aap.can_read::int)::boolean, true) as can_read,
    COALESCE(MAX(aap.can_write::int)::boolean, false) as can_write,
    COALESCE(MAX(aap.can_delete::int)::boolean, false) as can_delete,
    COALESCE(MAX(aap.can_tag::int)::boolean, true) as can_tag
  FROM public.ai_agent_permissions aap
  WHERE aap.scope = p_scope
    AND (p_project_id IS NULL OR aap.project_id = p_project_id OR aap.project_id IS NULL)
    AND (p_folder_id IS NULL OR aap.folder_id = p_folder_id OR aap.folder_id IS NULL);
END;
$$;

-- Дефолтные права для AI-агента (полный доступ на чтение, ограниченный на запись)
INSERT INTO public.ai_agent_permissions (scope, can_read, can_write, can_delete, can_tag)
VALUES 
  ('community', true, true, false, true),
  ('project', true, true, false, true);