import { SignJWT, jwtVerify } from 'jose';
import { serialize } from 'cookie';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-env'
);

export async function signJWT(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

export async function verifyJWT(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export function setTokenCookie(res, token) {
    const cookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res) {
    const cookie = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
}

export async function getUserFromRequest(req) {
    const token = req.cookies.token;
    if (!token) return null;
    return await verifyJWT(token);
}
