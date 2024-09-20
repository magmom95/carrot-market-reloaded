"use server";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import { z } from "zod";

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
      .transform((username) => `🔥 ${username}`)
      .refine(checkUsername, "test는 안돼"),
    email: z.string().email().toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  // .refine(checkPassword, "비밀번호가 달라요") 이러면 글로벌 오류라고 생각함;
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
  // try {
  //   formSchema.parse(data);
  // } catch (e) {
  //   console.log(e);
  // }
  const result = formSchema.safeParse(data);
  if (!result.success) {
    console.log(result.error.flatten());

    return result.error.flatten();
  } else {
    console.log(result.data);
  }
}
