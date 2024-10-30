"use server";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import getSession from "@/lib/session";

const checkUsername = (username: string) => !username.includes("test");

const checkPassword = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "string 타입이어야 함",
        required_error: "필수에요",
      })
      .trim()
      .toLowerCase()
      .refine(checkUsername, "test는 안돼"),

    email: z.string().email().toLowerCase(),

    password: z.string().min(PASSWORD_MIN_LENGTH),

    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This username is already taken",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This email is already taken",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })

  .refine(checkPassword, {
    message: "패스워드가 일치하지 않습니다.",
    path: ["confirm_password"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = await formSchema.spa(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
    const session = await getSession();
    session.id = user.id;
    await session.save();
    redirect("/profile");
  }
}
