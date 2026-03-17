import { NextRequest, NextResponse } from "next/server";
import {
  getUserFavoritesService,
  addFavoriteService,
  removeFavoriteService,
} from "@/lib/services/favoriteService";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";

// Get user's favorite campaigns
export async function GET(req: NextRequest) {
  try {
    const favorites = await getUserFavoritesService(req);
    return NextResponse.json(favorites, { status: 200 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in get favorites route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred while retrieving favorites",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}

// Add campaign to favorites
export async function POST(req: NextRequest) {
  try {
    const result = await addFavoriteService(req);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in add favorite route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred while adding to favorites",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}

// Remove campaign from favorites
export async function DELETE(req: NextRequest) {
  try {
    await removeFavoriteService(req);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in remove favorite route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred while removing from favorites",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
