import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

// Auto-approved users who can use instant registration
const autoApprovedEmails = [
  'radosvetdamir@gmail.com',
  'shurik.orlov@gmail.com',
  'admin@zhos.com',
  'moderator@zhos.com',
  'guardian@zhos.com',
  'developer@zhos.com'
]

// Валідація вводу
const AutoRegisterSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string()
    .min(12, 'Пароль має містити мінімум 12 символів')
    .max(200, 'Пароль занадто довгий')
    .refine(
      (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd),
      'Пароль має містити великі та малі літери, а також цифри'
    ),
  displayName: z.string().max(100).optional(),
});

serve(async (req) => {
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  try {
    // Валідація вводу
    const body = await req.json();
    const validationResult = AutoRegisterSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { 
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      );
    }

    const { email, password, displayName } = validationResult.data;

    // Check if email is in auto-approved list
    if (!autoApprovedEmails.includes(email.toLowerCase())) {
      return new Response(
        JSON.stringify({ 
          error: 'Эта функция доступна только для предварительно одобренных пользователей' 
        }),
        { 
          status: 403,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    // Service role потрібен для admin операцій (створення користувачів)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log(`Auto-register request for: ${email}`)

    // Try to find existing user by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`Found existing user: ${existingUser.id}`)
      
      // Update password for existing user
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { 
          password: password,
          email_confirm: true // Confirm email automatically
        }
      )

      if (updateError) {
        console.error('Error updating user:', updateError)
        return new Response(
          JSON.stringify({ error: `Ошибка обновления пользователя: ${updateError.message}` }),
          { 
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log(`Updated user ${existingUser.id} with new password and confirmed email`)

      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: existingUser.id,
          email: email,
          display_name: displayName || email.split('@')[0],
          approval_status: 'approved',
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }

    } else {
      console.log(`Creating new user for: ${email}`)
      
      // Create new user with confirmed email
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          display_name: displayName || email.split('@')[0]
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: `Ошибка создания пользователя: ${createError.message}` }),
          { 
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log(`Created new user: ${newUser.user.id}`)

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: newUser.user.id,
          email: email,
          display_name: displayName || email.split('@')[0],
          approval_status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    // Now sign in the user to get a session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (signInError) {
      console.error('Error signing in:', signInError)
      return new Response(
        JSON.stringify({ 
          error: `Пользователь создан, но не удалось войти: ${signInError.message}. Попробуйте войти вручную.` 
        }),
        { 
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Successfully signed in user: ${email}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        session: signInData.session,
        user: signInData.user
      }),
      { 
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Auto-register error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    )
  }
})
