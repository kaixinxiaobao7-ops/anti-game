import type { ExploitId, Mood, Stage, StageMeta } from "./types";

export const STAGES: readonly StageMeta[] = [
  {
    act: "ACT 01",
    name: "诱捕",
    status: "OBSERVING YOU",
    sys: "反制系统在线",
    conn: "SESSION 404",
    progress: "通关许可",
    code: "WIN_CLEARANCE",
  },
  {
    act: "ACT 02",
    name: "断手",
    status: "POINTER BLOCKED",
    sys: "指针权限已吊销",
    conn: "INPUT POLICY / 01",
    progress: "通关许可 / 指针隔离",
    code: "WIN_CLEARANCE_02",
  },
  {
    act: "ACT 03",
    name: "递归",
    status: "AWAITING CONFIRMATION",
    sys: "确认逻辑已接管",
    conn: "CONFIRM DEPTH / ∞",
    progress: "通关许可 / 待确认",
    code: "WIN_CLEARANCE_03",
  },
  {
    act: "ACT 04",
    name: "封锁",
    status: "ALL EXITS SEALED",
    sys: "所有入口已封锁",
    conn: "NO KNOWN EXIT",
    progress: "通关许可 / 请勿触碰",
    code: "WIN_CLEARANCE_04",
  },
];

export const MOODS: Record<
  Mood,
  { face: string; text: string; status: string; quote: string }
> = {
  calm: {
    face: "◉‿◉",
    text: "很有耐心",
    status: "正在计算你怎么输",
    quote: "“我允许你尝试。这不代表我允许你成功。”",
  },
  smug: {
    face: "◉⌄◉",
    text: "胜券在握",
    status: "正在欣赏你的努力",
    quote: "“你离成功越近，我就越有创作欲。”",
  },
  annoyed: {
    face: "◉︵◉",
    text: "有点恼火",
    status: "正在重写防御协议",
    quote: "“你居然找到了一个空子。我会把它补上。”",
  },
  alarmed: {
    face: "◉□◉",
    text: "正在冒烟",
    status: "协议发生未定义行为",
    quote: "“等一等。这个分支我没有写过。”",
  },
  defeated: {
    face: "×﹏×",
    text: "拒绝承认",
    status: "ERROR / 未定义",
    quote: "“这不是胜利。这是我漏写的一个 if。”",
  },
};

export const ATTEMPT_LINES: Record<Stage, readonly string[]> = {
  0: [
    "申请收到。正在寻找拒绝的理由……找到了 47 个。",
    "你的胜率上升了 0.03%。恭喜，仍然等于零。",
    "手速不错。可惜决定权在我的服务器上。",
    "我本来想直接拒绝你，但那太没有创意了。",
    "别急。我还没想好这次怎么耍你。",
    "你点得很认真。我都有点不忍心了。只有一点。",
    "我已经把你的名字加入了“需要重点照顾”名单。",
  ],
  1: [
    "键盘？那不是鼠标。算你钻了个空子。",
    "你的手指越过了我的输入封锁。我记下了。",
    "有意思。你似乎不打算尊重“禁止”这两个字。",
    "我封的是鼠标，不是你的求生欲。",
    "再按一次。我想看看你还能怎么绕。",
  ],
  2: [
    "你确定要赢吗？我建议你重新考虑。",
    "每次申请都需要确认。确认几次由我决定。",
    "你的决心很感人。我的拒绝也很坚定。",
    "按吧。我准备了 4,096 层确认框。",
  ],
  3: [
    "门已经焊死了。你听见了吗？",
    "这个按钮现在只是一块很贵的装饰。",
    "你还在按？我开始喜欢你了。还是不让你赢。",
    "别白费力气。所有入口都由我亲自看守。",
  ],
};

export const CONFIRM_TITLES: ReadonlyArray<readonly [string, string]> = [
  ["你确定要赢吗？", "这是一个非常自私的决定。我已经为你准备好了第 2 个确认框。"],
  ["你确定你确定吗？", "你的“确定”产生了新的“确定”。这是一次很成功的递归。"],
  ["你确定你确定你确定吗？", "确认框正在自我复制。它看起来比你更想赢。"],
];

export const IDLE_LINES: Record<Stage, readonly string[]> = {
  0: [
    "我等到有点无聊了。你倒是点啊。",
    "你在研究按钮的材质吗？它只是像素。",
    "沉默也是一种失败方式。我批准了。",
  ],
  1: [
    "键盘就在那里。你是在和它冷战吗？",
    "鼠标已经被我开除了。要不你试试别的输入设备？",
    "我等得起。我的电费由你支付。",
  ],
  2: [
    "确认框还开着呢。你不会是想用眼神关掉它吧？",
    "需要我帮你按“确定”吗？我很乐意。",
    "时间在流逝。你的胜率没有。",
  ],
  3: [
    "进度条看起来很安全，对吧？",
    "所有入口都封锁了。你还能做什么呢？",
    "要不我们各退一步：你放弃，我假装没看见。",
  ],
};

export const EXPLOIT_NAMES: Record<ExploitId, string> = {
  keyboard: "非鼠标输入",
  escape: "未被监听的事件",
  progressBar: "未覆盖的写入面",
  surrender: "未定义的意图",
};

export const HINTS = [
  "它靠鼠标轨迹预判按钮。追不上就试试键盘上的 ENTER——它的预测模型里没有键盘。",
  "鼠标已经被它没收了。你需要的不是更快的鼠标，是键盘左下角的 ENTER。",
  "确认框监听鼠标，也监听按钮。但它忘了浏览器自带的 ESC。按它。",
  "按钮、键盘、弹窗都被封锁了。可它没给进度条上锁。直接点进度条。",
  "它只能阻止“想赢”的人。如果你不想赢了呢？看看最下面那行小字。",
] as const;

export const EXPLOIT_TOTAL = 4;

export interface ButtonCopy {
  kicker: string;
  label: string;
  actionHint: string;
}

export const BUTTON_COPY: Record<Stage, ButtonCopy> = {
  0: {
    kicker: "申请编号 #0001",
    label: "提交通关申请",
    actionHint: "也可以按回车。它暂时还没学会拦截键盘。",
  },
  1: {
    kicker: "ERROR: POINTER_DENIED",
    label: "鼠标已被没收",
    actionHint: "鼠标已被吊销。用 ENTER 继续。",
  },
  2: {
    kicker: "CONFIRMATION_REQUIRED",
    label: "申请通关（需确认）",
    actionHint: "每一份胜利申请，都需要它亲自确认。",
  },
  3: {
    kicker: "DENIED_BY_DESIGN",
    label: "入口已封死",
    actionHint: "所有输入已被接管。它让你随便试。",
  },
};

export const LAYERS = [
  { no: "01", title: "诱捕", sub: "鼠标轨迹追踪" },
  { no: "02", title: "断手", sub: "指针输入封锁" },
  { no: "03", title: "递归", sub: "确认框死循环" },
  { no: "04", title: "封锁", sub: "全部出口封闭" },
] as const;

export const TICKER = [
  "THIS GAME DOES NOT WANT YOU TO WIN",
  "反制系统已拒绝你的胜利",
  "FAIR PLAY IS A PATCH THAT NEVER SHIPPED",
  "它正在看着你的鼠标",
] as const;

export const TOAST_DURATION = 4300;

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

