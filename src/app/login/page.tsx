"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { sendLoginCode, accountLogin } from "@/lib/api/mall";
import { useSessionStore } from "@/store/session-store";

const schema = z.object({
  loginType: z.enum(["email", "phone"]),
  account: z.string().min(4, "请输入正确的邮箱或手机号"),
  verifyCode: z.string().min(6, "请输入 6 位验证码"),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loginType: "email",
      account: "",
      verifyCode: "123456",
    },
  });

  const loginType = form.watch("loginType");
  const helperText = useMemo(
    () => (loginType === "email" ? "建议先用邮箱联调，验证码固定为 123456。" : "手机号登录同样走 mock 验证码 123456。"),
    [loginType],
  );

  const handleSendCode = async () => {
    const account = form.getValues("account");
    if (!account) {
      toast.error("先输入邮箱或手机号");
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await sendLoginCode({
        loginType: form.getValues("loginType"),
        account,
      });

      if (response.code !== "0000") {
        toast.error(response.info || "验证码发送失败");
        return;
      }

      toast.success(response.info || "验证码已发送");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "验证码发送失败");
    } finally {
      setIsSendingCode(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const response = await accountLogin(values);
      if (response.code !== "0000" || !response.data) {
        toast.error(response.info || "登录失败");
        return;
      }

      setSession({
        account: values.account,
        loginType: values.loginType,
        token: response.data,
      });
      toast.success("登录成功，进入商城");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(218,72,37,0.16),_transparent_30%),linear-gradient(180deg,#e8eef7_0%,#f5f1eb_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="rounded-[36px] border border-slate-300/70 bg-white/75 p-8 shadow-[0_24px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-8 text-center">
            <div className="grid h-28 w-28 place-items-center rounded-[28px] bg-gradient-to-br from-red-600 to-orange-500 text-4xl font-black text-white shadow-lg shadow-red-900/20">
              拼
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Welcome Back</p>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950">
                欢迎登录
                <br />
                LyVault
              </h1>
              <p className="text-base leading-7 text-slate-600">
                这里不再依赖微信扫码。你可以直接用邮箱或手机号发验证码登录，然后进入商品页完成拼团下单与 mock 支付。
              </p>
            </div>
            <div className="grid w-full gap-3 rounded-[28px] bg-slate-950 p-5 text-left text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <span>对接当前本地商城后端与拼团交易服务</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange-300" />
                <span>验证码固定为 123456，方便联调</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-[36px] border border-slate-300/60 bg-white p-8 shadow-[0_24px_90px_-45px_rgba(15,23,42,0.45)]">
          <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">Account Login</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">邮箱 / 手机号登录</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">{helperText}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => form.setValue("loginType", "email")}
                className={`rounded-2xl px-4 py-4 text-left transition ${
                  loginType === "email"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4" />
                  邮箱登录
                </div>
                <div className="mt-2 text-sm opacity-80">适合本地联调</div>
              </button>
              <button
                type="button"
                onClick={() => form.setValue("loginType", "phone")}
                className={`rounded-2xl px-4 py-4 text-left transition ${
                  loginType === "phone"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Smartphone className="h-4 w-4" />
                  手机登录
                </div>
                <div className="mt-2 text-sm opacity-80">同样走 mock 流程</div>
              </button>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {loginType === "email" ? "邮箱地址" : "手机号码"}
                </label>
                <input
                  {...form.register("account")}
                  placeholder={loginType === "email" ? "postman_user_001@test.com" : "13800138000"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-orange-400 focus:bg-white"
                />
                {form.formState.errors.account ? (
                  <p className="text-sm text-red-500">{form.formState.errors.account.message}</p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">验证码</label>
                  <input
                    {...form.register("verifyCode")}
                    placeholder="123456"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                  {form.formState.errors.verifyCode ? (
                    <p className="text-sm text-red-500">{form.formState.errors.verifyCode.message}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                  className="mt-7 inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 px-5 font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingCode ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "发送验证码"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 font-semibold text-white transition hover:from-orange-400 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "进入商城"}
              </button>
            </form>

            <div className="mt-8 rounded-[28px] bg-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
              当前前端默认对接：
              <br />
              商城接口：<span className="font-semibold text-slate-900">http://127.0.0.1:8070</span>
              <br />
              登录成功后可直接进入商品页、下单、支付、查询订单、退款。
            </div>

            <Link href="/" className="mt-6 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
              先浏览首页
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
