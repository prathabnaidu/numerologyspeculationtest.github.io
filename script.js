{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // Numerology on Speculations\
// Implements the steps shown in the user's document, including the letter mapping.\
\
// Letter mapping from the doc:\
// A-1, B=2, C=3, D=4, E=5, F=8, G=3, H=5, I=1, J=1, K=2, L=3, M=4, N=5,\
// O=7, P=8, Q=1, R=2, S=3, T=4, U=6, V=6, W=6, X=5, Y=1, Z=8\
const LETTER_MAP = \{\
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3,\
  M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5,\
  Y: 1, Z: 8\
\};\
\
function toIntStrict(s, fieldName) \{\
  const n = Number(String(s).trim());\
  if (!Number.isFinite(n) || !Number.isInteger(n)) \{\
    throw new Error(`$\{fieldName\} must be an integer.`);\
  \}\
  return n;\
\}\
\
function sumDigits(n) \{\
  const str = Math.abs(n).toString();\
  let sum = 0;\
  for (const ch of str) sum += ch.charCodeAt(0) - 48;\
  return sum;\
\}\
\
function reduceToSingleDigit(n) \{\
  let x = Math.abs(Number(n));\
  if (!Number.isFinite(x)) return 0;\
  while (x > 9) x = sumDigits(x);\
  return x;\
\}\
\
function sumLettersValue(text) \{\
  const s = String(text || "").toUpperCase();\
  let total = 0;\
  for (const ch of s) \{\
    if (LETTER_MAP[ch] != null) total += LETTER_MAP[ch];\
  \}\
  return total;\
\}\
\
function sumDigitsInString(text) \{\
  const s = String(text || "");\
  let total = 0;\
  for (const ch of s) \{\
    if (ch >= "0" && ch <= "9") total += (ch.charCodeAt(0) - 48);\
  \}\
  return total;\
\}\
\
// Distance rule: combine digit-sum of any numbers found + letter values.\
// Example: "5 FURLONGS" => 5 + F(8)+U(6)+...+S(3)\
function distanceBaseValue(distanceText) \{\
  const digitsSum = sumDigitsInString(distanceText);\
  const lettersSum = sumLettersValue(distanceText);\
  return digitsSum + lettersSum;\
\}\
\
function calculateNumerology(\{\
  date, month, year, centre, day, distance, time, participants\
\}) \{\
  // Basic parsed inputs\
  const dd = toIntStrict(date, "Date (DD)");\
  const mm = toIntStrict(month, "Month (MM)");\
  const yyyy = toIntStrict(year, "Year (YYYY)");\
  const p = toIntStrict(participants, "Participants");\
\
  // From doc examples: reduce date digits (30 -> 3), reduce year digits (2023 -> 7)\
  const dateReduced = reduceToSingleDigit(dd);\
  const yearReduced = reduceToSingleDigit(yyyy);\
\
  // 1) DATE \'d7 MONTH (using reduced date) then reduce\
  // 2) DATE \'d7 YEAR (using reduced year) then reduce\
  // 3) A = reduce(part1 + part2)\
  const part1 = reduceToSingleDigit(dateReduced * mm);\
  const part2 = reduceToSingleDigit(dd * yearReduced);\
  const A = reduceToSingleDigit(part1 + part2);\
\
  // 2) CENTRE: sum letters, then B = (centreSum \'d7 dateReduced) + A\
  const centreSum = sumLettersValue(centre);\
  const B = (centreSum * dateReduced) + A;\
\
  // 3) DAY: reduce(dayLettersSum) + dateReduced -> reduce\
  const daySum = sumLettersValue(day);\
  const dayVal = reduceToSingleDigit(reduceToSingleDigit(daySum) + dateReduced);\
\
  // 4) DISTANCE: reduce(distanceBase) + dayVal -> reduce\
  const distBase = distanceBaseValue(distance);\
  const distVal = reduceToSingleDigit(reduceToSingleDigit(distBase) + dayVal);\
\
  // 5) TIME: reduce(digits sum) + dateReduced + distVal -> reduce\
  const timeDigitsSum = sumDigitsInString(time);\
  const timeVal = reduceToSingleDigit(reduceToSingleDigit(timeDigitsSum) + dateReduced + distVal);\
\
  // 6) PARTICIPANTS: p \'d7 dateReduced \'d7 timeVal \'d7 p, then divide by B (integer quotient)\
  const numerator = p * dateReduced * timeVal * p;\
  const answer = (B === 0) ? null : Math.floor(numerator / B);\
  const remainder = (B === 0) ? null : (numerator % B);\
\
  return \{\
    inputs: \{ dd, mm, yyyy, centre, day, distance, time, participants: p \},\
    intermediate: \{\
      dateReduced,\
      yearReduced,\
      step1: \{ part1, part2, A \},\
      centreSum,\
      B,\
      daySum,\
      dayVal,\
      distBase,\
      distVal,\
      timeDigitsSum,\
      timeVal,\
      numerator\
    \},\
    result: \{ answer, remainder \}\
  \};\
\}\
\
function fmt(obj) \{\
  return JSON.stringify(obj, null, 2);\
\}\
\
// Wire up UI\
document.getElementById("calcBtn").addEventListener("click", () => \{\
  const output = document.getElementById("output");\
  try \{\
    const res = calculateNumerology(\{\
      date: document.getElementById("date").value,\
      month: document.getElementById("month").value,\
      year: document.getElementById("year").value,\
      centre: document.getElementById("centre").value,\
      day: document.getElementById("day").value,\
      distance: document.getElementById("distance").value,\
      time: document.getElementById("time").value,\
      participants: document.getElementById("participants").value\
    \});\
\
    // Print nicely in the output box, including the final "ANSWER"\
    const lines = [];\
    lines.push(`DATE: $\{String(res.inputs.dd).padStart(2,"0")\}.$\{String(res.inputs.mm).padStart(2,"0")\}.$\{res.inputs.yyyy\}`);\
    lines.push(`CENTRE: $\{String(res.inputs.centre || "").trim()\}`);\
    lines.push(`DAY: $\{String(res.inputs.day || "").trim()\}`);\
    lines.push(`DISTANCE: $\{String(res.inputs.distance || "").trim()\}`);\
    lines.push(`TIME: $\{String(res.inputs.time || "").trim()\}`);\
    lines.push(`PARTICIPANTS: $\{res.inputs.participants\}`);\
    lines.push("");\
    lines.push(`ANSWER: $\{res.result.answer === null ? "Cannot divide by 0 (B=0)" : res.result.answer\}`);\
    if (res.result.answer !== null) lines.push(`(remainder: $\{res.result.remainder\})`);\
    lines.push("");\
    lines.push("---- Debug / Steps ----");\
    lines.push(fmt(res.intermediate));\
\
    output.textContent = lines.join("\\n");\
  \} catch (err) \{\
    output.textContent = `Error: $\{err.message\}`;\
  \}\
\});\
\
document.getElementById("clearBtn").addEventListener("click", () => \{\
  ["date","month","year","centre","day","distance","time","participants"].forEach(id => \{\
    document.getElementById(id).value = "";\
  \});\
  document.getElementById("output").textContent = "Enter values and click Calculate.";\
\});\
}