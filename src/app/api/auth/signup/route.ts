import { NextRequest, NextResponse } from "next/server"
import { createUserInput } from "@/lib/schemas/users"
import { createUser } from "@/lib/services/userService"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const input = createUserInput.parse(body)

  const campaign = await createUser(input)

  return NextResponse.json(campaign)
}