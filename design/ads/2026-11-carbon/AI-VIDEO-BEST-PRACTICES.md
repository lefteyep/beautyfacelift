# Realistic AI video: best practices for the Teresa avatar ad

What three tutorial videos and two related sources teach about realistic AI video, and how each point applies to the Carbon-Peeling + Microneedling ad with Teresa ([AVATAR-VIDEO-GUIDE.md](AVATAR-VIDEO-GUIDE.md)). Written 2026-11-04.

## Sources and how far they were read

| Source | What was read |
|---|---|
| Sanji Nai-Chien, [«I Sold a $1,500 AI Commercial in 60 Minutes With Claude Opus 5.5»](https://www.youtube.com/watch?v=MuiUtTvGD8I) | **Full transcript.** Claude writes the prompts, Higgsfield (Soul Cinema, Seedream, Seedance 2.5) generates; 16 reference images, 17 video generations. |
| JOEY (@noisygroup), [«How to Make Realistic AI Videos (Claude Skills for Camera Tech, Character Design, Better Outputs)»](https://www.youtube.com/watch?v=8g3Z1geC8BU) | **Title only.** YouTube refused automated access. The method is taken from a [written summary of JOEY's pipeline](https://moderncreator.app/2026-05-11-joey-the-two-claude-skills-that-run-our-entire-ai-video-pipeline) (two Claude skills: one for image prompts and character sheets, one for video prompts with camera, lens and grade). |
| kaye.creatives, [«The Secret to Perfect AI Realism in 2026 (Full Workflow)»](https://www.youtube.com/watch?v=Q1FM14f1DBI) | **Title only.** The transcript and the creator's Higgsfield breakdown page were not reachable. **Not reflected below**; paste the transcript (YouTube → «…mehr» → «Transkript anzeigen») to add it. |
| Higgsfield, [Seedance 4K case study](https://higgsfield.ai/blog/seedance4k-breakdown) | First part: reference sheets, prompt sections, camera language, locks. |
| Marxx guides (see [AVATAR-VIDEO-GUIDE.md](AVATAR-VIDEO-GUIDE.md), section 1) | Already applied in the first version of the guide. |

## The best practices, applied

### A. Build the assets before any shot

1. **Character sheet first.** Make one image with three views of the same person (front, three-quarter, close-up), with the same clothes and proportions. Tell the model the views are one person (Sanji; JOEY; Higgsfield).
   → Generate a **Teresa sheet** from her consented photos, wearing exactly the look of the approved clip: white short-sleeved tunic with a round neck, drop earrings, red lipstick, wavy blond hair. Everything else starts from this sheet (prompt S1 in the guide).
2. **The reference's light travels into the video.** If the sheet looks like a glossy studio portrait, the person looks pasted in. A sheet in plain window light and room light gives real skin (Sanji). The Higgsfield case study adds that a plain neutral background works better than white or black.
   → The sheet uses a plain warm light-grey wall, soft window light from the left and a warm ceiling lamp, with no flash and no ring light.
3. **Locations are empty.** Generate the set without people or anything that moves; the action comes from the video prompt. A wide three-quarter view gives the model depth (Sanji; Higgsfield).
   → Generate an **empty studio plate** (treatment bed, window on the left, cabinet) from the page image. It is Intone's location image and Seedance's location reference (prompt S2).
4. **Get the cheap things approved before the expensive ones.** Sanji had the client approve the prop before building six scenes on it.
   → **Teresa approves the sheet and the two start images before any talking clip is made.** If she dislikes her likeness, only a few images are lost, not a set of videos.
5. **One style block, pasted into every prompt.** If the camera is described differently each time, the shots look like different ads (Sanji).
   → The realism block from [prompts.md](prompts.md) stays. One camera is fixed for every talking shot: full-frame, 35 mm, tripod at eye level. The first version mixed «working photographer, Fujifilm 35 mm» with «filmed with a phone». That is a contradiction (see 9), and the new prompts remove it.

### B. Write prompts like a shooting script

6. **Labelled sections in a fixed order** (Sanji; Higgsfield):
   1. scene in one sentence;
   2. references by number, attached in the same order every time;
   3. location map;
   4. first frame;
   5. format (one continuous take or timed cuts);
   6. camera and lens;
   7. action to the second;
   8. performance;
   9. light and colour;
   10. audio;
   11. **positive locks** at the end.

   → The new Seedance prompts (S5, S6) follow this order.
7. **References have a job.** Say what each one gives, for example «image 2 for geography, materials and lighting, not for framing». Without that, the model copies the reference's camera angle (Sanji).
8. **Real camera language:** lens in mm or field of view, shot size (MCU, CU), and the rig (locked-off tripod, or handheld with micro-drift) (JOEY; Higgsfield).
   → Talking shots are a 35 mm MCU on a locked tripod. The device close-ups use 50 mm.
9. **Read every prompt for contradictions.** The model doesn't report a conflict; it picks one side. When you change a rule, check the whole prompt for the old wording (Sanji).
10. **Locks protect only what would ruin the shot.** Repeat those few things at the bottom; don't list every rule (Sanji).
    → For Teresa: same face and age, same tunic, hands out of frame, camera still, window on the left, mouth follows her voice.
11. **Small, real reactions.** Overacting makes the scene look like a cartoon (Sanji).
    → Teresa explains calmly: small nods, normal blinking, no big gestures, no wide smile.

### C. Generate cheaply, check precisely

12. **Draft first.** Seedance 2.5 can generate a 480p draft at about a quarter of the price, then finalise the chosen take in 1080p within seven days (Sanji; Higgsfield model settings `draft` and `draft_job_id`).
    → Every Seedance clip goes through a draft first; only keepers are finalised.
13. **A rerun fixes bad luck, not a bad prompt.** If two takes fail the same way, change the prompt (Sanji).
14. **Check against the script, second by second.** Then zoom in on skin, hair and fabric to look for AI artefacts (Sanji; Higgsfield).
15. **Track seconds per shot** to budget credits (JOEY). This ad needs about 25 s of talking clips plus optional device clips.
16. **Check on a phone-shaped frame.** Faces, hands and the product must stay readable. Use Higgsfield **Reframe** instead of a hard crop when a 3:4 clip loses the brush or a face at 9:16 (Sanji).

### D. Edit and deliver

17. **Plan the variations before generating.** The three hooks share one body, so they cost three short clips, not three ads (Sanji). This was already in the guide.
18. **Generated sound is only what's in the scene.** Music, titles and the logo go in during the edit (Sanji).
    → Teresa's own voice, plus room tone, typed text layers and the price block in the edit.
19. **Hide the impossible in the cut.** No morphs and no glows (Sanji).
    → No transitions or effects on Teresa; hard cuts between talking and b-roll.
20. **Keep the assets.** The sheet, the studio plate and the prompts can serve a later campaign (Sanji). For Teresa this needs her new consent, because the current consent covers this campaign only.

## Not adopted, and why

- **Sell a story instead of features** (Sanji, for a TV brand). This is a local service with a fixed offer; the trust comes from Teresa explaining it herself. The "story" here is how the 90 minutes run.
- **Skin-type or result hooks.** Ruled out by Meta's rules and the project's copy rules (guide, section 3.3).
- **AI people other than Teresa.** No generated clients speak, and there are no testimonials. The fictional client only appears in b-roll.
