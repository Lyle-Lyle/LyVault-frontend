# Group Buy Market Next UI

一个用于联调本地商城与拼团交易系统的 Next.js 前端项目。

当前前端只直连商城后端：

- 商城接口：`http://127.0.0.1:8070`
- 拼团交易系统：由商城后端继续调用，不在前端直连

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Sonner

## 已完成页面

- `/login`：邮箱 / 手机号验证码登录
- `/`：首页与商品导览
- `/products/9890001`：商品详情、开团、参团、mock 支付
- `/orders`：订单列表与退款入口

## 本地运行

1. 确保商城项目已经启动在 `8070`
2. 安装依赖
3. 启动前端

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000
```

## 环境变量

项目默认读取：

```bash
NEXT_PUBLIC_MALL_API_URL=http://127.0.0.1:8070
```

如果需要新增环境文件，可以参考：

- `.env.local.example`

## 联调流程

1. 登录页发送验证码
2. 使用固定验证码 `123456` 登录
3. 进入商品详情页创建订单
4. 在支付弹层里确认 mock 支付
5. 到订单页查看 `PAY_SUCCESS / DEAL_DONE`
6. 需要时发起退款

## 说明

- 当前项目是联调版 UI，重点是打通下单、拼团、支付、订单状态与退款流程
- 不接微信 / 支付宝真实前端 SDK
- 支付确认按钮调用的是商城 mock 支付成功接口
