import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'TU_SECRETO_SUPER_SEGURO_Y_LARGO';

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas que no requieren middleware
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Obtener token de la cookie
  const token = req.cookies.get('token')?.value;
  console.log('🔥 PROXY TOKEN:', token);

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Verifica y decodifica el JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    console.log(decoded.role)
    // Evitar que "kitchen" acceda a rutas de waiter
    if (decoded.role == 'KITCHEN' && pathname.startsWith('/waiter')) {
      return NextResponse.redirect(new URL('/kitchen/orders', req.url));
    }

    // Evitar que "waiter" acceda a rutas de kitchen
    if (decoded.role == 'WAITER' && pathname.startsWith('/kitchen')) {
      return NextResponse.redirect(new URL('/waiter/tables', req.url));
    }

    // Si el rol corresponde a la ruta, permite continuar
    return NextResponse.next();
  } catch (err) {
    console.error('JWT inválido o expirado:', err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/waiter/:path*', '/kitchen/:path*', '/'],
};
