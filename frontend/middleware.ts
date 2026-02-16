import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 公開パス（認証不要）
  const publicPaths = ['/login', '/lp/', '/r/'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();  // 認証不要でそのまま通す
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッション確認
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 未ログイン時のリダイレクト（ログイン画面以外）
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // ログイン済みでログイン画面にアクセス
  if (session && request.nextUrl.pathname === '/login') {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // TODO: マスターページ権限チェック（現在はダミー認証。本番では要実装）
  const masterPaths = ['/master/'];
  const isMasterPath = masterPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isMasterPath && session) {
    // TODO: scoutsテーブルからroleを取得してチェック
    // 現在はダミーでID=3のみマスター権限とする
    // 将来的には: Supabaseクエリでuser.email -> scouts.role を確認
    // role !== 'admin' の場合は / にリダイレクト
    
    // ダミー実装（将来削除）
    // const userEmail = session.user.email;
    // if (userEmail !== 'admin@smartnr.jp') {
    //   return NextResponse.redirect(new URL('/', request.url));
    // }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 以下を除く全てのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - public フォルダ内のファイル
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
