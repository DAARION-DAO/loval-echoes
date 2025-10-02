import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/').filter(Boolean);

    // GET /search - поиск файлов
    if (method === 'GET' && pathParts[0] === 'search') {
      const query = url.searchParams.get('q') || '';
      const scope = url.searchParams.get('scope');
      const projectId = url.searchParams.get('projectId');
      const tags = url.searchParams.get('tags')?.split(',') || [];
      const fileType = url.searchParams.get('fileType');
      
      let dbQuery = supabase
        .from('files')
        .select(`
          *,
          file_tags(tag),
          profiles:uploaded_by(display_name, avatar_url),
          folders(name),
          conversations:project_id(name)
        `)
        .is('deleted_at', null);
      
      if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }
      
      if (scope) {
        dbQuery = dbQuery.eq('scope', scope);
      }
      
      if (projectId) {
        dbQuery = dbQuery.eq('project_id', projectId);
      }
      
      if (fileType) {
        dbQuery = dbQuery.eq('file_type', fileType);
      }
      
      const { data: files, error } = await dbQuery.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Фильтр по тегам на клиенте
      let filteredFiles = files;
      if (tags.length > 0) {
        filteredFiles = files.filter((file: any) => {
          const fileTags = file.file_tags?.map((t: any) => t.tag) || [];
          return tags.some(tag => fileTags.includes(tag));
        });
      }
      
      return new Response(JSON.stringify({ files: filteredFiles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /folders - получение структуры папок
    if (method === 'GET' && pathParts[0] === 'folders') {
      const scope = url.searchParams.get('scope');
      const projectId = url.searchParams.get('projectId');
      
      let query = supabase
        .from('folders')
        .select('*')
        .order('name');
      
      if (scope) {
        query = query.eq('scope', scope);
      }
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ folders: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /folders - создание папки
    if (method === 'POST' && pathParts[0] === 'folders') {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name: body.name,
          parent_id: body.parentId,
          project_id: body.projectId,
          scope: body.scope,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ folder: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /{fileId} - получение информации о файле
    if (method === 'GET' && pathParts.length === 1) {
      const fileId = pathParts[0];
      
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          file_tags(tag, auto_generated),
          file_versions(version_number, created_at, uploaded_by, change_note),
          profiles:uploaded_by(display_name, avatar_url),
          folders(name),
          conversations:project_id(name)
        `)
        .eq('id', fileId)
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ file: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /create - создание файла AI-агентом
    if (method === 'POST' && pathParts[0] === 'create') {
      const body = await req.json();
      
      // Проверка прав AI-агента
      const { data: permissions } = await supabase.rpc('get_ai_agent_permissions', {
        p_scope: body.scope,
        p_project_id: body.projectId,
        p_folder_id: body.folderId,
      });
      
      if (!permissions || !permissions[0]?.can_write) {
        return new Response(JSON.stringify({ error: 'AI agent has no write permission' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { data, error } = await supabase
        .from('files')
        .insert({
          name: body.name,
          file_type: body.fileType || 'other',
          mime_type: body.mimeType,
          size_bytes: body.sizeBytes,
          storage_path: body.storagePath,
          dify_file_id: body.difyFileId,
          folder_id: body.folderId,
          project_id: body.projectId,
          scope: body.scope,
          description: body.description,
          uploaded_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Добавить теги, если есть
      if (body.tags && body.tags.length > 0) {
        await supabase.from('file_tags').insert(
          body.tags.map((tag: string) => ({
            file_id: data.id,
            tag,
            added_by: user.id,
            auto_generated: body.autoGeneratedTags || false,
          }))
        );
      }
      
      return new Response(JSON.stringify({ file: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /{fileId}/metadata - обновление метаданных
    if (method === 'PUT' && pathParts[1] === 'metadata') {
      const fileId = pathParts[0];
      const body = await req.json();
      
      const updates: any = {};
      if (body.name) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.isKnowledgeBase !== undefined) updates.is_knowledge_base = body.isKnowledgeBase;
      if (body.folderId !== undefined) updates.folder_id = body.folderId;
      
      const { data, error } = await supabase
        .from('files')
        .update(updates)
        .eq('id', fileId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Обновить теги, если есть
      if (body.tags) {
        // Удалить старые теги
        await supabase.from('file_tags').delete().eq('file_id', fileId);
        
        // Добавить новые
        if (body.tags.length > 0) {
          await supabase.from('file_tags').insert(
            body.tags.map((tag: string) => ({
              file_id: fileId,
              tag,
              added_by: user.id,
            }))
          );
        }
      }
      
      return new Response(JSON.stringify({ file: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /{fileId}/version - создание новой версии
    if (method === 'POST' && pathParts[1] === 'version') {
      const fileId = pathParts[0];
      const body = await req.json();
      
      // Получить текущую версию
      const { data: versions } = await supabase
        .from('file_versions')
        .select('version_number')
        .eq('file_id', fileId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;
      
      const { data, error } = await supabase
        .from('file_versions')
        .insert({
          file_id: fileId,
          version_number: nextVersion,
          storage_path: body.storagePath,
          size_bytes: body.sizeBytes,
          uploaded_by: user.id,
          change_note: body.changeNote,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ version: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /{fileId} - удаление файла (soft delete)
    if (method === 'DELETE' && pathParts.length === 1) {
      const fileId = pathParts[0];
      
      // Проверка прав AI-агента, если запрос от агента
      const isAIAgent = req.headers.get('x-ai-agent') === 'true';
      
      if (isAIAgent) {
        const { data: file } = await supabase
          .from('files')
          .select('scope, project_id, folder_id')
          .eq('id', fileId)
          .single();
        
        if (file) {
          const { data: permissions } = await supabase.rpc('get_ai_agent_permissions', {
            p_scope: file.scope,
            p_project_id: file.project_id,
            p_folder_id: file.folder_id,
          });
          
          if (!permissions || !permissions[0]?.can_delete) {
            return new Response(JSON.stringify({ error: 'AI agent has no delete permission' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      }
      
      const { error } = await supabase
        .from('files')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', fileId);
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('Error in knowledge-base-api:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
