"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountLogin, sendLoginCode } from "@/lib/api/mall";
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
      account: "postman_user_001@test.com",
      verifyCode: "123456",
    },
  });

  const loginType = form.watch("loginType");
  const helperText = useMemo(
    () =>
      loginType === "email"
        ? "建议优先用邮箱联调，验证码默认固定为 123456。"
        : "手机号同样支持固定验证码 123456，方便你快速回归流程。",
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
      toast.success("登录成功，进入拼团工作台");
      router.push("/group-buy/mine");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(218,72,37,0.16),_transparent_30%),linear-gradient(180deg,#e8eef7_0%,#f5f1eb_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[36px] border border-slate-300/70 bg-white/75 p-8 shadow-[0_24px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-8">
            <div className="grid h-28 w-28 place-items-center rounded-[28px] bg-gradient-to-br from-red-600 to-orange-500 text-4xl font-black text-white shadow-lg shadow-red-900/20">
              拼
            </div>

            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                <Sparkles className="h-4 w-4" />
                GroupBuy Login
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950">
                先登录
                <br />
                再开始联调
              </h1>
              <p className="text-base leading-7 text-slate-600">
                登录成功后，前端会直接使用当前账号作为 `userId` 去请求创建拼团、管理详情、参团支付和订单查询接口。
              </p>
            </div>

            <div className="grid gap-3 rounded-[28px] bg-slate-950 p-5 text-left text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <span>默认对接本地接口 `http://127.0.0.1:8070`</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange-300" />
                <span>验证码固定 123456，适合高频回归</span>
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

            <Tabs
              value={loginType}
              onValueChange={(value) => form.setValue("loginType", value as LoginFormValues["loginType"])}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="email">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Mail className="h-4 w-4" />
                    邮箱登录
                  </div>
                  <div className="mt-2 text-sm opacity-80">推荐用于拼团接口联调</div>
                </TabsTrigger>
                <TabsTrigger value="phone">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Smartphone className="h-4 w-4" />
                    手机登录
                  </div>
                  <div className="mt-2 text-sm opacity-80">同样支持验证码回归测试</div>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="email" />
              <TabsContent value="phone" />
            </Tabs>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="account">{loginType === "email" ? "邮箱地址" : "手机号码"}</Label>
                <Input
                  id="account"
                  {...form.register("account")}
                  placeholder={loginType === "email" ? "postman_user_001@test.com" : "13800138000"}
                />
                {form.formState.errors.account ? (
                  <p className="text-sm text-red-500">{form.formState.errors.account.message}</p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="verifyCode">验证码</Label>
                  <Input id="verifyCode" {...form.register("verifyCode")} placeholder="123456" />
                  {form.formState.errors.verifyCode ? (
                    <p className="text-sm text-red-500">{form.formState.errors.verifyCode.message}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                  className="mt-7 h-14 rounded-2xl px-5"
                >
                  {isSendingCode ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "发送验证码"}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-base hover:from-orange-400 hover:to-red-400"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "进入拼团工作台"}
              </Button>
            </form>

            <div className="mt-8 rounded-[28px] bg-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
              登录完成后优先进入：
              <br />
              `我创建的团购` 列表页，随后可以继续创建活动、查看管理详情和订单页。
            </div>

            <Button asChild variant="ghost" className="mt-6 w-fit rounded-full px-0 text-sm text-slate-500 hover:bg-transparent">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
