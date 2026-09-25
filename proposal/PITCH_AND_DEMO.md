# Pitch (5 minutes + 3 of questions) and demo video (≤ 2 minutes)

## Final pitch: 5 minutes, maps to the judging criteria

| Min | Slide | Say / show | Criterion hit |
|---|---|---|---|
| 0:00 | **A real forward** | Put a WhatsApp screenshot on screen: «اطلبوا العلم ولو بالصين… انشرها أمانة في رقبتك». "Who in this room has received one of these this week?" | Problem clarity |
| 0:30 | **The gap** | Today: ask a scholar (slow), search a hadith database (needs exact wording, fails on screenshots and typos), or ask a chatbot (may invent a reference). | Innovation vs alternatives |
| 1:00 | **Live demo** | Upload the screenshot → verdict card: fabricated, al-Albani al-Da'ifa 416, authentic alternative Muslim 2699, forwarding-pressure warning, ready reply → press "Send via WhatsApp". | Technical quality, UX |
| 2:00 | **Misquoted verse** | `/?ex=1`: word-level diff, «إذا صبروا» struck through, سورة الأنفال 46. | AI doing a real job |
| 2:20 | **Honesty** | `/?ex=3`: invented hadith → "not found ≠ fabricated, refer to a specialist". `/?ex=4`: disputed, each grader named. | Reliability 15% |
| 2:50 | **How it works** | Diagram: normalize → retrieve → align → decide → explain. "Sources decide, never the AI." The LLM only finds quotes. | Technical 25% |
| 3:20 | **Evidence** | Results table: held-out accuracy, 0 critical errors, 98.5% vs 0% on noisy text, identical repeated runs, user-test time-to-verdict. | Benefit per track criterion 20% |
| 4:10 | **Running it** | $0 pilot / ≈$100 per month at 300k checks, single Docker image, weekly specialist review, Telegram bot, open API. | Operational realism 10% |
| 4:40 | **Close** | "Thabat gives every Muslim the scholar's first question, *what is the source?*, in one second, and it says 'I don't know' when it doesn't." Show what was built 4–6 Oct vs baseline. | Presentation clarity 5% |

Likely questions to prepare for: coverage beyond 9 books; who reviews the register; how gradings of full narrations vs fragments are handled (R014); cost of the LLM; why not a chatbot; how the four content levels map.

## Demo video script (1:55)

| Time | Visual | Voice-over (Arabic; English subtitles) |
|---|---|---|
| 0:00–0:10 | Phone: a WhatsApp group, a forward arrives | «وصلتك رسالة فيها حديث… هل تعيد إرسالها؟» |
| 0:10–0:30 | Screenshot uploaded to Thabat; OCR fills the bubble | «ارفع لقطة الشاشة؛ تُقرأ على جهازك دون رفعها.» |
| 0:30–0:55 | Result cards: fabricated + authentic alternative; authentic Muslim 223 with the highlighted phrase | «لكل نص: مصدره، وحكم المحققين بأسمائهم، وبديل صحيح.» |
| 0:55–1:10 | Misquoted verse diff | «ويكشف تحريف لفظ الآيات كلمةً كلمة.» |
| 1:10–1:25 | Invented hadith → not found | «وإن لم يجد مصدرًا قالها بصراحة وأحالك إلى مختص.» |
| 1:25–1:40 | Reply card, language switch ar → en → id, "Send via WhatsApp" | «وردّ لطيف جاهز بخمس لغات.» |
| 1:40–1:55 | Logo + "0 critical errors · 98.5% · open source" + URL | «ثَبَت: تحقّق قبل أن تنشر.» |
