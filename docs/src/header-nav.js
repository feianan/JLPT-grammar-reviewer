// 初始化 header 和導覽列
function initHeaderNav(currentPage) {
  const navItems = [
    { href: "index.html", icon: "📚", label: "瀏覽", id: "browse" },
    { href: "flashcard.html", icon: "🃏", label: "文法測試", id: "flashcard" },
    { href: "quiz.html", icon: "✏️", label: "翻譯測試", id: "quiz" },
    { href: "compare.html", icon: "⚖️", label: "語氣比較", id: "compare" },
  ];

  const tabsHtml = navItems
    .map(
      (item) =>
        `<a class="tab ${item.id === currentPage ? "active" : ""}" href="${item.href}">${item.icon} ${item.label}</a>`,
    )
    .join("");

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="header">
      <div class="logo">N2 <span>文法</span>複習</div>
      <div class="badge" id="total-badge">載入中...</div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="prog" style="width: 0%"></div>
    </div>
    <div class="tabs">
      ${tabsHtml}
    </div>
    <div id="tab-content"></div>
  `;
}

// 更新進度條（共用函數）
function updateProgress() {
  const completion = MemoryState.getLowestCycleCompletion(GRAMMAR_DB, cycles);
  const pct = MemoryState.getProgress(cycles, GRAMMAR_DB.length);
  const progEl = document.getElementById("prog");
  const badgeEl = document.getElementById("total-badge");

  if (progEl) progEl.style.width = pct + "%";

  if (badgeEl) {
    const cycleLabel =
      completion.cycle === 0 ? "週期 0" : `週期 ${completion.cycle}`;
    const completed = completion.total - completion.remaining;
    badgeEl.textContent = `${cycleLabel}: ${completed}／${completion.total}`;
  }
}

// 取得內容容器（方便在各頁面使用）
function getTabContent() {
  return document.getElementById("tab-content");
}
