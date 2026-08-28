"use client";
// Payroll — the register.
//
// ADMIN ONLY. Two independent gates, on purpose:
//   1. This page refuses to render for anyone whose role_id is not 1.
//   2. Every /api/payroll endpoint checks the signed session server-side.
// Gate 1 alone would be theatre — hiding a screen is not access control, and
// salary data is exactly the wrong thing to protect with a hidden menu item.
//
// THEME. The portal has no global dark mode, so this module carries its own:
// it follows the OS by default and remembers an explicit choice in
// localStorage. See payroll.css for how the tokens are layered.

import "./payroll.css";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_ROOT = process.env.NEXT_PUBLIC_BACKEND_URL;
const API = `${API_ROOT}/api/payroll`;
const AUTH_ME = `${API_ROOT}/api/auth/me`;
// The flag that decides whether this module is reachable. Resolved server-side
// on every request too; this is only so the page can say why it is not here.
const FEATURE_KEY = "payroll";
const ADMIN_ROLE_ID = 1;
const THEME_KEY = "kiotel.payroll.theme";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

// Indian grouping, because that is how these figures are read aloud.
const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = (n) => "₹" + Math.round(Number(n || 0)).toLocaleString("en-IN");
const num = (n) => Number(n || 0).toLocaleString("en-IN");

// Mirrors payrollQuery.PAGE_SIZE_DEFAULT on the server, and is only the value
// used for the very first render: usePageSize below replaces it with whatever
// the API actually reports. Two independent defaults would mean the first page
// you see is not the page the server paginated.
const DEFAULT_PAGE_SIZE = 100;
// PAGE_SIZE_MAX on the server is 200, so 200 is the largest offer that will not
// be silently clamped.
const PAGE_SIZES = [25, 50, 100, 200];

// "2026-07-10" -> "10 Jul". Split by hand: `new Date("2026-07-10")` is parsed as
// UTC midnight and can render as the 9th for anyone west of Greenwich.
const shortDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
  // '0000-00-00' survives in old MySQL data; a bad month must not take the
  // whole page down over one chip.
  const name = m && MONTHS[Number(m[2]) - 1];
  return name ? `${Number(m[3])} ${name.slice(0, 3)}` : "—";
};

const api = axios.create({ baseURL: API, withCredentials: true });

function errText(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

/* ══════════════════════════════════════════════════════════
   THEME
   ══════════════════════════════════════════════════════════ */
function useTheme() {
  // "system" until the user picks, so we honour the OS rather than guessing.
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch { /* private mode — stay on system */ }
  }, []);

  const choose = useCallback((next) => {
    setTheme(next);
    try {
      if (next === "system") window.localStorage.removeItem(THEME_KEY);
      else window.localStorage.setItem(THEME_KEY, next);
    } catch { /* nothing to do */ }
  }, []);

  // Undefined lets the CSS media query decide; a value overrides it both ways.
  const attr = theme === "system" ? undefined : theme;
  return { theme, attr, choose };
}

function ThemeToggle({ theme, choose }) {
  const order = ["system", "light", "dark"];
  const icon = { system: "◐", light: "☀", dark: "☾" };
  const label = { system: "Match system", light: "Light", dark: "Dark" };
  const next = order[(order.indexOf(theme) + 1) % order.length];
  return (
    <button
      className="pr-btn pr-btn-icon"
      onClick={() => choose(next)}
      title={`Theme: ${label[theme]} — click for ${label[next]}`}
      aria-label={`Theme: ${label[theme]}. Switch to ${label[next]}.`}
      type="button"
    >
      <span aria-hidden="true">{icon[theme]}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   SMALL PIECES
   ══════════════════════════════════════════════════════════ */
const StatusPill = ({ status }) => {
  const cls = { DRAFT: "pr-pill-draft", FINALISED: "pr-pill-final", PAID: "pr-pill-paid" }[status] || "pr-pill-draft";
  const text = { DRAFT: "Draft", FINALISED: "Finalised", PAID: "Paid" }[status] || status;
  return <span className={`pr-pill ${cls}`}>{text}</span>;
};

function Notice({ kind, children, onClose }) {
  if (!children) return null;
  return (
    <div className={`pr-note pr-note-${kind}`}>
      <span aria-hidden="true">{kind === "ok" ? "✓" : kind === "warn" ? "▲" : "!"}</span>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button className="pr-note-x" onClick={onClose} aria-label="Dismiss" type="button">×</button>
      )}
    </div>
  );
}

function Pager({ pagination, limit, onPage, onLimit, unit = "rows", className = "" }) {
  if (!pagination) return null;
  const { page, pages, total } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  return (
    <div className={"pr-pager " + className}>
      <span>{total === 0 ? `No ${unit}` : `${from}–${to} of ${num(total)} ${unit}`}</span>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span className="pr-dim">per page</span>
        <select value={limit} onChange={(e) => onLimit(Number(e.target.value))}>
          {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <div className="pr-pager-btns">
        <button className="pr-btn pr-btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)} type="button">← Prev</button>
        <span>Page {page} of {Math.max(1, pages)}</span>
        <button className="pr-btn pr-btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)} type="button">Next →</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEARCH BAR
   ══════════════════════════════════════════════════════════ */
function SearchBar({
  value, onChange, help, applied, unknown, busy,
  placeholder = "singh   lop>=2   overridden:yes   net<20000",
  label = "Search the register",
}) {
  const [local, setLocal] = useState(value);
  const [showHelp, setShowHelp] = useState(false);
  const timer = useRef(null);

  useEffect(() => setLocal(value), [value]);

  // Debounced: typing "lop>=2" should not fire five queries on the way there.
  const push = (next) => {
    setLocal(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), 300);
  };

  return (
    <div>
      <div className="pr-searchbar">
        <div className="pr-search-wrap">
          <input
            className="pr-search"
            value={local}
            onChange={(e) => push(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { clearTimeout(timer.current); onChange(local); } }}
            placeholder={`Search — try  ${placeholder}`}
            aria-label={label}
          />
          {local && (
            <button className="pr-search-clear" onClick={() => { setLocal(""); onChange(""); }}
                    aria-label="Clear search" type="button">×</button>
          )}
        </div>
        {busy && <span className="pr-spin" aria-label="Searching" />}
        <button className="pr-btn pr-btn-sm" onClick={() => setShowHelp((v) => !v)} type="button">
          {showHelp ? "Hide" : "Syntax"}
        </button>
      </div>

      {(applied?.length > 0 || unknown?.length > 0) && (
        <div className="pr-chips">
          {applied?.map((a, i) => (
            <span key={i} className="pr-chip">
              {a.field === "any" ? "text" : a.field}
              {a.op === "contains" ? " ∋ " : a.op === "is" ? " = " : ` ${a.op} `}
              {String(a.value)}
            </span>
          ))}
          {/* An unresolved term is shown, never dropped: on a payroll grid a
              silently-ignored filter means a silently-wrong total. */}
          {unknown?.map((u, i) => (
            <span key={`u${i}`} className="pr-chip pr-chip-bad" title="Not understood — this term was ignored">
              ⚠ {u}
            </span>
          ))}
        </div>
      )}

      {showHelp && help && (
        <div className="pr-panel" style={{ marginTop: 10 }}>
          <div className="pr-panel-body">
            <div className="pr-hint" style={{ marginBottom: 10 }}>
              Terms combine with <strong>AND</strong>. Quote a phrase to keep it together.
            </div>
            <div className="pr-grid2">
              <div>
                <div className="pr-lbl" style={{ marginBottom: 6 }}>Examples</div>
                {help.examples?.map((e) => (
                  <div key={e.q} className="pr-hint" style={{ marginBottom: 4 }}>
                    <code>{e.q}</code> — {e.means}
                  </div>
                ))}
              </div>
              <div>
                <div className="pr-lbl" style={{ marginBottom: 6 }}>Fields</div>
                <div className="pr-hint" style={{ marginBottom: 8 }}>
                  {help.fields?.map((f) => <code key={f.key} style={{ marginRight: 4 }}>{f.key}</code>)}
                </div>
                <div className="pr-lbl" style={{ marginBottom: 6 }}>Yes / no</div>
                <div className="pr-hint">
                  {help.flags?.map((f) => <code key={f} style={{ marginRight: 4 }}>{f}:yes</code>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REGISTER
   ══════════════════════════════════════════════════════════ */
const COLUMNS = [
  { key: "name",       label: "Employee",     src: null,     align: "left" },
  { key: "base",       label: "Base",         src: "Master" },
  { key: null,         label: "Day rate",     src: "Base ÷ 30" },
  { key: "bonus",      label: "Bonus",        src: "Manual" },
  { key: "deduction",  label: "Deduction",    src: "Manual" },
  { key: "nights",     label: "Night allow.", src: "Clock-in", srcCls: "pr-src-clk" },
  { key: "extra",      label: "Extra shifts", src: "Schedule", srcCls: "pr-src-sch" },
  { key: "lop",        label: "LOP",          src: "Schedule", srcCls: "pr-src-sch" },
  { key: "half",       label: "Half days",    src: "Schedule", srcCls: "pr-src-sch" },
  { key: "penalty",    label: "Penalty",      src: "Clock-in", srcCls: "pr-src-clk" },
  { key: "missedin",   label: "Missed in",    src: "Clock-in", srcCls: "pr-src-clk" },
  { key: "missedout",  label: "Missed out",   src: "Clock-in", srcCls: "pr-src-clk" },
  { key: "prejoining", label: "Pre-joining",  src: "Joined on", srcCls: "pr-src-man" },
  { key: "postexit",   label: "Post-exit",    src: "Left on",   srcCls: "pr-src-man" },
  { key: "unaccounted",label: "Unaccounted",  src: "No record", srcCls: "pr-src-non" },
  { key: "net",        label: "Net pay",      src: "Computed" },
];

function RegisterTable({ lines, totals, sort, onSort, onCell, locked }) {
  const arrow = (key) => (sort.key === key ? (sort.dir === "desc" ? "▼" : "▲") : "");

  const Cell = ({ line, field, value, zero, children, cls = "" }) => (
    <td className={cls}>
      <button
        className={`pr-cell${zero ? " zero" : ""}${value?.overridden ? " pr-ovr" : ""}`}
        onClick={() => onCell(line, field)}
        type="button"
        title={value?.overridden
          ? `Overridden — the system computed ${value.computed}`
          : "Click to see the days behind this"}
      >
        <span className="v">{children}</span>
      </button>
    </td>
  );

  return (
    <div className="pr-scroller pr-scroller-grid">
      <table className="pr-table">
        <thead>
          <tr>
            {COLUMNS.map((c, i) => (
              <th key={c.label} style={i === 0 ? undefined : { textAlign: "right" }}>
                {c.key ? (
                  <button className="pr-th-btn" onClick={() => onSort(c.key)} type="button">
                    <span className="pr-lbl">{c.label} <span className="pr-sort-mark">{arrow(c.key)}</span></span>
                    {c.src && <span className={`pr-src ${c.srcCls || "pr-src-man"}`}>{c.src}</span>}
                  </button>
                ) : (
                  <>
                    <span className="pr-lbl">{c.label}</span>
                    {c.src && <span className={`pr-src ${c.srcCls || "pr-src-man"}`}>{c.src}</span>}
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id}>
              <td>
                <span className="pr-emp">
                  <span className="pr-emp-n">
                    {l.employee_name}
                    {l.is_deleted_employee && <span className="pr-chipn">left</span>}
                    {l.pre_joining_days.effective > 0 && (
                      <span className="pr-chipj" title={`Joined ${l.joined_on} — paid from that date`}>
                        joined {shortDate(l.joined_on)}
                      </span>
                    )}
                    {l.post_exit_days.effective > 0 && (
                      <span className="pr-chipn" title={`Left ${l.exited_on} — paid up to that date`}>
                        left {shortDate(l.exited_on)}
                      </span>
                    )}
                    {l.unrostered_days > 0 && (
                      <span className="pr-chipu" title={`Clocked in on ${l.unrostered_days} day(s) with no roster entry`}>
                        off-roster {l.unrostered_days}
                      </span>
                    )}
                  </span>
                  <span className="pr-emp-i">{l.employee_unique_id}</span>
                </span>
              </td>
              <Cell line={l} field="base" value={null}>{money0(l.base_salary)}</Cell>
              <td><span className="pr-cell pr-dim">{Number(l.day_rate).toFixed(2)}</span></td>
              <Cell line={l} field="bonus" value={null} zero={!l.bonus_total}>
                <span className={l.bonus_total ? "pr-credit" : ""}>
                  {l.bonus_total ? `+${money0(l.bonus_total)}` : "—"}
                </span>
              </Cell>
              <Cell line={l} field="deduction" value={null} zero={!l.deduction_total}>
                <span className={l.deduction_total ? "pr-debit" : ""}>
                  {l.deduction_total ? `−${money0(l.deduction_total)}` : "—"}
                </span>
              </Cell>
              <Cell line={l} field="night_shifts" value={l.night_shifts} zero={!l.night_allowance}>
                <span className={l.night_allowance ? "pr-credit" : "pr-dim"}>
                  {l.night_allowance ? `+${money0(l.night_allowance)}` : "—"}
                </span>
              </Cell>
              <Cell line={l} field="extra_shifts" value={l.extra_shifts} zero={!l.extra_shifts.effective}>
                {l.extra_shifts.effective || "—"}
              </Cell>
              <Cell line={l} field="lop_days" value={l.lop_days} zero={!l.lop_days.effective}>
                {l.lop_days.effective || "—"}
              </Cell>
              <Cell line={l} field="half_days" value={l.half_days} zero={!l.half_days.effective}>
                {l.half_days.effective || "—"}
              </Cell>
              <Cell line={l} field="penalty_days" value={l.penalty_days} zero={!l.penalty_days.effective}>
                {l.penalty_days.effective || "—"}
              </Cell>
              <Cell line={l} field="missed_clockin" value={l.missed_clockin} zero={!l.missed_clockin.effective}>
                {l.missed_clockin.effective || "—"}
              </Cell>
              <Cell line={l} field="missed_clockout" value={l.missed_clockout} zero={!l.missed_clockout.effective}>
                {l.missed_clockout.effective || "—"}
              </Cell>
              <Cell line={l} field="pre_joining_days" value={l.pre_joining_days} zero={!l.pre_joining_days.effective}>
                {l.pre_joining_days.effective || "—"}
              </Cell>
              <Cell line={l} field="post_exit_days" value={l.post_exit_days} zero={!l.post_exit_days.effective}>
                {l.post_exit_days.effective || "—"}
              </Cell>
              <Cell line={l} field="unaccounted_days" value={l.unaccounted_days} zero={!l.unaccounted_days.effective}>
                {l.unaccounted_days.effective || "—"}
              </Cell>
              <Cell line={l} field="net" value={null} cls="pr-net-col">
                <span style={{ fontWeight: 600 }}>{money(l.net_pay)}</span>
              </Cell>
            </tr>
          ))}
        </tbody>
        {totals && (
          <tfoot>
            <tr>
              <td>{num(lines.length)} shown</td>
              <td>{money0(totals.base_total)}</td>
              <td />
              <td className="pr-credit">{totals.bonus_total ? `+${money0(totals.bonus_total)}` : "—"}</td>
              <td className="pr-debit">{totals.deduction_total ? `−${money0(totals.deduction_total)}` : "—"}</td>
              <td className="pr-credit">{totals.night_total ? `+${money0(totals.night_total)}` : "—"}</td>
              <td colSpan={9} />
              <td>{money(totals.net_total)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   GUIDE — what every part of this module does, in plain words
   ══════════════════════════════════════════════════════════ */

/**
 * Written for somebody who has never run payroll here before, and kept inside
 * the app rather than in a document nobody can find when it matters. Every
 * section answers a question somebody actually asks on their first month.
 */
const GUIDE = [
  {
    id: "idea",
    title: "The idea in one minute",
    body: [
      { p: "Payroll reads two things you already keep up to date — the schedule and the clock-in log — and turns them into a month of pay. It does not ask you to enter attendance again." },
      { p: "The schedule says what somebody was supposed to do. The clock-in log says what actually happened. Pay is what you get when you compare the two against your salary rules." },
      { p: "Nothing is ever calculated behind your back: every figure on the register can be clicked to see the exact days it came from." },
    ],
  },
  {
    id: "who",
    title: "Who gets paid — the People screen",
    body: [
      { p: "Payroll only pays people on its own list. Not everybody with a login: your user table also holds test accounts and departmental logins, and there is nothing in those records to tell them apart from real staff. So payroll keeps its own list, and you decide who is on it." },
      { h: "Setting it up the first time" },
      { p: "Open People → To decide. It shows everybody who is not yet on payroll, with two numbers each: how many days they were rostered, and how many days they clocked in, over the last 90 days." },
      { p: "That is the whole trick. A real employee has activity. A test account has none. Leave the filter on active:yes, check the list looks right, and press Add all. Then switch the filter to active:no and look through what is left — that short list is where the test and departmental accounts sit." },
      { h: "After that, it maintains itself" },
      { p: "You never have to browse the user list again. When somebody joins, they appear under Needs attention on their own, and the People tab shows a number. Same when somebody leaves." },
    ],
  },
  {
    id: "joiners",
    title: "When somebody joins",
    body: [
      { p: "You do not go looking. Payroll notices, in two independent ways, and shows them under Needs attention:" },
      { list: [
        "Their joining date is recent — read from the date-of-joining field on their user record.",
        "They start appearing in the schedule or the clock-in log, even if nobody filled in a joining date.",
      ] },
      { p: "Two signals rather than one, because either alone misses people. Somebody hired last week who has not been rostered yet would be invisible to the second; somebody whose joining date was never filled in would be invisible to the first." },
      { p: "Press Add all, or Review to look at them individually. Adding somebody costs nothing and can be undone." },
      { h: "Joining part-way through a month" },
      { p: "Somebody who joins on the 10th is paid from the 10th. The 1st to the 9th are deducted, and no attendance is expected from them on those days — they are not marked absent for a job they did not have yet." },
    ],
  },
  {
    id: "leavers",
    title: "When somebody leaves",
    body: [
      { p: "The important rule first: deleting somebody's account does not remove them from payroll. If it did, deleting an account on the 12th would erase twelve days of pay they had already earned." },
      { p: "What ends their pay is the exit date — their last working day. They are paid up to and including it, they stay on the run for the month they left, and they drop off automatically from the month after." },
      { h: "Most of the time this is automatic" },
      { p: "When HR schedules an account for deletion, that already records a date. Payroll reads it and offers it to you under Needs attention: “3 people have an offboarding date”. One press applies all of them." },
      { h: "When it cannot be automatic" },
      { p: "If an account was deleted outright, with no date recorded anywhere, payroll has nothing to read. It will show you the last day the person actually worked and ask you to confirm. It will not guess — an exit date decides somebody's final salary, so a person signs off on it." },
      { p: "The roster shows where each exit date came from, so you can always tell a date somebody confirmed from one the system inferred." },
    ],
  },
  {
    id: "salaries",
    title: "Salaries, and their history",
    body: [
      { p: "Everybody is paid their own amount, set on the Salaries screen. Type the new figures in the New amount column, pick the date they apply from, and save the lot in one go." },
      { h: "Nothing is ever overwritten" },
      { p: "A salary is not a field that gets replaced. It is a record with a start date. Setting a new amount closes the previous one the day before, so the old figure is still there and still answerable." },
      { p: "This is what makes past months safe. Payroll for March reads whatever was in force in March. Giving somebody a raise today cannot quietly change what you paid them in March, even if you reopen and recompute that month." },
      { p: "Press View on any row to see every amount that person has ever been on, with the dates each one ran between." },
      { h: "Pick your dates carefully" },
      { p: "A month is paid at whatever amount was in force at the end of that month. So a raise dated the 1st is clean — that whole month is at the new rate. A raise dated the 15th means the whole of that month is paid at the new rate too, not half and half. If you want a mid-month raise split properly, use a bonus or a deduction for the difference." },
      { p: "The date defaults to the 1st of the current month for exactly this reason." },
      { h: "Backdating and future-dating both work" },
      { p: "You can record a raise that starts next month, and it will sit there until that month comes around. You can also backdate a correction, and the surrounding records rearrange themselves so no two amounts ever claim the same day." },
      { h: "Somebody with no amount set" },
      { p: "They would be paid zero, so this is one of the few things that stops a run being finalised outright. The Salaries screen shows how many are missing, and the pre-finalise check repeats it." },
    ],
  },
  {
    id: "run",
    title: "Running a month",
    body: [
      { h: "1. Create the run" },
      { p: "Runs → New month. One run per calendar month. Creating it calculates nothing." },
      { h: "2. Recompute" },
      { p: "This reads the schedule and the clock-in log for that month and produces every figure. You can press it as often as you like while the run is a draft — anything you changed by hand is preserved." },
      { h: "3. Check the register" },
      { p: "One row per person. Click any figure to see the exact days behind it. Correct anything that is wrong; every correction asks for a reason and is recorded." },
      { h: "4. Finalise" },
      { p: "This freezes the month. Before it does, you get a checklist of anything still worth looking at. Afterwards, later attendance corrections cannot move the month — which is the point of finalising." },
      { h: "5. Mark paid" },
      { p: "Once the money has gone out. The run becomes read-only for everyone." },
      { p: "A finalised or paid run can be reopened, but it asks for a written reason, because money may already have left the building." },
    ],
  },
  {
    id: "checklist",
    title: "The check before you finalise",
    body: [
      { p: "Freezing a month with a mistake in it turns the mistake into a correction, a conversation, and possibly a wrong bank transfer. The mistakes are always the same handful, and all of them are visible beforehand." },
      { p: "Two kinds of item:" },
      { list: [
        "Marked ! — these stop you. Somebody has no salary and would be paid zero, or the run was never computed so there are no figures to freeze.",
        "Marked ▲ — these warn. Somebody joined and is not on payroll; somebody left with no exit date; days are being deducted with no record behind them. You can finalise anyway, and that decision is recorded with your name against it.",
      ] },
      { p: "Notes marked i are for information only — hand-edited figures, for example. They are expected and never block anything." },
    ],
  },
  {
    id: "figures",
    title: "What each column on the register means",
    body: [
      { table: [
        ["Base", "Their monthly salary, as set on Rates & policy."],
        ["Day rate", "Base ÷ 30. Always 30, whatever the real length of the month."],
        ["Bonus / Deduction", "Anything you added by hand, with a label and a reason."],
        ["Night allowance", "A fixed amount once somebody is rostered on enough night shifts in the month. Counted from the schedule, so extra and double shifts containing a night count too."],
        ["Extra shifts", "Days the schedule marked as extra. Added at the day rate."],
        ["LOP", "Loss of pay. Days the schedule marked unpaid. Deducted at the day rate."],
        ["Half days", "Approved half days. Half the day rate."],
        ["Penalty", "Late arrivals and early clock-outs added up across the whole month, then converted to days through the band ladder on Rates & policy."],
        ["Missed in / Missed out", "Rostered but no clock-in, or no clock-out. Only ever counted on days somebody was actually rostered."],
        ["Pre-joining", "Days this month before their joining date."],
        ["Post-exit", "Days this month after their last working day."],
        ["Unaccounted", "Days with no roster entry and no clock-in. Recorded so you can see the gap, but NOT deducted."],
        ["Net pay", "Everything above, combined. Rounded once, at the end."],
      ] },
    ],
  },
  {
    id: "rules",
    title: "Every rule, and what it costs",
    body: [
      { h: "Night allowance" },
      { p: "Rostered on 21 or more night shifts in a month and you get a fixed amount — ₹1,500 unless you change it on Rates & policy. It is all or nothing: 20 nights pays zero, 21 pays the full amount." },
      { p: "Counted from the schedule, not from clock-outs. Extra shifts and doubles count too, so a double that contains a night shift counts as one night. Click the Night allowance cell on any row to see exactly which days were counted." },
      { h: "Extra shifts and doubles" },
      { p: "A double shift is two shifts in one day. The first is already covered by the monthly salary, so only the second is paid on top — one extra day at the day rate. An EX shift works the same way." },
      { p: "The day count and the resulting amount are both editable: click the Extra shifts cell, see the days behind it, and override the number if the roster was wrong." },
      { h: "Unpaid leave (LOP)" },
      { p: "One full day of pay for each day." },
      { h: "Half days" },
      { p: "Half a day of pay for each one." },
      { h: "Late arrivals and early clock-outs" },
      { p: "Every late minute and every early minute is added up across the whole month, and the total is converted to days using the ladder on Rates & policy:" },
      { table: [
        ["100–120 min", "half a day"],
        ["121–150 min", "1 day"],
        ["151–200 min", "2 days"],
        ["201–250 min", "3 days"],
        ["251–300 min", "4 days"],
        ["301–350 min", "5 days"],
        ["351–400 min", "6 days"],
        ["401–450 min", "7 days"],
        ["451–500 min", "8 days"],
      ] },
      { p: "Under 100 minutes in a month costs nothing — that is deliberate, not a rounding artefact. Above 500 the last band keeps repeating in 50-minute steps, so 501–550 is 9 days and so on. Without that, someone 600 minutes late would pay the same as someone 460 minutes late." },
      { p: "The bands are editable, and the screen refuses to save a ladder with a gap or an overlap in it." },
      { h: "Missed clock-in" },
      { p: "One full day. Only ever counted on a day somebody was actually rostered — and a double expects two clock-ins, so one clock-in on a double day is one miss." },
      { h: "Missed clock-out" },
      { p: "Half a day, once the clock-out window has closed. The window runs from the shift start, not from the clock-in." },
      { h: "Bonuses and deductions" },
      { p: "As many as you like per person, each with its own label, amount and reason. Click the Bonus or Deduction cell on any row to add, see or remove them." },
    ],
  },
  {
    id: "absence",
    title: "Leave, week offs, and days with no record",
    body: [
      { p: "A week off, approved leave, or any other rostered status costs nobody anything and never counts as a missed clock-in. Payroll only expects a clock-in on days the schedule actually assigned a shift. That is why not turning up on your day off is not an absence." },
      { h: "The schedule always wins" },
      { p: "If the schedule says something about a day, that is the answer — even if the clock-in log disagrees. Somebody who clocks in on their week off has still had a week off." },
      { h: "Days nobody recorded" },
      { p: "If a day has no roster entry and no clock-in, payroll records it as unaccounted but does NOT deduct anything for it. A day nobody rostered is not somebody's absence." },
      { p: "It is still shown, because a run of unaccounted days usually means a roster was never published — worth fixing, but not worth charging anybody for. If you ever do want them deducted, set unaccounted_day_multiplier to 1 on Rates & policy." },
      { h: "Nothing after today counts" },
      { p: "Run payroll on the 10th and the figures cover the 1st to the 10th. A shift rostered for the 12th produces no missed clock-in, because nobody can clock in for a day that has not happened yet. The same goes for leave, half days and every other per-day figure." },
      { p: "So a mid-month pay sheet is a running total, and it grows as the month does. The check before finalising warns you if the month is not over yet." },
      { h: "Working a day nobody rostered" },
      { p: "If somebody clocks in on a day with no roster entry, they are never deducted for it. It is flagged as off-roster so you can fix the schedule, but their pay is untouched." },
    ],
  },
  {
    id: "search",
    title: "Finding things",
    body: [
      { p: "The search box takes questions, not just names. Terms combine, so you can narrow as far as you like." },
      { table: [
        ["singh", "anybody whose name or code contains singh"],
        ["lop>=2", "two or more unpaid days"],
        ["net<20000 nights>=21", "combine as many terms as you want"],
        ["flagged:yes", "missed clock-ins, unaccounted days, or repeated lateness"],
        ["overridden:yes", "anything somebody edited by hand"],
        ["joiner:yes", "joined part-way through this month"],
        ["leaver:yes", "left part-way through this month"],
        ["nosalary:yes", "on payroll with no salary set (People screen)"],
      ] },
      { p: "If a term is not understood it is shown back to you as a warning chip rather than quietly ignored — on a payroll screen, a silently dropped filter means a silently wrong total." },
    ],
  },
  {
    id: "trust",
    title: "Why you can trust the numbers",
    body: [
      { list: [
        "Every figure drills down to the individual days behind it.",
        "Every hand edit keeps the original alongside it, so you can always see what the system calculated and what somebody changed it to.",
        "Every change records who, when, and why.",
        "Finalising snapshots the rates that produced the figures, so a payslip from six months ago can still be explained after the rules change.",
        "A finalised month cannot move because somebody edited attendance afterwards.",
      ] },
    ],
  },
  {
    id: "notyet",
    title: "What this does not do yet",
    body: [
      { p: "Stated plainly so nobody assumes otherwise:" },
      { list: [
        "No salary breakdown into basic, HRA and allowances — one base salary per person.",
        "No PF, ESI or TDS calculation.",
        "No payslip PDFs or bank transfer files.",
        "No full and final settlement run for leavers beyond the pro-rated final month.",
        "No arrears: if somebody is added late, their earlier month has to be reopened and recomputed rather than paid as arrears in the next one.",
      ] },
    ],
  },
];

function Guide() {
  const [open, setOpen] = useState(GUIDE[0].id);
  return (
    <div className="pr-stack">
      <div className="pr-panel">
        <div className="pr-panel-head">
          <h2>How payroll works here</h2>
          <span className="sub">Everything this module does, in plain language.</span>
        </div>
        <div className="pr-panel-body">
          <div className="pr-guide-nav">
            {GUIDE.map((sec) => (
              <button key={sec.id} type="button"
                      className={"pr-guide-chip" + (open === sec.id ? " on" : "")}
                      onClick={() => setOpen(sec.id)}>
                {sec.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {GUIDE.filter((sec) => sec.id === open).map((sec) => (
        <div className="pr-panel" key={sec.id}>
          <div className="pr-panel-head"><h2>{sec.title}</h2></div>
          <div className="pr-panel-body pr-guide">
            {sec.body.map((b, i) => {
              if (b.h) return <h4 className="pr-guide-h" key={i}>{b.h}</h4>;
              if (b.p) return <p key={i}>{b.p}</p>;
              if (b.list) {
                return (
                  <ul key={i}>
                    {b.list.map((li, j) => <li key={j}>{li}</li>)}
                  </ul>
                );
              }
              if (b.table) {
                return (
                  <div className="pr-scroller" key={i}>
                    <table className="pr-guide-t">
                      <tbody>
                        {b.table.map(([k, v], j) => (
                          <tr key={j}>
                            <th scope="row">{k}</th>
                            <td>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PEOPLE — the enrolment roster, and who is left to decide on
   ══════════════════════════════════════════════════════════ */

/** A small bar of evidence. Reads at a glance; the numbers are in the title. */
function Evidence({ schedule, clockins, lastSeen }) {
  const total = schedule + clockins;
  // Capped at 40 so one very active person does not flatten everyone else.
  const width = Math.min(100, Math.round((total / 40) * 100));
  return (
    <span className="pr-ev" title={`${schedule} rostered day(s), ${clockins} day(s) clocked in${lastSeen ? `, last seen ${lastSeen}` : ""}`}>
      <span className="pr-ev-bar"><span className="pr-ev-fill" style={{ width: `${width}%` }} /></span>
      <span className="pr-ev-n">{total || "—"}</span>
    </span>
  );
}

function CandidateTable({ rows, picked, onToggle, onToggleAll, busy }) {
  const selectable = rows.filter((r) => !r.blocked);
  const allPicked = selectable.length > 0 && selectable.every((r) => picked.has(r.user_id));

  return (
    <div className="pr-scroller">
      <table className="pr-table pr-table-people">
        <thead>
          <tr>
            <th style={{ width: 34 }}>
              <input type="checkbox" checked={allPicked} disabled={busy || !selectable.length}
                     onChange={() => onToggleAll(!allPicked)}
                     aria-label="Select everyone on this page" />
            </th>
            <th style={{ textAlign: "left" }}><span className="pr-lbl">Person</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Rostered</span><span className="pr-src pr-src-sch">Schedule</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Clocked in</span><span className="pr-src pr-src-clk">Clock-in</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Activity</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Last seen</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.user_id} className={r.blocked ? "pr-row-blocked" : ""}>
              <td>
                <input type="checkbox" disabled={!!r.blocked || busy}
                       checked={picked.has(r.user_id)}
                       onChange={() => onToggle(r.user_id)}
                       aria-label={`Enrol ${r.name}`} />
              </td>
              <td>
                <span className="pr-emp">
                  <span className="pr-emp-n">
                    {r.name}
                    {/* They were on payroll before and left. Adding them back
                        reactivates the same record and clears the exit date. */}
                    {r.returning && (
                      <span className="pr-chipj"
                            title={r.previously_exited_on
                              ? `Was on payroll until ${r.previously_exited_on}. Adding them clears that exit date.`
                              : "Was on payroll before."}>
                        returning{r.previously_exited_on ? ` · left ${shortDate(r.previously_exited_on)}` : ""}
                      </span>
                    )}
                    {!r.looks_active && <span className="pr-chipn">no activity</span>}
                    {!r.has_employee_record && <span className="pr-chipn">not schedulable</span>}
                    {r.is_deleted && <span className="pr-chipn">deleted</span>}
                  </span>
                  <span className="pr-emp-i">
                    {r.employee_unique_id || "no account number"}
                    {r.role_id != null && ` · role ${r.role_id}`}
                  </span>
                  {r.blocked && <span className="pr-blocked">{r.blocked.message}</span>}
                </span>
              </td>
              <td className="pr-numcell">{r.schedule_days || "—"}</td>
              <td className="pr-numcell">{r.clockin_days || "—"}</td>
              <td className="pr-numcell">
                <Evidence schedule={r.schedule_days} clockins={r.clockin_days} lastSeen={r.last_seen} />
              </td>
              <td className="pr-numcell pr-dim">{r.last_seen ? shortDate(r.last_seen) : "never"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RosterTable({ rows, onExit, onRemove, busy }) {
  return (
    <div className="pr-scroller">
      <table className="pr-table pr-table-people">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}><span className="pr-lbl">Person</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Base salary</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Joined</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Status</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.employee_unique_id}>
              <td>
                <span className="pr-emp">
                  <span className="pr-emp-n">
                    {r.name}
                    {r.drift && (
                      <span className="pr-chipd" title={r.drift === "no_source_row"
                        ? "The user record behind this person has gone. Their attendance may not be found."
                        : "Their account number has changed since enrolment, so attendance may be read for somebody else."}>
                        identity drift
                      </span>
                    )}
                    {r.is_deleted && <span className="pr-chipn">deleted upstream</span>}
                  </span>
                  <span className="pr-emp-i">{r.employee_unique_id}{r.role_id != null && ` · role ${r.role_id}`}</span>
                </span>
              </td>
              <td className="pr-numcell">
                {r.base_salary == null
                  ? <span className="pr-chipw" title="They would be paid on zero. Set a salary before finalising.">no salary</span>
                  : money0(r.base_salary)}
              </td>
              <td className="pr-numcell pr-dim">{r.joined_on ? shortDate(r.joined_on) : "—"}</td>
              <td className="pr-numcell">
                {r.exited_on ? (
                  <>
                    <span className="pr-chipn" title={`Paid up to ${r.exited_on}`}>
                      left {shortDate(r.exited_on)}
                    </span>
                    {/* Where the date came from. A guess off the clock-in log
                        must never read like a confirmed fact. */}
                    {r.exit_source === "LAST_ACTIVITY" && (
                      <span className="pr-chipw"
                            title="Inferred from their last clock-in because no exit date was recorded. Confirm it before finalising.">
                        inferred
                      </span>
                    )}
                    {r.exit_source === "SCHEDULED_DELETION" && (
                      <span className="pr-chipn" title="Taken from the account deletion HR scheduled.">
                        from offboarding
                      </span>
                    )}
                  </>
                ) : (
                  <span className="pr-chipa">active</span>
                )}
              </td>
              <td className="pr-numcell">
                <span className="pr-rowacts">
                  <button className="pr-btn pr-btn-sm" disabled={busy} type="button"
                          onClick={() => onExit({ uid: r.employee_unique_id, name: r.name, exited_on: r.exited_on || "" })}>
                    {r.exited_on ? "Change exit" : "Set exit date"}
                  </button>
                  <button className="pr-btn pr-btn-sm pr-btn-danger" disabled={busy} type="button"
                          onClick={() => onRemove(r)}
                          title="Enrolled by mistake? This removes them from future runs. Finalised months are untouched.">
                    Remove
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * What changed since you last looked.
 *
 * This is the answer to "how do I know somebody joined?" — you do not go and
 * check, it tells you. Joiners come from the joining date and from first
 * activity; exits come from the offboarding HR already scheduled.
 */
function NeedsAttention({ review, onAddAll, onApplyExits, onOpenCandidates, onSetExit, busy }) {
  if (!review) return null;
  const joiners = review.new_candidates || [];
  const exits = review.exits_proposed || [];
  const quiet = review.gone_quiet || [];
  const drift = review.identity_drift || [];

  if (!joiners.length && !exits.length && !quiet.length && !drift.length) {
    return (
      <div className="pr-panel">
        <div className="pr-panel-head">
          <h2>Needs attention</h2>
          <span className="sub">Nothing outstanding.</span>
        </div>
        <div className="pr-panel-body">
          <p className="pr-hint">
            Everybody who works here is on payroll, and everybody who has left has an exit date.
            New joiners and leavers appear here on their own — you do not have to come looking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-panel pr-panel-attn">
      <div className="pr-panel-head">
        <h2>Needs attention</h2>
        <span className="sub">Found by watching your data. Nothing here needs hunting for.</span>
      </div>

      {joiners.length > 0 && (
        <div className="pr-attn">
          <div className="pr-attn-h">
            <span className="pr-attn-n">{joiners.length}</span>
            <span className="pr-attn-t">
              <strong>{joiners.length === 1 ? "New person" : "New people"} not on payroll</strong>
              <span className="pr-hint"> — they would be paid nothing this month.</span>
            </span>
            <span className="pr-attn-acts">
              <button className="pr-btn pr-btn-sm" onClick={onOpenCandidates} type="button">Review</button>
              <button className="pr-btn pr-btn-sm pr-btn-primary" onClick={onAddAll}
                      disabled={busy} type="button">
                Add all {joiners.length}
              </button>
            </span>
          </div>
          <div className="pr-attn-list">
            {joiners.slice(0, 6).map((j) => (
              <span className="pr-attn-item" key={j.user_id}>
                {j.name}
                <span className="pr-dim">
                  {j.why === "joined_recently" && j.joined_on
                    ? " · joined " + shortDate(j.joined_on)
                    : " · " + j.activity_days + " day(s) of activity"}
                </span>
              </span>
            ))}
            {joiners.length > 6 && (
              <span className="pr-attn-item pr-dim">+{joiners.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {exits.length > 0 && (
        <div className="pr-attn">
          <div className="pr-attn-h">
            <span className="pr-attn-n">{exits.length}</span>
            <span className="pr-attn-t">
              <strong>{exits.length === 1 ? "Person has" : "People have"} an offboarding date</strong>
              <span className="pr-hint"> — read from the account deletion HR already scheduled.
                Payroll pays them up to that date and then stops.</span>
            </span>
            <span className="pr-attn-acts">
              <button className="pr-btn pr-btn-sm pr-btn-primary" onClick={onApplyExits}
                      disabled={busy} type="button">
                Apply {exits.length} exit date{exits.length === 1 ? "" : "s"}
              </button>
            </span>
          </div>
          <div className="pr-attn-list">
            {exits.slice(0, 6).map((x) => (
              <span className="pr-attn-item" key={x.employee_unique_id}>
                {x.name}
                <span className="pr-dim"> · leaves {shortDate(x.proposed_exit)}</span>
              </span>
            ))}
            {exits.length > 6 && (
              <span className="pr-attn-item pr-dim">+{exits.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {quiet.length > 0 && (
        <div className="pr-attn">
          <div className="pr-attn-h">
            <span className="pr-attn-n pr-attn-n-warn">{quiet.length}</span>
            <span className="pr-attn-t">
              <strong>{quiet.length === 1 ? "Person looks gone" : "People look gone"}, with no date recorded</strong>
              <span className="pr-hint"> — the account was deleted without a scheduled date, so the
                only clue is when they last worked. Confirm each one: payroll will not guess
                somebody&apos;s final salary.</span>
            </span>
          </div>
          <div className="pr-attn-rows">
            {quiet.slice(0, 8).map((q) => (
              <div className="pr-attn-row" key={q.employee_unique_id}>
                <span>
                  {q.name}
                  <span className="pr-dim">
                    {" · "}
                    {q.reason === "source_row_missing" ? "account removed"
                      : q.reason === "deleted_upstream" ? "account deleted"
                      : "no activity"}
                    {q.suggested_exit ? " · last worked " + shortDate(q.suggested_exit) : " · never seen"}
                  </span>
                </span>
                <button className="pr-btn pr-btn-sm" disabled={busy} type="button"
                        onClick={() => onSetExit({
                          uid: q.employee_unique_id,
                          name: q.name,
                          exited_on: q.suggested_exit || "",
                        })}>
                  {q.suggested_exit ? "Set " + shortDate(q.suggested_exit) : "Set exit date"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {drift.length > 0 && (
        <div className="pr-attn">
          <div className="pr-attn-h">
            <span className="pr-attn-n pr-attn-n-bad">{drift.length}</span>
            <span className="pr-attn-t">
              <strong>Identity no longer matches</strong>
              <span className="pr-hint"> — their account number changed after they were added, so
                payroll may be reading somebody else&apos;s attendance. Worth fixing before you
                finalise.</span>
            </span>
          </div>
          <div className="pr-attn-list">
            {drift.slice(0, 6).map((d) => (
              <span className="pr-attn-item" key={d.employee_unique_id}>
                {d.display_name}
                <span className="pr-dim">
                  {" · "}{d.reason === "no_source_row" ? "user record gone" : "account number changed"}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The pre-finalise check.
 *
 * Finalising freezes the month, so this is the last chance to catch a missing
 * joiner, a missing exit date or a zero salary before it becomes a correction
 * and a conversation. Blocking items cannot be waved through; warnings can, and
 * doing so is recorded against your name.
 */
function ChecklistModal({ checklist, onClose, onFinalise, busy }) {
  if (!checklist) return null;
  const blocking = (checklist.items || []).filter((i) => i.severity === "blocking");
  const warnings = (checklist.items || []).filter((i) => i.severity === "warning");
  const infos = (checklist.items || []).filter((i) => i.severity === "info");
  const canGo = checklist.can_finalise;

  return (
    <>
      <div className="pr-scrim on" onClick={onClose} />
      <div className="pr-modal pr-modal-wide" role="dialog" aria-modal="true" aria-label="Before finalising">
        <div className="pr-mo-head">
          <h3>Before you finalise</h3>
          <p className="sub">
            Finalising freezes every figure in this month. These are the things still worth a look.
          </p>
        </div>

        <div className="pr-mo-body">
          {(checklist.items || []).length === 0 ? (
            <div className="pr-chk-ok">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Everything checks out.</strong>
                <p className="pr-hint">
                  Everyone who worked is on payroll, everyone who left has an exit date, and every
                  person has a salary.
                </p>
              </div>
            </div>
          ) : (
            <div className="pr-chk">
              {[...blocking, ...warnings, ...infos].map((i) => (
                <div className={"pr-chk-i pr-chk-" + i.severity} key={i.key}>
                  <span className="pr-chk-b" aria-hidden="true">
                    {i.severity === "blocking" ? "!" : i.severity === "warning" ? "▲" : "i"}
                  </span>
                  <div>
                    <strong>{i.title}</strong>
                    <p className="pr-hint">{i.detail}</p>
                    {i.action && <p className="pr-chk-a">{i.action}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!canGo && (
            <p className="pr-hint" style={{ marginTop: 12 }}>
              The items marked <strong>!</strong> have to be fixed first — finalising with those
              unresolved would pay somebody the wrong amount.
            </p>
          )}
        </div>

        <div className="pr-mo-foot">
          <button className="pr-btn" onClick={onClose} disabled={busy} type="button">
            {canGo ? "Not yet" : "Close"}
          </button>
          {canGo && (
            <button className="pr-btn pr-btn-primary" onClick={onFinalise} disabled={busy} type="button">
              {busy ? "Finalising…"
                : warnings.length ? "Finalise anyway (" + warnings.length + " unresolved)"
                : "Finalise run"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   SALARIES — one amount per person, dated, and never overwritten
   ══════════════════════════════════════════════════════════ */

/**
 * Everybody is paid a different amount, and what they were paid last March has
 * to still be answerable next year.
 *
 * So a salary is not a field you overwrite. It is a row with a start date, and
 * setting a new one closes the old one the day before. Payroll for March reads
 * whatever was in force in March, which means a raise applied today can never
 * silently rewrite a month you have already paid.
 *
 * Everything is edited locally and saved in one batch, because giving fifty
 * people a raise one save at a time is not a workflow.
 */
function SalaryTable({ rows, edits, onEdit, onHistory, busy }) {
  return (
    <div className="pr-scroller">
      <table className="pr-table pr-table-people">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}><span className="pr-lbl">Employee</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">Current</span><span className="pr-src pr-src-man">In force now</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">In force since</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">New amount</span><span className="pr-src pr-src-man">Leave blank to keep</span></th>
            <th style={{ textAlign: "right" }}><span className="pr-lbl">History</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const uid = r.employee_unique_id;
            const current = r.base_salary == null ? null : Number(r.base_salary);
            const typed = edits[uid];
            const next = typed === undefined || typed === "" ? null : Number(typed);
            const changed = next !== null && Number.isFinite(next) && next !== current;
            const invalid = typed !== undefined && typed !== "" && (!Number.isFinite(next) || next < 0);

            return (
              <tr key={uid} className={changed ? "pr-row-changed" : ""}>
                <td>
                  <span className="pr-emp">
                    <span className="pr-emp-n">{r.employee_name}</span>
                    <span className="pr-emp-i">{uid}{r.role_id != null ? " · role " + r.role_id : ""}</span>
                  </span>
                </td>
                <td className="pr-numcell">
                  {current == null
                    ? <span className="pr-chipw" title="They would be paid zero. Set an amount.">not set</span>
                    : money0(current)}
                </td>
                <td className="pr-numcell pr-dim">
                  {r.effective_from ? shortDate(r.effective_from) : "—"}
                </td>
                <td className="pr-numcell">
                  <input
                    className={"pr-input pr-input-sal" + (invalid ? " bad" : "")}
                    type="number" min="0" step="100" inputMode="numeric"
                    disabled={busy}
                    value={typed ?? ""}
                    placeholder={current == null ? "set" : String(current)}
                    onChange={(e) => onEdit(uid, e.target.value)}
                    aria-label={"New salary for " + r.employee_name}
                  />
                  {changed && current != null && (
                    <span className={"pr-delta " + (next > current ? "pr-credit" : "pr-debit")}>
                      {next > current ? "+" : "−"}{money0(Math.abs(next - current))}
                    </span>
                  )}
                </td>
                <td className="pr-numcell">
                  <button className="pr-btn pr-btn-sm" type="button" onClick={() => onHistory(r)}>
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Every salary this person has ever been on, newest first. */
function SalaryHistory({ person, rows, onClose }) {
  if (!person) return null;
  return (
    <>
      <div className="pr-scrim on" onClick={onClose} />
      <div className="pr-modal pr-modal-wide" role="dialog" aria-modal="true" aria-label="Salary history">
        <div className="pr-mo-head">
          <h3>{person.employee_name}</h3>
          <p className="sub">
            Every salary this person has been on. Payroll for any month reads whatever was in force
            that month, so past runs never change when you set a new amount.
          </p>
        </div>
        <div className="pr-mo-body">
          {rows === null ? (
            <div className="pr-skel" />
          ) : rows.length === 0 ? (
            <p className="pr-hint">No salary has ever been set for this person.</p>
          ) : (
            <div className="pr-scroller">
              <table className="pr-list">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h, i) => (
                    <tr key={h.id}>
                      <td className="pr-num">{h.effective_from}</td>
                      <td className="pr-num pr-dim">
                        {h.effective_to || (i === 0 ? "current" : "—")}
                      </td>
                      <td className="pr-num" style={{ textAlign: "right", fontWeight: 600 }}>
                        {money0(h.base_salary)}
                      </td>
                      <td className="pr-dim">{h.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="pr-mo-foot">
          <button className="pr-btn" onClick={onClose} type="button">Close</button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PENALTY LADDER — minutes late/early converted to days
   ══════════════════════════════════════════════════════════ */

/**
 * The bands are deliberately uneven, so this cannot be a single number.
 *
 * Edited as a whole ladder rather than row by row: a half-saved ladder can
 * leave a number of minutes matching two bands or none, and either way
 * somebody's deduction quietly becomes whichever row came back first.
 */
function PenaltySlabs({ slabs, onChange, onSave, onReset, dirty, busy, locked }) {
  const set = (i, key, value) =>
    onChange(slabs.map((s, j) => (j === i ? { ...s, [key]: value } : s)));

  const addBand = () => {
    const last = slabs[slabs.length - 1];
    const from = last ? Number(last.max_minutes || last.min_minutes) + 1 : 100;
    onChange([...slabs, { min_minutes: from, max_minutes: from + 49, deduction_days: "" }]);
  };

  // The same checks the server enforces, run as you type so a bad ladder is
  // visible before you press save rather than after.
  const problems = [];
  const sorted = [...slabs].sort((a, b) => Number(a.min_minutes) - Number(b.min_minutes));
  sorted.forEach((s, i) => {
    const min = Number(s.min_minutes);
    const max = s.max_minutes === "" || s.max_minutes === null ? null : Number(s.max_minutes);
    const days = Number(s.deduction_days);
    if (!Number.isFinite(min) || min < 0) problems.push(`Band ${i + 1}: "from" must be 0 or more.`);
    if (max !== null && (!Number.isFinite(max) || max < min)) {
      problems.push(`Band ${i + 1}: "to" must be blank or at least ${min}.`);
    }
    if (!Number.isFinite(days) || days < 0) problems.push(`Band ${i + 1}: days must be a number.`);
    const next = sorted[i + 1];
    if (next && max !== null) {
      const nextMin = Number(next.min_minutes);
      if (nextMin <= max) problems.push(`Bands overlap at ${nextMin} minutes.`);
      else if (nextMin > max + 1) problems.push(`Nothing covers ${max + 1}–${nextMin - 1} minutes.`);
    }
    if (max === null && next) problems.push("An open-ended band must be the last one.");
  });

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return (
    <div className="pr-panel">
      <div className="pr-panel-head">
        <h2>Late and early minutes</h2>
        <span className="sub">
          Late arrivals and early clock-outs are added up across the whole month, then converted to
          days using this ladder.
        </span>
      </div>

      <div className="pr-panel-body">
        <p className="pr-hint">
          {first
            ? <>Anything under <strong>{first.min_minutes} minutes</strong> in a month costs nothing.
              That is what the first band is for — a few minutes here and there is free, on purpose.</>
            : "No bands yet."}
          {last && last.max_minutes
            ? <> Above <strong>{last.max_minutes} minutes</strong> the last band keeps repeating, so a
              worse month is never cheaper than a better one.</>
            : null}
        </p>
      </div>

      <div className="pr-scroller">
        <table className="pr-table pr-table-people">
          <thead>
            <tr>
              <th style={{ textAlign: "right" }}><span className="pr-lbl">From (min)</span></th>
              <th style={{ textAlign: "right" }}><span className="pr-lbl">To (min)</span></th>
              <th style={{ textAlign: "right" }}><span className="pr-lbl">Days deducted</span></th>
              <th style={{ textAlign: "left" }}><span className="pr-lbl">Reads as</span></th>
              <th />
            </tr>
          </thead>
          <tbody>
            {slabs.map((s, i) => (
              <tr key={i}>
                <td className="pr-numcell">
                  <input className="pr-input pr-input-sal" type="number" min="0" disabled={busy || locked}
                         value={s.min_minutes ?? ""}
                         onChange={(e) => set(i, "min_minutes", e.target.value)}
                         aria-label={`Band ${i + 1} from`} />
                </td>
                <td className="pr-numcell">
                  <input className="pr-input pr-input-sal" type="number" min="0" disabled={busy || locked}
                         value={s.max_minutes ?? ""} placeholder="open"
                         onChange={(e) => set(i, "max_minutes", e.target.value)}
                         aria-label={`Band ${i + 1} to`} />
                </td>
                <td className="pr-numcell">
                  <input className="pr-input pr-input-sal" type="number" min="0" step="0.5" disabled={busy || locked}
                         value={s.deduction_days ?? ""}
                         onChange={(e) => set(i, "deduction_days", e.target.value)}
                         aria-label={`Band ${i + 1} days`} />
                </td>
                <td className="pr-dim" style={{ fontSize: 12 }}>
                  {s.min_minutes !== "" && s.deduction_days !== ""
                    ? `${s.min_minutes}–${s.max_minutes === "" || s.max_minutes === null ? "any" : s.max_minutes} minutes late in a month costs ${s.deduction_days} day${Number(s.deduction_days) === 1 ? "" : "s"} of pay`
                    : "—"}
                </td>
                <td className="pr-numcell">
                  <button className="pr-btn pr-btn-sm pr-btn-danger" type="button" disabled={busy || locked}
                          onClick={() => onChange(slabs.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pr-panel-body">
        {problems.length > 0 && (
          <Notice kind="bad">
            {problems.slice(0, 3).join(" ")}
            {problems.length > 3 ? ` (+${problems.length - 3} more)` : ""}
          </Notice>
        )}
        <div className={"pr-bulkbar pr-bulkbar-sticky" + (dirty ? " on" : "")}>
          <span className="pr-hint">
            {dirty ? "Unsaved changes to the ladder." : "Saved. Recompute a draft run to apply it."}
          </span>
          <span className="pr-bulkacts">
            <button className="pr-btn" onClick={addBand} disabled={busy || locked} type="button">
              Add band
            </button>
            {dirty && (
              <button className="pr-btn" onClick={onReset} disabled={busy} type="button">Discard</button>
            )}
            <button className="pr-btn pr-btn-primary" onClick={onSave}
                    disabled={busy || locked || !dirty || problems.length > 0} type="button">
              {busy ? "Saving…" : "Save ladder"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DRAWER — breakdown, drill-down, override, adjustments
   ══════════════════════════════════════════════════════════ */
const FIELD_LABELS = {
  extra_shifts: "Extra shifts",
  lop_days: "Unpaid leave (LOP)",
  half_days: "Half days",
  penalty_days: "Penalty days",
  missed_clockin: "Missed clock-in",
  missed_clockout: "Missed clock-out",
  night_shifts: "Night shifts",
  pre_joining_days: "Days before joining",
  post_exit_days: "Days after leaving",
  unaccounted_days: "Unaccounted days",
};

// Two of these figures answer a question the register cannot ask on its own.
const FIELD_NOTES = {
  pre_joining_days:
    "Days in this month that fall before the employee's joining date. Pay starts on the joining date; the earlier days are deducted and nothing else is expected of them.",
  post_exit_days:
    "Days in this month that fall after the employee's last day. Pay stops on the exit date; the later days are deducted, exactly as the days before a joining date are.",
  unaccounted_days:
    "Days with no roster entry and no clock-in. They are recorded so a gap in the roster is visible, but they are not deducted — a day nobody rostered is not somebody's absence. A week off, leave, or any other rostered status never appears here.",
};

function LineDrawer({ open, lineId, field, locked, onClose, onChanged }) {
  const [line, setLine] = useState(null);
  const [trace, setTrace] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ovrValue, setOvrValue] = useState("");
  const [ovrReason, setOvrReason] = useState("");
  const [adj, setAdj] = useState({ label: "", source: "", amount: "" });

  const isFigure = Boolean(FIELD_LABELS[field]);

  const load = useCallback(async () => {
    if (!lineId) return;
    setBusy(true); setErr(null);
    try {
      const [lineRes, traceRes] = await Promise.all([
        api.get(`/lines/${lineId}`),
        isFigure ? api.get(`/lines/${lineId}/trace`, { params: { field } }) : Promise.resolve(null),
      ]);
      setLine(lineRes.data.data);
      setTrace(traceRes?.data || null);
      if (isFigure) setOvrValue(String(lineRes.data.data[field]?.effective ?? ""));
      setOvrReason("");
    } catch (e) {
      setErr(errText(e, "Could not load this line."));
    } finally {
      setBusy(false);
    }
  }, [lineId, field, isFigure]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const saveOverride = async () => {
    setBusy(true); setErr(null);
    try {
      await api.put(`/lines/${lineId}/override`, {
        field, value: Number(ovrValue), reason: ovrReason.trim(),
      });
      await load(); onChanged?.();
    } catch (e) { setErr(errText(e, "Could not save the override.")); }
    finally { setBusy(false); }
  };

  const revert = async () => {
    setBusy(true); setErr(null);
    try {
      await api.delete(`/lines/${lineId}/override/${field}`);
      await load(); onChanged?.();
    } catch (e) { setErr(errText(e, "Could not revert.")); }
    finally { setBusy(false); }
  };

  const addAdj = async () => {
    setBusy(true); setErr(null);
    try {
      // Derived from which column was opened, not carried in state — otherwise
      // opening Deductions after Bonus could post the wrong kind.
      await api.post(`/lines/${lineId}/adjustments`, {
        kind: field === "bonus" ? "BONUS" : "DEDUCTION",
        label: adj.label.trim(),
        source: adj.source.trim() || undefined,
        amount: Number(adj.amount),
      });
      setAdj({ label: "", source: "", amount: "" });
      await load(); onChanged?.();
    } catch (e) { setErr(errText(e, "Could not add the line item.")); }
    finally { setBusy(false); }
  };

  const removeAdj = async (id) => {
    setBusy(true); setErr(null);
    try {
      await api.delete(`/adjustments/${id}`);
      await load(); onChanged?.();
    } catch (e) { setErr(errText(e, "Could not remove the line item.")); }
    finally { setBusy(false); }
  };

  const isAdjView = field === "bonus" || field === "deduction";
  const overridden = isFigure && line?.[field]?.overridden;

  return (
    <>
      <div className={`pr-scrim${open ? " on" : ""}`} onClick={onClose} />
      <aside className={`pr-drawer${open ? " on" : ""}`} role="dialog" aria-modal="true" aria-label="Line detail">
        <div className="pr-dr-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3>{isAdjView ? (field === "bonus" ? "Bonus" : "Deductions")
                 : isFigure ? FIELD_LABELS[field] : line?.employee_name || "Line"}</h3>
            <div className="sub">
              {line ? `${line.employee_name} · ${line.employee_unique_id}` : "Loading…"}
            </div>
          </div>
          <button className="pr-btn pr-btn-sm" onClick={onClose} aria-label="Close" type="button">✕</button>
        </div>

        <div className="pr-dr-body">
          {err && <Notice kind="bad" onClose={() => setErr(null)}>{err}</Notice>}
          {!line ? (
            <><div className="pr-skel" /><div className="pr-skel" /><div className="pr-skel" /></>
          ) : (
            <>
              {/* The whole formula, term by term, with the arithmetic shown. */}
              {(field === "net" || !field) && (
                <div className="pr-sec">
                  <table className="pr-calc">
                    <tbody>
                      <tr><td>Base salary</td><td>{money0(line.base_salary)} ÷ 30</td><td>{money(line.base_salary)}</td></tr>
                      <tr><td>Bonus</td><td>{line.adjustments.filter(a=>a.kind==="BONUS").length} item(s)</td>
                          <td className={line.bonus_total ? "pr-credit" : "pr-dim"}>{line.bonus_total ? `+${money(line.bonus_total)}` : "—"}</td></tr>
                      <tr><td>Deductions</td><td>{line.adjustments.filter(a=>a.kind==="DEDUCTION").length} item(s)</td>
                          <td className={line.deduction_total ? "pr-debit" : "pr-dim"}>{line.deduction_total ? `−${money(line.deduction_total)}` : "—"}</td></tr>
                      <tr><td>Night allowance</td><td>{line.night_shifts.effective} night shifts</td>
                          <td className={line.night_allowance ? "pr-credit" : "pr-dim"}>{line.night_allowance ? `+${money(line.night_allowance)}` : "—"}</td></tr>
                      <tr><td>Extra shifts</td><td>{line.extra_shifts.effective} × {Number(line.day_rate).toFixed(2)}</td>
                          <td className={line.money.credit_extra_shifts ? "pr-credit" : "pr-dim"}>{line.money.credit_extra_shifts ? `+${money(line.money.credit_extra_shifts)}` : "—"}</td></tr>
                      <tr><td>Unpaid leave</td><td>{line.lop_days.effective} × {Number(line.day_rate).toFixed(2)}</td>
                          <td className={line.money.debit_lop ? "pr-debit" : "pr-dim"}>{line.money.debit_lop ? `−${money(line.money.debit_lop)}` : "—"}</td></tr>
                      <tr><td>Half days</td><td>{line.half_days.effective} × {(Number(line.day_rate)/2).toFixed(2)}</td>
                          <td className={line.money.debit_half_days ? "pr-debit" : "pr-dim"}>{line.money.debit_half_days ? `−${money(line.money.debit_half_days)}` : "—"}</td></tr>
                      <tr><td>Penalty</td><td>{line.penalty_days.effective} d ({line.penalty_days.minutes}m)</td>
                          <td className={line.money.debit_penalty ? "pr-debit" : "pr-dim"}>{line.money.debit_penalty ? `−${money(line.money.debit_penalty)}` : "—"}</td></tr>
                      <tr><td>Missed clock-in</td><td>{line.missed_clockin.effective} × {Number(line.day_rate).toFixed(2)}</td>
                          <td className={line.money.debit_missed_clockin ? "pr-debit" : "pr-dim"}>{line.money.debit_missed_clockin ? `−${money(line.money.debit_missed_clockin)}` : "—"}</td></tr>
                      <tr><td>Missed clock-out</td><td>{line.missed_clockout.effective} × {(Number(line.day_rate)/2).toFixed(2)}</td>
                          <td className={line.money.debit_missed_clockout ? "pr-debit" : "pr-dim"}>{line.money.debit_missed_clockout ? `−${money(line.money.debit_missed_clockout)}` : "—"}</td></tr>
                      <tr><td>Before joining</td>
                          <td>{line.joined_on ? `${line.pre_joining_days.effective} × ${Number(line.day_rate).toFixed(2)} · joined ${shortDate(line.joined_on)}` : "no joining date on record"}</td>
                          <td className={line.money.debit_pre_joining ? "pr-debit" : "pr-dim"}>{line.money.debit_pre_joining ? `−${money(line.money.debit_pre_joining)}` : "—"}</td></tr>
                      <tr><td>After leaving</td>
                          <td>{line.exited_on ? `${line.post_exit_days.effective} × ${Number(line.day_rate).toFixed(2)} · left ${shortDate(line.exited_on)}` : "still employed"}</td>
                          <td className={line.money.debit_post_exit ? "pr-debit" : "pr-dim"}>{line.money.debit_post_exit ? `−${money(line.money.debit_post_exit)}` : "—"}</td></tr>
                      <tr><td>Unaccounted</td><td>{line.unaccounted_days.effective} × {Number(line.day_rate).toFixed(2)}</td>
                          <td className={line.money.debit_unaccounted ? "pr-debit" : "pr-dim"}>{line.money.debit_unaccounted ? `−${money(line.money.debit_unaccounted)}` : "—"}</td></tr>
                      <tr className="total"><td>Net pay</td><td /><td>{money(line.net_pay)}</td></tr>
                    </tbody>
                  </table>
                  <p className="pr-hint" style={{ marginTop: 9 }}>
                    Rounding is applied once, to the net figure only.
                  </p>
                </div>
              )}

              {/* The days behind one figure. */}
              {isFigure && (
                <>
                  <div className="pr-sec">
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 11 }}>
                      <span className="pr-num" style={{ fontSize: 26, letterSpacing: "-.02em" }}>
                        {line[field].effective}
                      </span>
                      <span className="pr-dim" style={{ fontSize: 12.5 }}>
                        {overridden ? `overridden · system computed ${line[field].computed}` : "as computed"}
                      </span>
                    </div>
                    {FIELD_NOTES[field] && (
                      <p className="pr-hint" style={{ margin: "0 0 11px" }}>{FIELD_NOTES[field]}</p>
                    )}
                    {trace?.data?.length ? (
                      <div className="pr-trace">
                        {trace.data.map((d, i) => (
                          <div className="pr-trace-row" key={i}>
                            <span className="pr-trace-d">{String(d.work_date).slice(5)}</span>
                            <span className="pr-trace-t">{d.detail}</span>
                            <span className="pr-trace-v">{d.minutes != null ? `${d.minutes}m` : d.quantity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pr-trace">
                        <div className="pr-trace-row skip">
                          <span className="pr-trace-t">Nothing recorded for this month.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pr-sec">
                    <span className="pr-lbl">Override</span>
                    {locked ? (
                      <p className="pr-hint">This run is locked. Reopen it as a draft to make changes.</p>
                    ) : (
                      <>
                        <div className="pr-grid2">
                          <label className="pr-field">
                            <span className="pr-lbl">Value</span>
                            <input className="pr-input" type="number" step="0.5" min="0"
                                   value={ovrValue} onChange={(e) => setOvrValue(e.target.value)} />
                          </label>
                          <label className="pr-field">
                            <span className="pr-lbl">Reason (required)</span>
                            <input className="pr-input pr-input-text" value={ovrReason}
                                   onChange={(e) => setOvrReason(e.target.value)}
                                   placeholder="Why is this being changed?" />
                          </label>
                        </div>
                        <p className="pr-hint" style={{ marginTop: 8 }}>
                          The computed figure is kept alongside your value — both appear in the audit trail.
                        </p>
                        <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                          {overridden && (
                            <button className="pr-btn" onClick={revert} disabled={busy} type="button">
                              Revert to computed
                            </button>
                          )}
                          <button className="pr-btn pr-btn-primary" onClick={saveOverride}
                                  disabled={busy || !ovrReason.trim()} type="button">
                            {busy ? "Saving…" : "Save override"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Bonus / deduction line items. */}
              {isAdjView && (
                <>
                  <div className="pr-sec">
                    {line.adjustments.filter((a) => a.kind === (field === "bonus" ? "BONUS" : "DEDUCTION")).length === 0 ? (
                      <p className="pr-hint">No line items yet.</p>
                    ) : line.adjustments
                        .filter((a) => a.kind === (field === "bonus" ? "BONUS" : "DEDUCTION"))
                        .map((a) => (
                          <div className="pr-li" key={a.id}>
                            <div className="pr-li-m">
                              <div className="pr-li-l">{a.label}</div>
                              <div className="pr-li-s">{a.source || "—"}{a.created_by_name ? ` · ${a.created_by_name}` : ""}</div>
                            </div>
                            <span className={`pr-num ${field === "bonus" ? "pr-credit" : "pr-debit"}`}>
                              {field === "bonus" ? "+" : "−"}{money(a.amount)}
                            </span>
                            {!locked && (
                              <button className="pr-btn pr-btn-sm" onClick={() => removeAdj(a.id)}
                                      disabled={busy} aria-label="Remove" type="button">✕</button>
                            )}
                          </div>
                        ))}
                    <div className="pr-li" style={{ borderTop: "1px solid var(--ink)", borderBottom: "3px double var(--ink)", marginTop: 4 }}>
                      <div className="pr-li-m"><div className="pr-li-l" style={{ fontWeight: 600 }}>Total</div></div>
                      <span className={`pr-num ${field === "bonus" ? "pr-credit" : "pr-debit"}`} style={{ fontWeight: 700 }}>
                        {field === "bonus" ? "+" : "−"}{money(field === "bonus" ? line.bonus_total : line.deduction_total)}
                      </span>
                    </div>
                  </div>

                  {!locked && (
                    <div className="pr-sec">
                      <span className="pr-lbl">Add a line item</span>
                      <div className="pr-grid2">
                        <label className="pr-field">
                          <span className="pr-lbl">Label</span>
                          <input className="pr-input pr-input-text" value={adj.label}
                                 onChange={(e) => setAdj({ ...adj, label: e.target.value })}
                                 placeholder={field === "bonus" ? "Property incentive" : "Waist coat"} />
                        </label>
                        <label className="pr-field">
                          <span className="pr-lbl">Source</span>
                          <input className="pr-input pr-input-text" value={adj.source}
                                 onChange={(e) => setAdj({ ...adj, source: e.target.value })}
                                 placeholder={field === "bonus" ? "From property" : "Uniform"} />
                        </label>
                        <label className="pr-field">
                          <span className="pr-lbl">Amount</span>
                          <input className="pr-input" type="number" min="0.01" step="0.01" value={adj.amount}
                                 onChange={(e) => setAdj({ ...adj, amount: e.target.value })} placeholder="0.00" />
                        </label>
                      </div>
                      <div style={{ marginTop: 11 }}>
                        <button className="pr-btn pr-btn-primary" onClick={addAdj}
                                disabled={busy || !adj.label.trim() || !(Number(adj.amount) > 0)} type="button">
                          {busy ? "Adding…" : `Add ${field === "bonus" ? "bonus" : "deduction"}`}
                        </button>
                      </div>
                      <p className="pr-hint" style={{ marginTop: 8 }}>
                        A label is required so the amount can still be explained months later.
                      </p>
                    </div>
                  )}
                </>
              )}

              {field === "base" && (
                <div className="pr-sec">
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                    <span className="pr-num" style={{ fontSize: 26 }}>{money0(line.base_salary)}</span>
                    <span className="pr-dim" style={{ fontSize: 12.5 }}>per month</span>
                  </div>
                  <p className="pr-hint">
                    Day rate {Number(line.day_rate).toFixed(2)}. Base salaries are effective-dated and edited
                    under <strong>Rates &amp; salaries</strong>, so changing one cannot rewrite a past month.
                  </p>
                </div>
              )}

              {line.override_history?.length > 0 && (
                <div className="pr-sec">
                  <span className="pr-lbl">Override history</span>
                  <div className="pr-trace">
                    {line.override_history.slice(0, 8).map((h, i) => (
                      <div className="pr-trace-row" key={i}>
                        <span className="pr-trace-d">{String(h.created_at).slice(5, 10)}</span>
                        <span className="pr-trace-t">
                          {FIELD_LABELS[h.field_changed] || h.field_changed}: {h.old_value} → {h.new_value}
                          <div className="pr-dim" style={{ fontSize: 11 }}>{h.reason} · {h.actor_name}</div>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════ */
export default function PayrollPage() {
  const router = useRouter();
  const { theme, attr, choose } = useTheme();

  const [me, setMe] = useState(null);
  const [authState, setAuthState] = useState("loading"); // loading | admin | denied | error
  const [view, setView] = useState("runs");

  const [periods, setPeriods] = useState([]);
  // The id is held separately from the object on purpose. The loaders refresh
  // activePeriod with fresh totals, so depending on the whole object would make
  // each fetch trigger the next one.
  const [periodId, setPeriodId] = useState(null);
  const [activePeriod, setActivePeriod] = useState(null);

  const [lines, setLines] = useState([]);
  const [linesMeta, setLinesMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [help, setHelp] = useState(null);

  const [policy, setPolicy] = useState([]);
  const [policyEdits, setPolicyEdits] = useState({});
  // The penalty ladder is edited as a whole and saved in one go.
  const [slabs, setSlabs] = useState([]);
  const [slabsSaved, setSlabsSaved] = useState([]);
  const [audit, setAudit] = useState([]);
  const [auditPage, setAuditPage] = useState(null);
  // The audit trail keeps its own page size: changing it there should not
  // silently repaginate the register behind you.
  const [auditLimit, setAuditLimit] = useState(DEFAULT_PAGE_SIZE);

  // ── People: the enrolment roster and its candidate list ──
  // Two panes of one screen, each with its own paging and search, because they
  // answer different questions: "who is on payroll" and "who should be".
  const [peoplePane, setPeoplePane] = useState("candidates"); // candidates | roster
  // Its own page size, for the same reason the audit trail has one: changing it
  // here must not silently repaginate the register behind you.
  const [peopleLimit, setPeopleLimit] = useState(DEFAULT_PAGE_SIZE);
  const [cands, setCands] = useState([]);
  const [candMeta, setCandMeta] = useState(null);
  const [candSearch, setCandSearch] = useState("active:yes");
  const [candPage, setCandPage] = useState(1);
  const [picked, setPicked] = useState(() => new Set());
  const [roster, setRoster] = useState([]);
  const [rosterMeta, setRosterMeta] = useState(null);
  // Defaults to the people actually being paid. After a year the roster
  // carries every leaver too, and a list that mixes them in does not match the
  // count in the header — search inactive:yes or leaver:yes to see them.
  const [rosterSearch, setRosterSearch] = useState("active:yes");
  const [rosterPage, setRosterPage] = useState(1);
  const [exitFor, setExitFor] = useState(null);   // { uid, name, exited_on }
  const [review, setReview] = useState(null);     // joiners + proposed exits
  const [checklist, setChecklist] = useState(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(null);

  // ── Salaries ──
  // Held as an edit map rather than mutating the rows, so what you typed and
  // what is currently in force stay visible side by side until you save.
  const [master, setMaster] = useState([]);
  const [masterMeta, setMasterMeta] = useState(null);
  const [salSearch, setSalSearch] = useState("");
  const [salPage, setSalPage] = useState(1);
  const [salEdits, setSalEdits] = useState({});
  // Defaults to the 1st of this month: a mid-month start date makes the whole
  // month pay at the new rate, which is rarely what anybody means.
  const [salFrom, setSalFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [salReason, setSalReason] = useState("");
  const [history, setHistory] = useState({ person: null, rows: null });

  // Scroll target for the Review button, and the back-to-top affordance.
  const candidatesRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  const [showNewRun, setShowNewRun] = useState(false);
  const [newRun, setNewRun] = useState(() => {
    // Default to LAST month — you run payroll for a month that has finished.
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [reopen, setReopen] = useState({ open: false, reason: "" });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, lineId: null, field: null });

  const locked = activePeriod && activePeriod.status !== "DRAFT";

  /* ── admin gate + feature flag ────────────────────────── */
  //
  // Two independent gates, and the flag is not a substitute for the role check.
  // Both are re-checked server-side on every request — this only decides which
  // screen to draw, because hiding a page is not access control.
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(AUTH_ME, { withCredentials: true });
        setMe(res.data);
        if (Number(res.data?.role) !== ADMIN_ROLE_ID) { setAuthState("denied"); return; }

        // Same fail-open rule the server uses: a feature_key with no row is
        // absent from this map, and absent means on. That is what keeps the
        // module working before anybody creates its flag.
        const uid = res.data?.unique_id;
        if (uid) {
          try {
            const flags = await axios.get(
              `${API_ROOT}/api/features/my-flags/${encodeURIComponent(uid)}`,
              { withCredentials: true }
            );
            if (flags.data && flags.data[FEATURE_KEY] === false) {
              setAuthState("disabled");
              return;
            }
          } catch {
            // A flag lookup that cannot run must not become a lockout — the
            // role check above and the server-side gates still apply.
          }
        }
        setAuthState("admin");
      } catch {
        setAuthState("error");
      }
    })();
  }, []);

  /* ── loaders ──────────────────────────────────────────── */
  const loadPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/periods", { params: { limit: 50 } });
      setPeriods(res.data.data);
    } catch (e) { setError(errText(e, "Could not load payroll runs.")); }
    finally { setLoading(false); }
  }, []);

  const loadLines = useCallback(async () => {
    if (!periodId) return;
    setLoading(true);
    try {
      const res = await api.get(`/periods/${periodId}/lines`, {
        params: { search, sort: sort.key, dir: sort.dir, page, limit },
      });
      setLines(res.data.data);
      setLinesMeta(res.data);
      // Totals move as figures are edited, so take the server's word for them.
      setActivePeriod((p) => ({ ...p, ...res.data.period }));
    } catch (e) { setError(errText(e, "Could not load the register.")); }
    finally { setLoading(false); }
  }, [periodId, search, sort.key, sort.dir, page, limit]);

  useEffect(() => { if (authState === "admin") loadPeriods(); }, [authState, loadPeriods]);
  useEffect(() => { if (view === "register") loadLines(); }, [view, loadLines]);

  useEffect(() => {
    if (authState !== "admin" || help) return;
    api.get("/search/help").then((r) => setHelp(r.data)).catch(() => {});
  }, [authState, help]);

  /**
   * Adopt the server's page size.
   *
   * The API decides how big a page is; the constant above only covers the first
   * render, before the answer arrives. So if somebody changes PAGE_SIZE_DEFAULT
   * server-side, every grid follows without a client release.
   *
   * Runs once, and never after the user has touched a page-size dropdown —
   * having the server quietly reset a choice you just made would be worse than
   * the drift it is fixing.
   */
  const pageSizeTouched = useRef(false);
  const pageSizeAdopted = useRef(false);
  useEffect(() => {
    const fromApi = Number(help?.page_size_default);
    if (!Number.isFinite(fromApi) || fromApi <= 0) return;
    if (pageSizeAdopted.current || pageSizeTouched.current) return;
    pageSizeAdopted.current = true;
    if (fromApi === DEFAULT_PAGE_SIZE) return;   // already agreed; nothing to do
    setLimit(fromApi);
    setPeopleLimit(fromApi);
    setAuditLimit(fromApi);
  }, [help]);

  // Wraps every page-size setter so the sync above stands down once you choose.
  const choosePageSize = (setter, resetPage) => (n) => {
    pageSizeTouched.current = true;
    setter(n);
    resetPage?.();
  };

  const loadPolicy = useCallback(async () => {
    try {
      const res = await api.get("/policy");
      setPolicy(res.data.data); setPolicyEdits({});
    } catch (e) { setError(errText(e, "Could not load the rates.")); }
  }, []);

  const loadAudit = useCallback(async (p = 1) => {
    if (!periodId) return;
    try {
      const res = await api.get(`/periods/${periodId}/audit`, { params: { page: p, limit: auditLimit } });
      setAudit(res.data.data); setAuditPage(res.data.pagination);
    } catch (e) { setError(errText(e, "Could not load the audit trail.")); }
  }, [periodId, auditLimit]);

  const loadSlabs = useCallback(async () => {
    try {
      const res = await api.get("/penalty-slabs");
      const rows = res.data.data.map((r) => ({
        min_minutes: r.min_minutes,
        max_minutes: r.max_minutes === null ? "" : r.max_minutes,
        deduction_days: r.deduction_days,
      }));
      setSlabs(rows);
      setSlabsSaved(rows);
    } catch (e) { setError(errText(e, "Could not load the penalty bands.")); }
  }, []);

  const saveSlabs = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.put("/penalty-slabs", {
        slabs: slabs.map((s) => ({
          min_minutes: Number(s.min_minutes),
          max_minutes: s.max_minutes === "" || s.max_minutes === null ? null : Number(s.max_minutes),
          deduction_days: Number(s.deduction_days),
        })),
      });
      setNotice(res.data.message);
      await loadSlabs();
    } catch (e) { setError(errText(e, "Could not save the penalty bands.")); }
    finally { setLoading(false); }
  };

  const slabsDirty = JSON.stringify(slabs) !== JSON.stringify(slabsSaved);

  useEffect(() => { if (view === "rates") { loadPolicy(); loadSlabs(); } }, [view, loadPolicy, loadSlabs]);
  useEffect(() => { if (view === "audit") loadAudit(1); }, [view, loadAudit]);

  /* ── People ───────────────────────────────────────────── */
  const loadCandidates = useCallback(async () => {
    try {
      const res = await api.get("/roster/candidates", {
        params: { search: candSearch, page: candPage, limit: peopleLimit },
      });
      setCands(res.data.data);
      setCandMeta(res.data);
    } catch (e) { setError(errText(e, "Could not load the candidate list.")); }
  }, [candSearch, candPage, peopleLimit]);

  const loadRoster = useCallback(async () => {
    try {
      const res = await api.get("/roster", {
        params: { search: rosterSearch, page: rosterPage, limit: peopleLimit },
      });
      setRoster(res.data.data);
      setRosterMeta(res.data);
    } catch (e) { setError(errText(e, "Could not load the roster.")); }
  }, [rosterSearch, rosterPage, peopleLimit]);

  useEffect(() => {
    if (view !== "people") return;
    if (peoplePane === "candidates") loadCandidates(); else loadRoster();
  }, [view, peoplePane, loadCandidates, loadRoster]);

  // The roster stats sit above both panes, so they are wanted either way.
  useEffect(() => { if (view === "people" && !rosterMeta) loadRoster(); }, [view, rosterMeta, loadRoster]);

  // Shows the back-to-top button, which is how you reach the tab strip again
  // from the bottom of a hundred-row table.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A selection made against one filter must not silently carry into the next.
  useEffect(() => { setPicked(new Set()); }, [candSearch]);

  const togglePick = (id) => setPicked((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // The whole point of the People screen: it tells YOU who is new and who has
  // left, so nobody ever has to scan the user directory to find out.
  const loadReview = useCallback(async () => {
    try {
      const res = await api.get("/roster/review");
      setReview(res.data);
    } catch { /* the panel is an aid, not a blocker — stay quiet if it fails */ }
  }, []);

  const loadChecklist = useCallback(async () => {
    if (!periodId) return null;
    try {
      const res = await api.get(`/periods/${periodId}/checklist`);
      setChecklist(res.data);
      return res.data;
    } catch { return null; }
  }, [periodId]);

  // These two must sit AFTER loadReview/loadChecklist are declared. A const is
  // hoisted but not initialised, so an effect placed above the declaration
  // throws "Cannot access before initialization" the moment the page mounts.
  //
  // Loaded on sign-in rather than only when People is open: it drives the tab
  // badge, which is how you find out somebody joined without going looking.
  useEffect(() => { if (authState === "admin") loadReview(); }, [authState, loadReview]);
  useEffect(() => {
    if (view === "register" && periodId) loadChecklist();
  }, [view, periodId, loadChecklist]);

  const loadMaster = useCallback(async () => {
    try {
      const res = await api.get("/master", {
        params: { search: salSearch, page: salPage, limit: peopleLimit },
      });
      setMaster(res.data.data);
      setMasterMeta(res.data);
    } catch (e) { setError(errText(e, "Could not load the salaries.")); }
  }, [salSearch, salPage, peopleLimit]);

  useEffect(() => { if (view === "salaries") loadMaster(); }, [view, loadMaster]);

  // Only amounts that differ from what is already in force count as a change,
  // so re-typing the same number does not create a pointless new salary row.
  const salEditCount = Object.entries(salEdits).filter(([uid, v]) => {
    if (v === "" || v === undefined) return false;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return false;
    const row = master.find((m) => m.employee_unique_id === uid);
    return !row || Number(row.base_salary) !== n;
  }).length;

  const saveSalaries = async () => {
    const salaries = Object.entries(salEdits)
      .map(([employee_unique_id, v]) => ({ employee_unique_id, base_salary: Number(v) }))
      .filter((x) => x.base_salary >= 0 && Number.isFinite(x.base_salary))
      .filter((x) => {
        const row = master.find((m) => m.employee_unique_id === x.employee_unique_id);
        return !row || Number(row.base_salary) !== x.base_salary;
      });
    if (!salaries.length) return;
    setLoading(true); setError(null);
    try {
      const res = await api.put("/master", {
        effective_from: salFrom, salaries, reason: salReason || null,
      });
      setNotice(res.data.message);
      setSalEdits({}); setSalReason("");
      await loadMaster();
    } catch (e) { setError(errText(e, "Could not save the salaries.")); }
    finally { setLoading(false); }
  };

  const openHistory = async (person) => {
    setHistory({ person, rows: null });
    try {
      const res = await api.get(
        `/master/${encodeURIComponent(person.employee_unique_id)}/history`
      );
      setHistory({ person, rows: res.data.data });
    } catch { setHistory({ person, rows: [] }); }
  };

  const refreshPeople = async () => {
    setPicked(new Set());
    await Promise.all([loadCandidates(), loadRoster(), loadReview()]);
  };

  const enrolPicked = async () => {
    if (!picked.size) return;
    setLoading(true); setError(null);
    try {
      const res = await api.post("/roster", { user_ids: [...picked] });
      setNotice(res.data.message);
      if (res.data.refused?.length) {
        setError(`${res.data.refused.length} could not be enrolled: ` +
          res.data.refused.map((r) => `${r.name} (${r.blocked.message})`).join("; "));
      }
      await refreshPeople();
    } catch (e) { setError(errText(e, "Could not enrol.")); }
    finally { setLoading(false); }
  };

  // The bulk path sends `expect`, so if the count moved between the screen
  // rendering and the button being pressed the server refuses rather than
  // enrolling a number nobody agreed to.
  const enrolAllMatching = async () => {
    const expect = candMeta?.totals?.enrollable ?? 0;
    if (!expect) return;
    setLoading(true); setError(null);
    try {
      const res = await api.post("/roster", {
        all_matching: true, search: candSearch, expect,
      });
      setNotice(res.data.message);
      setConfirmBulk(null);
      await refreshPeople();
    } catch (e) {
      const d = e?.response?.data;
      setError(d?.code === "COUNT_MOVED"
        ? `${d.message} (now ${d.would_enrol})`
        : errText(e, "Could not enrol."));
      setConfirmBulk(null);
      await loadCandidates();
    } finally { setLoading(false); }
  };

  const applyExits = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.post("/roster/apply-exits", { all_declared: true });
      setNotice(res.data.message);
      await refreshPeople();
    } catch (e) { setError(errText(e, "Could not apply the exit dates.")); }
    finally { setLoading(false); }
  };

  const saveExit = async () => {
    if (!exitFor) return;
    setLoading(true); setError(null);
    try {
      const res = await api.patch(`/roster/${encodeURIComponent(exitFor.uid)}`, {
        exited_on: exitFor.exited_on || null,
        status: exitFor.exited_on ? "INACTIVE" : "ACTIVE",
      });
      setNotice(res.data.message);
      setExitFor(null);
      await Promise.all([loadRoster(), loadReview()]);
    } catch (e) { setError(errText(e, "Could not save the exit date.")); }
    finally { setLoading(false); }
  };

  const removeFromRoster = async (row) => {
    setLoading(true); setError(null);
    try {
      const res = await api.delete(`/roster/${encodeURIComponent(row.employee_unique_id)}`);
      setNotice(res.data.message);
      await refreshPeople();
    } catch (e) { setError(errText(e, "Could not remove them.")); }
    finally { setLoading(false); }
  };

  /* ── actions ──────────────────────────────────────────── */
  const openPeriod = (p, nextView = "register") => {
    setActivePeriod(p); setPeriodId(p.id); setView(nextView);
    setPage(1); setSearch(""); setSort({ key: "name", dir: "asc" });
  };

  /**
   * Arrow-key movement inside the tab strip.
   *
   * The strip is marked up as a tablist, which tells assistive technology that
   * arrow keys move between tabs — so they have to actually do that. Disabled
   * tabs are skipped rather than trapping the cursor on a dead stop.
   */
  const onTabKey = (e) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const usable = TABS.filter((t) => !(t.needsPeriod && !periodId && periods.length === 0));
    if (!usable.length) return;
    e.preventDefault();

    // Captured now, not inside the callback below: React clears currentTarget
    // as soon as the handler returns, so reading it later gives null.
    const strip = e.currentTarget;

    const at = Math.max(0, usable.findIndex((t) => t.key === view));
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? usable.length - 1
      : e.key === "ArrowRight" ? (at + 1) % usable.length
      : (at - 1 + usable.length) % usable.length;

    openTab(usable[next]);
    // Focus follows the selection, or the next arrow press starts from the old
    // position. One frame later, so the re-render has moved tabIndex first.
    requestAnimationFrame(() => {
      const el = strip?.querySelector(`[data-tab="${usable[next].key}"]`);
      el?.focus();
      // On a narrow window the strip scrolls; keep the active tab in view.
      el?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  };

  // Clicking a tab must always do something visible. If the tab needs a run and
  // none is open, open the newest one instead of silently refusing.
  const openTab = (t) => {
    // Arriving at a new screen already scrolled halfway down it is disorienting
    // — you land in the middle of a table with no heading in sight.
    const toTop = () => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    if (t.needsPeriod && !periodId) {
      if (periods.length === 0) {
        setView("runs");
        setNotice("Create a payroll run first — press “New month”, then Recompute to pull the figures in.");
        toTop();
        return;
      }
      openPeriod(periods[0], t.key);   // /periods is ordered newest first
      toTop();
      return;
    }
    setView(t.key);
    toTop();
  };

  const createRun = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.post("/periods", { year: newRun.year, month: newRun.month });
      setNotice(res.data.message);
      setShowNewRun(false);
      const list = await api.get("/periods", { params: { limit: 50 } });
      setPeriods(list.data.data);
      // Straight into the run that was just created — creating it is never the
      // goal, seeing the figures is.
      const created = list.data.data.find((p) => p.id === res.data.data.id);
      if (created) openPeriod(created);
    } catch (e) { setError(errText(e, "Could not create the run.")); }
    finally { setLoading(false); }
  };

  const compute = async () => {
    if (!periodId) return;
    setLoading(true); setError(null);
    try {
      const res = await api.post(`/periods/${periodId}/compute`);
      const d = res.data.data;
      setNotice(
        `${res.data.message} ${d.source_counts.schedule_entries} roster entries and ` +
        `${d.source_counts.attendance_rows} attendance rows read.` +
        (d.employees_without_salary ? ` ${d.employees_without_salary} employee(s) have no salary row — they are on zero.` : "")
      );
      await loadLines();
    } catch (e) { setError(errText(e, "Compute failed.")); }
    finally { setLoading(false); }
  };

  // Reopening needs a written reason, so it goes through the modal rather than
  // a browser prompt — which some browsers suppress entirely.
  const requestStatus = (status) => {
    if (status === "DRAFT") { setReopen({ open: true, reason: "" }); return; }
    changeStatus(status);
  };

  // `acknowledge` is only ever set by the user pressing "Finalise anyway" in
  // the checklist. It is never passed automatically: the whole value of the
  // check is that somebody looked.
  const changeStatus = async (status, reason, acknowledge = false) => {
    if (!periodId) return;
    setLoading(true); setError(null);
    try {
      const res = await api.put(`/periods/${periodId}/status`, { status, reason, acknowledge });
      setNotice(res.data.message);
      setActivePeriod((p) => ({ ...p, status }));
      setReopen({ open: false, reason: "" });
      setShowChecklist(false);
      await Promise.all([loadPeriods(), loadLines(), loadChecklist()]);
    } catch (e) {
      const d = e?.response?.data;
      // The server refused because something needs looking at. Show it rather
      // than reporting a failure — nothing went wrong, there is just a decision
      // to make.
      if (d?.checklist) {
        setChecklist({ ...d.checklist, period_id: periodId });
        setShowChecklist(true);
      } else {
        setError(errText(e, "Could not change the status."));
      }
    }
    finally { setLoading(false); }
  };

  const savePolicy = async () => {
    if (!Object.keys(policyEdits).length) return;
    setLoading(true); setError(null);
    try {
      const res = await api.put("/policy", { updates: policyEdits });
      setNotice(res.data.message);
      await loadPolicy();
    } catch (e) { setError(errText(e, "Could not save the rates.")); }
    finally { setLoading(false); }
  };

  const onSort = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const summary = useMemo(() => {
    if (!linesMeta) return null;
    const f = linesMeta.totals.filtered;
    const flagged = lines.filter(
      // Same definition as the server's flagged: predicate, so the count and
      // the "flagged:yes" search agree with each other.
      (l) =>
        l.missed_clockin.effective > 0 ||
        l.missed_clockout.effective > 0 ||
        l.unaccounted_days.effective > 0 ||
        l.penalty_days.effective >= 2
    ).length;
    return { f, run: linesMeta.totals.run, flagged };
  }, [linesMeta, lines]);

  /* ── gates ────────────────────────────────────────────── */
  if (authState === "loading") {
    return (
      <div className="pr-root" data-payroll-theme={attr}>
        <div className="pr-body"><div className="pr-skel" style={{ height: 60 }} /><div className="pr-skel" /><div className="pr-skel" /></div>
      </div>
    );
  }

  if (authState !== "admin") {
    const disabled = authState === "disabled";
    return (
      <div className="pr-root" data-payroll-theme={attr}>
        <div className="pr-denied">
          <div className="pr-denied-icon" aria-hidden="true">{disabled ? "🚧" : "🔒"}</div>
          <h2>{disabled ? "Payroll is switched off" : "Payroll is restricted"}</h2>
          <p>
            {authState === "error"
              ? "We could not confirm who you are. Sign in again and retry."
              : disabled
                ? "This module is not switched on for your account. It is controlled by a feature flag, " +
                  "so an administrator can turn it on under Feature flags → payroll without a release."
                : "This module is available to administrators only. If you need access, ask an administrator — the permission is granted per person."}
          </p>
          <div style={{ marginTop: 18 }}>
            <button className="pr-btn" onClick={() => router.push("/Dashboard")} type="button">
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Everything on the People screen that is waiting on a decision. Shown on
  // the tab so a new joiner is noticed without anybody going to look.
  const attentionCount =
    (review?.new_candidates?.length || 0) +
    (review?.exits_proposed?.length || 0) +
    (review?.gone_quiet?.length || 0);

  const TABS = [
    { key: "runs", label: "Runs" },
    { key: "people", label: "People", badge: attentionCount },
    // "Register" told you nothing. This tab is the month's pay, per person.
    { key: "register", label: "Pay sheet", needsPeriod: true },
    { key: "salaries", label: "Base salaries" },
    { key: "rates", label: "Rates & policy" },
    { key: "guide", label: "Guide" },
    { key: "audit", label: "Audit trail", needsPeriod: true },
  ];

  return (
    <div className="pr-root" data-payroll-theme={attr}>
      <header className="pr-head">
        <div className="pr-head-row">
          <div>
            <div className="pr-title">
              <h1>
                {view === "register" || view === "audit"
                  ? activePeriod ? `${MONTHS[activePeriod.month - 1]} ${activePeriod.year}` : "Payroll"
                  : view === "rates" ? "Rates & policy"
                  : view === "people" ? "People on payroll"
                  : view === "guide" ? "How payroll works"
                  : view === "salaries" ? "Base salaries" : "Payroll runs"}
              </h1>
              {activePeriod && (view === "register" || view === "audit") && <StatusPill status={activePeriod.status} />}
            </div>
            <div className="pr-meta">
              {activePeriod && (view === "register" || view === "audit") ? (
                <>
                  <span>{String(activePeriod.period_start).slice(0, 10)} → {String(activePeriod.period_end).slice(0, 10)}</span>
                  <span className="pr-dot" />
                  <span>{num(activePeriod.employee_count)} employees</span>
                  <span className="pr-dot" />
                  <span>net {money0(activePeriod.net_total)}</span>
                </>
              ) : view === "people" && rosterMeta ? (
                <>
                  <span>{num(rosterMeta.stats.active)} on payroll</span>
                  <span className="pr-dot" />
                  <span>{num(rosterMeta.stats.leavers)} with an exit date</span>
                  {rosterMeta.stats.without_salary > 0 && (
                    <>
                      <span className="pr-dot" />
                      <span className="pr-debit">{num(rosterMeta.stats.without_salary)} without a salary</span>
                    </>
                  )}
                </>
              ) : (
                <span>Signed in as {me?.fname} · administrator</span>
              )}
            </div>
          </div>

          <div className="pr-actions">
            {view === "register" && activePeriod && (
              <>
                <button className="pr-btn" onClick={compute} disabled={loading || locked}
                        title={locked ? "This run is locked" : "Re-read Attendance and Scheduling"} type="button">
                  {loading ? <span className="pr-spin" /> : "⟳"} Recompute
                </button>
                {activePeriod.status === "DRAFT" && (
                  <button className="pr-btn pr-btn-primary"
                          onClick={async () => { await loadChecklist(); setShowChecklist(true); }}
                          disabled={loading} type="button">
                    Finalise run
                    {checklist && !checklist.clean && (
                      <span className="pr-dotwarn" aria-hidden="true" />
                    )}
                  </button>
                )}
                {activePeriod.status === "FINALISED" && (
                  <>
                    <button className="pr-btn" onClick={() => requestStatus("DRAFT")} disabled={loading} type="button">Reopen</button>
                    <button className="pr-btn pr-btn-primary" onClick={() => changeStatus("PAID")} disabled={loading} type="button">Mark paid</button>
                  </>
                )}
                {activePeriod.status === "PAID" && (
                  <button className="pr-btn pr-btn-danger" onClick={() => requestStatus("DRAFT")} disabled={loading} type="button">Reopen</button>
                )}
              </>
            )}
            {view === "runs" && (
              <button className="pr-btn pr-btn-primary" onClick={() => setShowNewRun(true)}
                      disabled={loading} type="button">
                ＋ New month
              </button>
            )}
            {/* ── SALARIES ─────────────────────────────────── */}
        {view === "salaries" && (
          <div className="pr-stack">
            <div className="pr-panel">
              <div className="pr-panel-head">
                <h2>Base salaries</h2>
                <span className="sub">
                  One amount per person. Setting a new one never rewrites a month you have already paid.
                </span>
              </div>
              <div className="pr-panel-body">
                <div className="pr-salbar">
                  <label className="pr-field">
                    <span className="pr-lbl">These amounts apply from</span>
                    <input className="pr-input" type="date" value={salFrom}
                           disabled={loading}
                           onChange={(e) => setSalFrom(e.target.value)} />
                  </label>
                  <label className="pr-field" style={{ flex: 1, minWidth: 200 }}>
                    <span className="pr-lbl">Reason (optional, kept with the record)</span>
                    <input className="pr-input pr-input-text" value={salReason}
                           disabled={loading}
                           placeholder="Annual revision, promotion, correction…"
                           onChange={(e) => setSalReason(e.target.value)} />
                  </label>
                </div>
                <p className="pr-hint" style={{ marginTop: 10 }}>
                  Payroll for a month uses whatever was in force at the end of that month. Setting a
                  date of the 1st keeps each month on a single, unambiguous amount — a date in the
                  middle of a month means that whole month is paid at the new rate.
                </p>
              </div>
            </div>

            <div className="pr-panel">
              <div className="pr-panel-head">
                <h2>Everyone on payroll</h2>
                {masterMeta && (
                  <span className="sub">
                    {num(masterMeta.stats.with_salary)} of {num(masterMeta.pagination.total)} have an
                    amount set · {money0(masterMeta.stats.total_base)} monthly in total
                  </span>
                )}
              </div>

              <div className="pr-panel-body">
                <SearchBar
                  value={salSearch}
                  onChange={(v) => { setSalSearch(v); setSalPage(1); }}
                  placeholder="a name   an employee code"
                  label="Search people on payroll"
                />

                {masterMeta?.stats?.without_salary > 0 && (
                  <div style={{ marginTop: 11 }}>
                    <Notice kind="warn">
                      {num(masterMeta.stats.without_salary)}{" "}
                      {masterMeta.stats.without_salary === 1 ? "person has" : "people have"} no amount
                      set and would be paid zero. A run cannot be finalised while that is true.
                    </Notice>
                  </div>
                )}

                <div className={"pr-bulkbar pr-bulkbar-sticky" + (salEditCount > 0 ? " on" : "")}>
                  <span className="pr-hint">
                    {salEditCount > 0
                      ? `${num(salEditCount)} amount${salEditCount === 1 ? "" : "s"} changed, not yet saved`
                      : "Type in the New amount column, then save."}
                  </span>
                  <span className="pr-bulkacts">
                    {salEditCount > 0 && (
                      <button className="pr-btn" onClick={() => setSalEdits({})}
                              disabled={loading} type="button">Discard</button>
                    )}
                    <button className="pr-btn pr-btn-primary" onClick={saveSalaries}
                            disabled={loading || !salEditCount || !salFrom} type="button">
                      {loading ? "Saving…" : `Save ${salEditCount || ""} change${salEditCount === 1 ? "" : "s"}`}
                    </button>
                  </span>
                </div>
              </div>

              {master.length === 0 ? (
                <div className="pr-empty">
                  {salSearch ? (
                    <>Nobody matches that search.</>
                  ) : (
                    <>Nobody is on payroll yet.<br />
                      <span className="pr-hint">
                        Salaries are set for people on the payroll list. Add them under{" "}
                        <strong>People</strong> first.
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {masterMeta && (
                    <Pager pagination={masterMeta.pagination} limit={peopleLimit} unit="people"
                           onPage={setSalPage}
                           onLimit={choosePageSize(setPeopleLimit, () => setSalPage(1))}
                           className="pr-pager-top" />
                  )}
                  <SalaryTable
                    rows={master}
                    edits={salEdits}
                    busy={loading}
                    onEdit={(uid, v) => setSalEdits((p) => ({ ...p, [uid]: v }))}
                    onHistory={openHistory}
                  />
                  {masterMeta && (
                    <Pager pagination={masterMeta.pagination} limit={peopleLimit} unit="people"
                           onPage={setSalPage}
                           onLimit={choosePageSize(setPeopleLimit, () => setSalPage(1))} />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {view === "rates" && (
              <button className="pr-btn pr-btn-primary" onClick={savePolicy}
                      disabled={loading || !Object.keys(policyEdits).length} type="button">
                Save {Object.keys(policyEdits).length || ""} change{Object.keys(policyEdits).length === 1 ? "" : "s"}
              </button>
            )}
            <ThemeToggle theme={theme} choose={choose} />
          </div>
        </div>

        <div className="pr-tabs" role="tablist" aria-label="Payroll sections"
             onKeyDown={onTabKey}>
          {TABS.map((t) => {
            // Register and Audit need a run open. Rather than being a dead
            // button, they pick the most recent run for you — and are only
            // disabled (visibly) when there is genuinely nothing to open.
            const blocked = t.needsPeriod && !periodId && periods.length === 0;
            const selected = view === t.key;
            return (
              <button key={t.key} className="pr-tab" role="tab" data-tab={t.key}
                      aria-selected={selected}
                      // A tablist is one stop in the tab order: Tab moves past
                      // the whole strip, arrow keys move within it. Without
                      // this, reaching the last tab takes six presses.
                      tabIndex={selected ? 0 : -1}
                      disabled={blocked}
                      title={blocked ? "Create a payroll run first" : undefined}
                      onClick={() => openTab(t)} type="button">
                {t.label}
                {t.badge > 0 && (
                  <span className="pr-tabbadge"
                        aria-label={`${t.badge} needing attention`}>{t.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="pr-body">
        <Notice kind="bad" onClose={() => setError(null)}>{error}</Notice>
        <Notice kind="ok" onClose={() => setNotice(null)}>{notice}</Notice>

        {/* A run whose inputs changed after it was computed. Stays until the
            recompute happens — the figures on screen are not the figures the
            current rules would produce, and nothing else on this page says so. */}
        {view === "register" && checklist?.stale && (
          <div className="pr-stale" role="status">
            <span className="pr-stale-i" aria-hidden="true">!</span>
            <span className="pr-stale-b">
              <strong>These figures are out of date.</strong>{" "}
              Something changed after this run was last computed, so what you are looking at is not
              what the rules would produce now. Recompute to bring it up to date — this run cannot
              be finalised until you do.
              {checklist.stale_changes?.length > 0 && (
                <span className="pr-stale-list">
                  {checklist.stale_changes.map((c) => (
                    <span className="pr-stale-chip" key={c.action}>
                      {c.label}{c.times > 1 ? " ×" + c.times : ""}
                    </span>
                  ))}
                </span>
              )}
            </span>
            <button className="pr-btn pr-btn-primary" onClick={compute}
                    disabled={loading || locked} type="button">
              {loading ? <span className="pr-spin" /> : "⟳"} Recompute now
            </button>
          </div>
        )}

        {/* ── GUIDE ────────────────────────────────────── */}
        {view === "guide" && <Guide />}

        {/* ── PEOPLE ───────────────────────────────────── */}
        {view === "people" && (
          <div className="pr-stack">
            <div className="pr-panel">
              <div className="pr-panel-head">
                <h2>Who is on payroll</h2>
                <span className="sub">
                  Nobody is added automatically. Payroll pays this list and nobody else.
                </span>
              </div>
              <div className="pr-panel-body">
                <div className="pr-segbar" role="tablist">
                  <button className="pr-seg" role="tab" aria-selected={peoplePane === "candidates"}
                          onClick={() => setPeoplePane("candidates")} type="button">
                    To decide{candMeta ? ` · ${num(candMeta.pagination.total)}` : ""}
                  </button>
                  <button className="pr-seg" role="tab" aria-selected={peoplePane === "roster"}
                          onClick={() => setPeoplePane("roster")} type="button">
                    On payroll{rosterMeta ? ` · ${num(rosterMeta.stats.active)}` : ""}
                  </button>
                </div>

                {peoplePane === "candidates" && (
                  <p className="pr-hint" style={{ marginTop: 11 }}>
                    Your user list holds test logins and departmental accounts alongside real
                    employees, and nothing in the record tells them apart — so payroll asks the data
                    instead. Somebody who is rostered or clocks in is working here; a test account
                    does neither. Filter on activity, check the list, then add them.
                  </p>
                )}
              </div>
            </div>

            <NeedsAttention
              review={review}
              busy={loading}
              onOpenCandidates={() => {
                // Clearing the filter rather than setting active:yes, because the
                // panel finds joiners by JOINING DATE as well as by activity —
                // active:yes would hide the very people it just told you about.
                setPeoplePane("candidates");
                setCandSearch("");
                setCandPage(1);
                // Scroll is the feedback. Without it, pressing Review while
                // already on the candidate list changed nothing at all and the
                // button looked broken.
                requestAnimationFrame(() => {
                  candidatesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
              onAddAll={async () => {
                const ids = (review?.new_candidates || []).filter((c) => !c.blocked).map((c) => c.user_id);
                if (!ids.length) return;
                setLoading(true); setError(null);
                try {
                  const res = await api.post("/roster", { user_ids: ids });
                  setNotice(res.data.message);
                  await refreshPeople();
                } catch (e) { setError(errText(e, "Could not add them.")); }
                finally { setLoading(false); }
              }}
              onApplyExits={applyExits}
              onSetExit={setExitFor}
            />

            {/* ── candidates ── */}
            {peoplePane === "candidates" && (
              <div className="pr-panel" ref={candidatesRef}>
                <div className="pr-panel-head">
                  <h2>Not on payroll yet</h2>
                  {candMeta && (
                    <span className="sub">
                      {num(candMeta.totals.looks_active)} of {num(candMeta.totals.matching)} show
                      activity in the last {candMeta.window.activity_days} days
                    </span>
                  )}
                </div>

                <div className="pr-panel-body">
                  <SearchBar
                    value={candSearch}
                    onChange={(v) => { setCandSearch(v); setCandPage(1); }}
                    help={{
                      examples: [
                        { q: "active:yes", means: "rostered or clocked in recently — the real employees" },
                        { q: "active:no", means: "no activity at all — usually test or departmental ids" },
                        { q: "schedule>=10", means: "rostered at least 10 days" },
                        { q: "clockedin:yes", means: "has clocked in at least once" },
                        { q: "schedulable:no", means: "no employee record, so they cannot be rostered" },
                        { q: "returning:yes", means: "was on payroll before, left, and is back" },
                        { q: "blocked:yes", means: "cannot be enrolled until the user data is fixed" },
                        { q: "role:2", means: "one role only" },
                      ],
                    }}
                    applied={candMeta?.search?.applied}
                    unknown={candMeta?.search?.unknown}
                    placeholder="active:yes   schedule>=10   a name"
                    label="Search people who are not yet on payroll"
                  />

                  <div className="pr-bulkbar">
                    <span className="pr-hint">
                      {picked.size > 0
                        ? `${num(picked.size)} selected`
                        : candMeta
                          ? `${num(candMeta.totals.enrollable)} of these can be added`
                          : "…"}
                    </span>
                    <span className="pr-bulkacts">
                      {picked.size > 0 && (
                        <button className="pr-btn" onClick={() => setPicked(new Set())}
                                disabled={loading} type="button">Clear</button>
                      )}
                      <button className="pr-btn pr-btn-primary" onClick={enrolPicked}
                              disabled={loading || !picked.size} type="button">
                        Add {picked.size ? num(picked.size) : ""} selected
                      </button>
                      <button className="pr-btn" onClick={() => setConfirmBulk(candMeta?.totals?.enrollable || 0)}
                              disabled={loading || !candMeta?.totals?.enrollable} type="button"
                              title="Adds everybody matching the filter above, not just this page">
                        Add all {candMeta ? num(candMeta.totals.enrollable) : ""} matching
                      </button>
                    </span>
                  </div>
                </div>

                {cands.length === 0 ? (
                  <div className="pr-empty">
                    Nobody left matching this filter.<br />
                    <span className="pr-hint">
                      Try <code>active:no</code> to see the accounts with no activity — that is
                      where the test and departmental ids sit.
                    </span>
                  </div>
                ) : (
                  <>
                    {candMeta && (
                      <Pager pagination={candMeta.pagination} limit={peopleLimit} unit="people"
                             onPage={setCandPage}
                             onLimit={choosePageSize(setPeopleLimit, () => setCandPage(1))}
                             className="pr-pager-top" />
                    )}
                    <CandidateTable
                      rows={cands}
                      picked={picked}
                      busy={loading}
                      onToggle={togglePick}
                      onToggleAll={(on) => setPicked((prev) => {
                        const next = new Set(prev);
                        for (const r of cands) if (!r.blocked) { if (on) next.add(r.user_id); else next.delete(r.user_id); }
                        return next;
                      })}
                    />
                    {candMeta && (
                      <Pager pagination={candMeta.pagination} onPage={setCandPage} unit="people"
                             limit={peopleLimit} onLimit={choosePageSize(setPeopleLimit, () => setCandPage(1))} />
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── the roster ── */}
            {peoplePane === "roster" && (
              <div className="pr-panel">
                <div className="pr-panel-head">
                  <h2>On payroll</h2>
                  <span className="sub">Every run pays exactly these people.</span>
                </div>

                <div className="pr-panel-body">
                  <SearchBar
                    value={rosterSearch}
                    onChange={(v) => { setRosterSearch(v); setRosterPage(1); }}
                    help={{
                      examples: [
                        { q: "nosalary:yes", means: "enrolled but no salary set — they would be paid zero" },
                        { q: "leaver:yes", means: "has an exit date" },
                        { q: "inferred:yes", means: "exit date was guessed, not confirmed — check before finalising" },
                        { q: "drifted:yes", means: "their account number no longer matches" },
                        { q: "inactive:yes", means: "switched off" },
                        { q: "salary<15000", means: "by salary" },
                      ],
                    }}
                    applied={rosterMeta?.search?.applied}
                    unknown={rosterMeta?.search?.unknown}
                    placeholder="nosalary:yes   leaver:yes   a name"
                    label="Search the payroll roster"
                  />
                </div>

                {rosterMeta?.stats?.without_salary > 0 && (
                  <div className="pr-panel-body" style={{ paddingTop: 0 }}>
                    <Notice kind="warn">
                      {num(rosterMeta.stats.without_salary)} enrolled{" "}
                      {rosterMeta.stats.without_salary === 1 ? "person has" : "people have"} no base
                      salary and would be paid zero. Set them on the Rates &amp; policy screen before
                      finalising a run.
                    </Notice>
                  </div>
                )}

                {roster.length === 0 ? (
                  <div className="pr-empty">
                    {rosterSearch === "active:yes" && rosterMeta?.stats?.enrolled > 0 ? (
                      <>
                        Nobody is currently being paid.<br />
                        <span className="pr-hint">
                          {num(rosterMeta.stats.enrolled)} on the roster have all left. Search{" "}
                          <code>inactive:yes</code> to see them, or clear the search for everyone.
                        </span>
                      </>
                    ) : rosterSearch ? (
                      <>
                        Nobody matches that search.<br />
                        <span className="pr-hint">Clear it to see everyone on the roster.</span>
                      </>
                    ) : (
                      <>
                        Nobody is on payroll yet.<br />
                        <span className="pr-hint">
                          Open “To decide”, filter on <code>active:yes</code>, and add the people who
                          work here. A run with an empty roster produces no lines.
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <RosterTable rows={roster} busy={loading}
                                 onExit={setExitFor} onRemove={removeFromRoster} />
                    {rosterMeta && (
                      <Pager pagination={rosterMeta.pagination} onPage={setRosterPage} unit="people"
                             limit={peopleLimit} onLimit={choosePageSize(setPeopleLimit, () => setRosterPage(1))} />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RUNS ─────────────────────────────────────── */}
        {view === "runs" && (
          <div className="pr-stack">
            <div className="pr-panel">
              <div className="pr-panel-head">
                <h2>Payroll runs</h2>
                <span className="sub">A run freezes every figure the moment it is finalised.</span>
              </div>
              {periods.length === 0 ? (
                <div className="pr-empty">
                  No runs yet.<br />
                  <span className="pr-hint">Create a month, then Recompute to pull the figures from Attendance and Scheduling.</span>
                </div>
              ) : (
                <div className="pr-runs">
                  {periods.map((p) => (
                    <button className="pr-run" key={p.id} onClick={() => openPeriod(p)} type="button">
                      <span>
                        <span className="pr-run-n">{MONTHS[p.month - 1]} {p.year}</span>
                        <span className="pr-run-d">
                          {String(p.period_start).slice(0, 10)} → {String(p.period_end).slice(0, 10)}
                          {p.last_computed_at ? ` · computed ${String(p.last_computed_at).slice(0, 16).replace("T", " ")}` : " · never computed"}
                        </span>
                      </span>
                      <StatusPill status={p.status} />
                      <span className="pr-run-f"><span className="pr-lbl">Employees</span><span className="pr-num">{num(p.employee_count)}</span></span>
                      <span className="pr-run-f"><span className="pr-lbl">Net payout</span><span className="pr-num">{money0(p.net_total)}</span></span>
                      <span className="pr-dim">›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pr-panel">
              <div className="pr-panel-head"><h2>How a run moves</h2></div>
              <div className="pr-panel-body pr-stack" style={{ gap: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <StatusPill status="DRAFT" />
                  <span className="pr-hint">Figures recompute from Attendance and Scheduling on demand. Everything is editable, and every edit is logged.</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <StatusPill status="FINALISED" />
                  <span className="pr-hint">Inputs, outputs and the rates that produced them are snapshotted. Later attendance corrections cannot move this month.</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <StatusPill status="PAID" />
                  <span className="pr-hint">Disbursed and closed. Read-only for everyone.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REGISTER ─────────────────────────────────── */}
        {view === "register" && activePeriod && (
          <div className="pr-stack">
            {summary && (
              <div className="pr-strip">
                <div className="pr-stat">
                  <div className="pr-lbl">Net payout</div>
                  <div className="pr-stat-v">{money0(summary.f.net_total)}</div>
                  <div className="pr-stat-d">{search ? "matching your search" : "whole run"}</div>
                </div>
                <div className="pr-stat">
                  <div className="pr-lbl">Gross additions</div>
                  <div className="pr-stat-v pr-credit">+{num(Math.round(Number(summary.f.bonus_total) + Number(summary.f.night_total)))}</div>
                  <div className="pr-stat-d">Bonus and night allowance</div>
                </div>
                <div className="pr-stat">
                  <div className="pr-lbl">Deductions</div>
                  <div className="pr-stat-v pr-debit">
                    −{num(Math.round(Number(summary.f.base_total) + Number(summary.f.bonus_total) + Number(summary.f.night_total) - Number(summary.f.net_total)))}
                  </div>
                  <div className="pr-stat-d">LOP, half days, penalties, misses</div>
                </div>
                <div className={`pr-stat${summary.flagged ? " pr-stat-flag" : ""}`}>
                  <div className="pr-lbl">Needs a look</div>
                  <div className="pr-stat-v">{summary.flagged}</div>
                  <div className="pr-stat-d">On this page — try <code>flagged:yes</code></div>
                </div>
              </div>
            )}

            <div className="pr-panel">
              {locked && (
                <div className="pr-locked">
                  <span aria-hidden="true">▣</span>
                  <span><strong>This run is locked.</strong> Figures were snapshotted when it was finalised — later attendance corrections will not change them.</span>
                </div>
              )}
              <div className="pr-panel-head" style={{ display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <h2>Register</h2>
                  <span className="sub">Click any figure to see the days behind it.</span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 11 }} className="pr-dim">
                    <span><span className="pr-src-sch" style={{ fontWeight: 600 }}>■</span> Scheduling</span>
                    <span><span className="pr-src-clk" style={{ fontWeight: 600 }}>■</span> Clock-in</span>
                    <span><span className="pr-src-man" style={{ fontWeight: 600 }}>■</span> Manual</span>
                  </span>
                </div>
                <SearchBar
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(1); }}
                  help={help}
                  applied={linesMeta?.search?.applied}
                  unknown={linesMeta?.search?.unknown}
                  busy={loading}
                />
              </div>

              {lines.length === 0 ? (
                <div className="pr-empty">
                  {/* Three different reasons for an empty grid, and telling
                      them apart matters. "Press Recompute" when the real
                      problem is an empty roster sends you round a loop that
                      never ends — which is exactly what used to happen. */}
                  {search ? (
                    <>Nothing matches that search.<br />
                      <span className="pr-hint">Clear it, or check the highlighted terms above.</span></>
                  ) : activePeriod.last_computed_at ? (
                    <>Nobody is on payroll yet.<br />
                      <span className="pr-hint">
                        This run was computed, but the payroll list is empty, so there is nobody to pay.
                        Open <strong>People</strong> and add the employees who work here.
                      </span>
                      <div style={{ marginTop: 14 }}>
                        <button className="pr-btn pr-btn-primary" type="button"
                                onClick={() => { setView("people"); setPeoplePane("candidates"); }}>
                          Go to People
                        </button>
                      </div>
                    </>
                  ) : (
                    <>This run has not been computed yet.<br />
                      <span className="pr-hint">Press Recompute to pull the figures in.</span></>
                  )}
                </div>
              ) : (
                <>
                  <Pager pagination={linesMeta?.pagination} limit={limit}
                         onPage={setPage} onLimit={choosePageSize(setLimit, () => setPage(1))}
                         unit="employees" className="pr-pager-top" />
                  <RegisterTable
                    lines={lines}
                    totals={linesMeta?.totals?.filtered}
                    sort={sort}
                    onSort={onSort}
                    onCell={(line, field) => setDrawer({ open: true, lineId: line.id, field })}
                    locked={locked}
                  />
                  <Pager pagination={linesMeta?.pagination} limit={limit}
                         onPage={setPage} onLimit={choosePageSize(setLimit, () => setPage(1))}
                         unit="employees" />
                </>
              )}
            </div>
          </div>
        )}

        {/* ── RATES ────────────────────────────────────── */}
        {view === "rates" && (
          <div className="pr-stack">
          <PenaltySlabs
            slabs={slabs}
            onChange={setSlabs}
            onSave={saveSlabs}
            onReset={() => setSlabs(slabsSaved)}
            dirty={slabsDirty}
            busy={loading}
          />
          <div className="pr-panel">
            <div className="pr-panel-head">
              <h2>Rates &amp; policy</h2>
              <span className="sub">Every rate the payroll sheet marks editable. Recompute a draft run to apply a change.</span>
            </div>
            <div className="pr-scroller">
              <table className="pr-list">
                <thead>
                  <tr><th style={{ minWidth: 220 }}>Rate</th><th style={{ width: 150 }}>Value</th><th>What it does</th></tr>
                </thead>
                <tbody>
                  {policy.map((p) => (
                    <tr key={p.policy_key}>
                      <td><code style={{ fontFamily: "var(--font-data)", fontSize: 12 }}>{p.policy_key}</code></td>
                      <td>
                        <input
                          className="pr-input"
                          value={policyEdits[p.policy_key] ?? p.policy_value}
                          onChange={(e) => setPolicyEdits((s) => ({ ...s, [p.policy_key]: e.target.value }))}
                        />
                      </td>
                      <td className="pr-hint">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pr-panel-body">
              <p className="pr-hint">
                A finalised run keeps the rates it was finalised with, so changing a value here can never
                rewrite a month you have already paid.
              </p>
            </div>
          </div>
          </div>
        )}

        {/* ── AUDIT ────────────────────────────────────── */}
        {view === "audit" && activePeriod && (
          <div className="pr-panel">
            <div className="pr-panel-head">
              <h2>Audit trail</h2>
              <span className="sub">Every override, rate change and status move on this run.</span>
            </div>
            {audit.length === 0 ? (
              <div className="pr-empty">Nothing recorded on this run yet.</div>
            ) : (
              <>
                <div className="pr-scroller">
                  <table className="pr-list">
                    <thead>
                      <tr>
                        <th style={{ width: 130 }}>When</th><th>Employee</th><th>Action</th>
                        <th>Field</th><th className="r">From</th><th className="r">To</th>
                        <th style={{ minWidth: 180 }}>Reason</th><th>By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.map((a) => (
                        <tr key={a.id}>
                          <td className="pr-dim pr-num">{String(a.created_at).slice(0, 16).replace("T", " ")}</td>
                          <td>{a.employee_unique_id || "—"}</td>
                          <td><span className="pr-pill pr-pill-plain">{a.action}</span></td>
                          <td>{a.field_changed || "—"}</td>
                          <td className="r pr-num pr-dim">{a.old_value ?? "—"}</td>
                          <td className="r pr-num">{a.new_value ?? "—"}</td>
                          <td>{a.reason || "—"}</td>
                          <td className="pr-dim">{a.actor_name || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pager pagination={auditPage} limit={auditLimit}
                       onPage={(p) => loadAudit(p)} onLimit={choosePageSize(setAuditLimit)} unit="entries" />
              </>
            )}
          </div>
        )}
      </main>

      <LineDrawer
        open={drawer.open}
        lineId={drawer.lineId}
        field={drawer.field}
        locked={locked}
        onClose={() => setDrawer({ open: false, lineId: null, field: null })}
        onChanged={loadLines}
      />

      {/* ── new run ─────────────────────────────────────── */}
      {/* Exit date — the mirror of a joining date, and the reason a leaver's
          final part-month is still paid correctly. */}
      {exitFor && (
        <>
          <div className="pr-scrim on" onClick={() => setExitFor(null)} />
          <div className="pr-modal" role="dialog" aria-modal="true" aria-label="Set exit date">
            <div className="pr-mo-head">
              <h3>{exitFor.name}</h3>
              <p className="sub">
                Their last day on payroll. They are paid up to and including this date; the days
                after it are deducted, exactly as the days before a joining date are.
              </p>
            </div>
            <div className="pr-mo-body">
              <label className="pr-field">
                <span className="pr-lbl">Last day</span>
                <input className="pr-input" type="date" value={exitFor.exited_on || ""}
                       onChange={(e) => setExitFor({ ...exitFor, exited_on: e.target.value })} />
              </label>
              <p className="pr-hint" style={{ marginTop: 11 }}>
                They stay on the run for the month they left, then drop off automatically.
                Clear the date to put them back on payroll. Finalised months never move.
              </p>
            </div>
            <div className="pr-mo-foot">
              <button className="pr-btn" onClick={() => setExitFor(null)} disabled={loading} type="button">Cancel</button>
              <button className="pr-btn pr-btn-primary" onClick={saveExit} disabled={loading} type="button">
                {loading ? "Saving…" : exitFor.exited_on ? "Save exit date" : "Clear exit date"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bulk enrol. A confirmation, because "add all matching" is the one
          action here that touches people you have not looked at individually. */}
      {confirmBulk != null && (
        <>
          <div className="pr-scrim on" onClick={() => setConfirmBulk(null)} />
          <div className="pr-modal" role="dialog" aria-modal="true" aria-label="Add everyone matching">
            <div className="pr-mo-head">
              <h3>Add {num(confirmBulk)} {confirmBulk === 1 ? "person" : "people"} to payroll</h3>
              <p className="sub">Everybody matching the filter, not just the page you can see.</p>
            </div>
            <div className="pr-mo-body">
              <div className="pr-chips" style={{ marginBottom: 11 }}>
                <span className="pr-chip">{candSearch || "no filter — everyone left"}</span>
              </div>
              <p className="pr-hint">
                They will appear on every run from now on. Anyone added by mistake can be removed,
                and no salary is set by this — you do that afterwards on Rates &amp; policy.
              </p>
            </div>
            <div className="pr-mo-foot">
              <button className="pr-btn" onClick={() => setConfirmBulk(null)} disabled={loading} type="button">Cancel</button>
              <button className="pr-btn pr-btn-primary" onClick={enrolAllMatching} disabled={loading} type="button">
                {loading ? "Adding…" : `Add ${num(confirmBulk)}`}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Reaches the tab strip again from the bottom of a long table. */}
      <button className={"pr-totop" + (scrolled ? " on" : "")} type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-hidden={!scrolled} tabIndex={scrolled ? 0 : -1}>
        ↑ Top
      </button>

      {history.person && (
        <SalaryHistory person={history.person} rows={history.rows}
                       onClose={() => setHistory({ person: null, rows: null })} />
      )}

      {showChecklist && (
        <ChecklistModal
          checklist={checklist}
          busy={loading}
          onClose={() => setShowChecklist(false)}
          onFinalise={() => changeStatus("FINALISED", null, true)}
        />
      )}

      {showNewRun && (
        <>
          <div className="pr-scrim on" onClick={() => setShowNewRun(false)} />
          <div className="pr-modal" role="dialog" aria-modal="true" aria-label="New payroll run">
            <div className="pr-mo-head">
              <h3>New payroll run</h3>
              <p className="sub">
                Creates an empty draft. Nothing is calculated until you press Recompute,
                and one run per calendar month is allowed.
              </p>
            </div>
            <div className="pr-mo-body">
              <div className="pr-grid2">
                <label className="pr-field">
                  <span className="pr-lbl">Month</span>
                  <select className="pr-input pr-input-text" value={newRun.month}
                          onChange={(e) => setNewRun({ ...newRun, month: Number(e.target.value) })}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </label>
                <label className="pr-field">
                  <span className="pr-lbl">Year</span>
                  <input className="pr-input" type="number" min="2020" max="2100" value={newRun.year}
                         onChange={(e) => setNewRun({ ...newRun, year: Number(e.target.value) })} />
                </label>
              </div>
              <p className="pr-hint" style={{ marginTop: 11 }}>
                Payroll for {MONTHS[newRun.month - 1]} {newRun.year} covers the whole calendar month.
                The day rate always divides by 30, whatever the month&apos;s real length.
              </p>
            </div>
            <div className="pr-mo-foot">
              <button className="pr-btn" onClick={() => setShowNewRun(false)} disabled={loading} type="button">Cancel</button>
              <button className="pr-btn pr-btn-primary" onClick={createRun} disabled={loading} type="button">
                {loading ? "Creating…" : "Create draft"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── reopen a locked run ─────────────────────────── */}
      {reopen.open && (
        <>
          <div className="pr-scrim on" onClick={() => setReopen({ open: false, reason: "" })} />
          <div className="pr-modal" role="dialog" aria-modal="true" aria-label="Reopen run">
            <div className="pr-mo-head">
              <h3>Reopen this run?</h3>
              <p className="sub">
                {activePeriod?.status === "PAID"
                  ? "This month has been marked paid. Reopening unlocks figures that may already have been disbursed."
                  : "This month was finalised. Reopening lets its figures move again."}
                {" "}The reason below is recorded in the audit trail.
              </p>
            </div>
            <div className="pr-mo-body">
              <label className="pr-field">
                <span className="pr-lbl">Reason (required)</span>
                <input className="pr-input pr-input-text" value={reopen.reason} autoFocus
                       onChange={(e) => setReopen({ ...reopen, reason: e.target.value })}
                       placeholder="e.g. attendance correction for two agents" />
              </label>
            </div>
            <div className="pr-mo-foot">
              <button className="pr-btn" onClick={() => setReopen({ open: false, reason: "" })}
                      disabled={loading} type="button">Cancel</button>
              <button className="pr-btn pr-btn-danger" onClick={() => changeStatus("DRAFT", reopen.reason.trim())}
                      disabled={loading || !reopen.reason.trim()} type="button">
                {loading ? "Reopening…" : "Reopen as draft"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
