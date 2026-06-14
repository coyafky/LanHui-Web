import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1, "姓名不能为空").max(50),
  username: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "只能包含字母、数字、下划线、连字符"),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z.string().min(8, "新密码至少 8 个字符").max(64),
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入不一致",
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
