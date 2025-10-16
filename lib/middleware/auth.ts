import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authMiddleware(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          status: "failed",
          message: "Access denied. No token provided.",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    // Return the decoded user info so it can be used in the route handler
    return { user: decoded, error: null };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        {
          status: "failed",
          errorType: "TOKEN_EXPIRED",
          message: "Access token has expired.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        status: "failed",
        message: "Invalid token.",
      },
      { status: 401 }
    );
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await authMiddleware(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Pass user info to the handler
    return handler(request, context, authResult.user);
  };
}

export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      const authResult = await authMiddleware(request);
      
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      if (!roles.includes(authResult.user!.role)) {
        return NextResponse.json(
          {
            status: "failed",
            message: "Access denied. Insufficient permissions.",
          },
          { status: 403 }
        );
      }

      return handler(request, context, authResult.user);
    };
  };
}

