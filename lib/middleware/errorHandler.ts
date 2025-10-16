import { NextResponse } from "next/server";

export function handleError(error: any) {
  console.error("API Error:", error);

  if (error.name === "ValidationError") {
    return NextResponse.json(
      {
        status: "failed",
        message: "Validation error",
        errors: error.errors,
      },
      { status: 400 }
    );
  }

  if (error.name === "MongoError" && error.code === 11000) {
    return NextResponse.json(
      {
        status: "failed",
        message: "Duplicate key error",
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      status: "failed",
      message: error.message || "Internal Server Error",
    },
    { status: error.statusCode || 500 }
  );
}

export function asyncHandler(handler: Function) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

