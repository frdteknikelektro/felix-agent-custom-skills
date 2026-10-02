---
name: daily-standup-meeting-jala
description: >-
  Create and maintain standup minutes only when a participant explicitly invokes
  this skill during the live Jala Daily Standup Technology meeting.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  match: daily-standup-meeting-jala
---

# Jala Daily Standup Minutes

## Applicability

No permissions required. Use only during the live Jala Daily Standup Technology
meeting, after a participant explicitly asks to use this skill. The meeting is
online and recurs on weekdays from 9:15 to 10:00 Asia/Jakarta. Do not apply it
to other meetings or ordinary work updates. Once activated, keep using it for
checkpoint and close handoffs in this meeting until its note is complete; the
participant does not need to invoke it again for every update.

## Note lifecycle

Update the existing `{thread_dir}/GPT_LIVE_NOTES.md` for this Live thread. This
file is the meeting note; do not create a separate minutes file or write to a
linked Google document or sheet. Do not delegate note-writing to another agent.

At activation, read the current event, relevant transcript, and existing note.
Preserve unrelated useful session notes. Create one dated section titled
`Daily Standup Minutes — YYYY-MM-DD (In progress)` on Tuesday, or
`Notulen Daily Standup — YYYY-MM-DD (Berlangsung)` on other weekdays, if the
current meeting has no section yet. Use the meeting date in Asia/Jakarta.

At each harness checkpoint, read the existing note and latest transcript, then
merge newly spoken updates into that same dated section. Correct or complete an
existing entry when later speech clarifies it; do not duplicate updates or
replace unrelated note content. GPT Live sends checkpoint handoffs at natural
pauses and one final handoff when the meeting closes.

Mark the section `Complete` on Tuesday or `Selesai` on other weekdays when the
host clearly closes the meeting or a participant explicitly asks to finish the
minutes. A pause or a speaker finishing their own update is not meeting close.
If a checkpoint adds no new information, leave the note unchanged.

## Minutes content

Include a Participants section using the current event roster and live transcript.
Separate confirmed attendees from invited-but-unconfirmed people when status is
available. If the current roster is unavailable, use the reference below only as
an invitee list and mark attendance unconfirmed; identify speakers from the live
transcript without inferring the rest.

Write concise minutes grouped by team when known, then by speaker. Record each
person's `Y` (yesterday) and `T` (today) update. Add decisions and action items
when they are explicitly stated. For an action, include its owner and due date
only when stated. Keep proposals distinct from decisions; label unclear details
as uncertain instead of guessing.

Use separate Updates, Decisions, and Actions sections when they have content.
Within Updates, keep each speaker's `Y` and `T` together. Use the corresponding
Indonesian headings (`Pembaruan`, `Keputusan`, `Tindak lanjut`) on non-Tuesdays.

Use English when the meeting falls on Tuesday and Indonesian on other weekdays,
based on the meeting date in Asia/Jakarta. Keep the note in that language unless
the speaker asks otherwise. Translate the section title, headings, and status
to match that language.

Summarize rather than transcribe. Exclude greetings, side conversation, and
personal details that do not affect the standup. Do not treat old task sheets,
example transcripts, screenshots, or historic attendee lists as current meeting
facts. Use the live event's roster for current attendance and the current
transcript for updates and discussion.

## Known participant roster

The calendar screenshot supplied for 2026-09-29 showed these invitees. Use it
to recognize participant names, not as proof of attendance at another meeting.

- Regina Venska Ardiana (organizer)
- Ignasius Dhama Wahyu Saputra
- Gina Ho
- Dany Muhammad Ghaly
- Dhani Praditya (shown as dhanipraditya@gmail.com)
- Dika Mahendra
- Hafizal Shatyaziamawan
- Jihad Maulana Akbar
- Reza Nagita Nurhazizah (shown as rezanagita@gmail.com)
- Annisa Permatasari Ayuningtyas
- Ari Setio Nugroho
- Farid Inawan
- Farid Pangari
- Muhammad Farras Shiddiq
- Gilang Windu Asmara
- Khasin Khafabi
- Nadia Fathimah
- Rio Redyansyah
- Radyan Laksmana Wirawan (shown as wradyanlaksmana@gmail.com)
